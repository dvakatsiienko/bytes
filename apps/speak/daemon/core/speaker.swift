// runs one read: each chunk through its candidates, onto the player. the engines, the player and the pill are handed in
import Foundation

// the engines, as a read hears them
@MainActor
protocol ChunkVoices: AnyObject {
    // returns once the chunk is played or on its way to the player; `onAudio` once, at its first sound, told whether the
    // engine was asked for it or it was kept from before
    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping (_ isCached: Bool) -> Void) async throws
    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig)
    // what was asked ahead and not used yet
    func dropAhead()
    func hasKey(_ engine: Engine) -> Bool
    func reloadMissingKeys()
    func balances(_ settings: (Engine) -> EngineConfig) async -> [Engine: Balance]
    func restartServer(of engine: Engine)
}

@MainActor
protocol SpeechPill: AnyObject {
    // a read that begins shows it; one that ends takes it along, unless stick holds it
    func follow(_ playback: Playback)
    // gone whatever it showed, unless stick holds it
    func leave()
    // a line in its own voice where the sentence stands, until the next one or the read's end
    func noticed(_ notice: PillModel.Notice)
    // a chunk handed to the player, its sound starting at `start` seconds into the read at 1×
    func queues(_ text: String, from start: Double)
    // the engine whose sound is heard now: the pill's speed is its own
    func heard(_ engine: Engine)
}

@MainActor
final class Speaker: ReadTarget {
    private let player: Player
    private let voices: any ChunkVoices
    private let pill: any SpeechPill
    private let saved: () -> Config
    private let toChunks: (String) -> [Chunk]
    private let onRead: (ReadRecord) -> Void
    private let write: (String) -> Void
    // the read that plays, unless it is a preview or a one-shot
    private var tally: ReadTally?
    // engine → when it may be tried again; a failure costs its time once, then nothing until the reset
    private var skipUntil: [Engine: Date] = [:]
    // cleared by the engine's next success, so a monthly reset heals itself
    private var outOfQuota: [Engine: QuotaHold] = [:]
    private var quotaProbedAt: Date?
    private var probes = 0
    private(set) var playback = Playback.idle
    private(set) var order = 0
    private var job: Task<Void, Never>?
    // numbers each read: a log line and an ended read name theirs, so two at once show, and an old one ends nothing
    private var reads = 0
    // a preview's unsaved card settings, in force for that one job
    private var draft: (engine: Engine, settings: EngineConfig)?

    private func settings(_ engine: Engine) -> EngineConfig {
        var settings = draft.flatMap { $0.engine == engine ? $0.settings : nil } ?? saved()[engine]
        settings.gain *= saved().volume / 100
        return settings
    }

    // the admin asks every few seconds: a status older than 10 min refreshes the quota behind this answer
    func health() -> [String: Health] {
        if quotaProbedAt.map({ Date().timeIntervalSince($0) > 600 }) ?? true { Task { await probeQuota() } }
        var result: [String: Health] = [:]
        for engine in Engine.allCases {
            let needsKey = engine.isCloud && !voices.hasKey(engine)
            let until = skipUntil[engine].flatMap { $0 > Date() ? $0 : nil }
            let hold = outOfQuota[engine].flatMap { $0.until > Date() ? $0 : nil }
            result[engine.rawValue] = needsKey ? Health(state: .noKey)
                : hold.map { Health(state: .noQuota, note: $0.note) }
                ?? until.map { Health(state: .benched, until: ISO8601DateFormatter().string(from: $0)) } ?? Health(state: .live)
        }
        return result
    }

    init(player: Player, voices: any ChunkVoices, pill: any SpeechPill, settings saved: @escaping () -> Config, toChunks: @escaping (String) -> [Chunk], onRead: @escaping (ReadRecord) -> Void = { _ in }, log write: @escaping (String) -> Void) {
        self.player = player
        self.voices = voices
        self.pill = pill
        self.saved = saved
        self.toChunks = toChunks
        self.onRead = onRead
        self.write = write
    }

    // the next press can use it
    func serverIsWarm(of engine: Engine) { skipUntil[engine] = nil }

    private func happened(_ event: PlaybackEvent) {
        let before = playback
        playback = next(before, event)
        if case .began = event { player.readBegan() }
        if playback.isPaused != before.isPaused { playback.isPaused ? player.pause() : player.resume() }
        if playback != before { pill.follow(playback) }
    }

    func togglePause() { happened(.pausePressed) }

    @discardableResult
    func takeOrder() -> Int {
        order += 1
        return order
    }

    private func cut(_ outcome: ReadRecord.Outcome) {
        takeOrder()
        // what it was is known before the stop, and the file waits until after it
        let record = closed(outcome)
        if isSpeaking { write("read \(reads): stopped") }
        job?.cancel()
        voices.dropAhead()
        player.stop()
        draft = nil
        record.map(onRead)
    }

    // a preview ignores the bench: dima asked to hear this engine, so it is tried even when benched
    // answers the read's number
    func preview(_ text: String, with engine: Engine, settings: EngineConfig) -> Int {
        cut(.overtaken)
        draft = (engine, settings)
        return speak(toChunks(text), only: engine, pressed: .now)
    }

    var isSpeaking: Bool { playback != .idle }
    var isPaused: Bool { playback.isPaused }

    func silence() {
        cut(.stopped)
        isSpeaking ? happened(.stopped) : pill.leave()
    }

    func read(_ parts: [Chunk], from app: String?, pressed: ContinuousClock.Instant) {
        if isSpeaking { cut(.overtaken) } else { takeOrder() }
        tally = ReadTally(time: Date(), app: app)
        speak(parts, only: nil, pressed: pressed)
        voices.reloadMissingKeys()
    }

    // the control socket's read: whatever sounds is cut, and no key is looked for
    func readGiven(_ parts: [Chunk]) {
        cut(.overtaken)
        tally = ReadTally(time: Date(), app: nil)
        speak(parts, only: nil, pressed: .now)
    }

    private func closed(_ outcome: ReadRecord.Outcome) -> ReadRecord? {
        defer { tally = nil }
        return tally?.record(outcome, heard: player.played.heard, position: player.played.position, sound: player.sound, dropped: player.dropped)
    }

    // the providers' balance calls cost nothing: a card shows the real quota before a press finds it, and an empty
    // engine sits benched until its refill instead of spending ~1 s of every press on a refusal
    func probeQuota() async {
        quotaProbedAt = Date()
        probes += 1
        let mine = probes, known = outOfQuota
        let balances = await voices.balances(settings)
        guard mine == probes else { return }
        // an answer asked for before a refusal, or before the engine spoke again, says nothing of it
        for (engine, balance) in balances where outOfQuota[engine] == known[engine] {
            let before = outOfQuota[engine]
            let hold = after(balance, before, now: Date())
            outOfQuota[engine] = hold
            if balance.empty != nil || hold == nil && before != nil { skipUntil[engine] = hold?.until }
        }
    }

    @discardableResult
    func speak(_ parts: [Chunk], only: Engine?, pressed: ContinuousClock.Instant) -> Int {
        reads += 1
        let read = reads
        happened(.began(read))
        job = Task {
            var isFirst = true
            // the engine the pill last said reads in the chain's first one's place
            var toldFellThrough: Engine?
            // a cloud engine that missed chunk 1's budget never takes over mid-read once audio is playing
            var lead: Engine?
            // the lead, once it answered itself: one heard from before alone may still hang
            var proven: Engine?
            // a preview asks an engine benched before it began
            let ignored = only == nil ? [:] : skipUntil
            let benched = { self.skipUntil.filter { ignored[$0.key] != $0.value } }
            for (index, chunk) in parts.enumerated() {
                // a stopped read ends here
                if Task.isCancelled { return }
                let part = "read \(read): chunk \(index + 1)/\(parts.count)"
                if chunk.isCodeBlock {
                    // told once the sound before it is heard, before the next chunk is asked for
                    await player.drained()
                    if Task.isCancelled { return }
                    write("\(part): a code block, skipped")
                    pill.noticed(.codeBlock)
                    continue
                }
                write(part)
                tally?.began(chunk.text, start: player.sound)
                pill.queues(chunk.text, from: player.sound)
                let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: benched(), lead: lead, now: Date())
                if let server = rendersAhead(engines, lead: proven, isPlaying: player.isPlaying) {
                    voices.openAhead(chunk, with: server, settings: settings(server))
                }
                let firstAudioMs = saved().firstAudioMs
                let newBudget = { firstAudioBudgetEnds(isPlaying: self.player.isPlaying, firstAudioMs: firstAudioMs, now: .now) }
                var budgetEnds = newBudget()
                for engine in engines + lastResorts(chain: saved().chain, lang: chunk.lang, only: only, after: engines) {
                    var isHeard = false
                    // a sound kept from before says nothing of the engine's health
                    var wasAsked = true
                    let deadline: Duration?
                    switch firstAudioWait(for: engine, among: engines, lead: proven, firstAudioMs: firstAudioMs, budgetEnds: budgetEnds, now: .now) {
                    case .skip: continue
                    case .asLongAsItTakes: deadline = nil
                    case .atMost(let wait): deadline = wait
                    }
                    let asked = ContinuousClock.now
                    let stopped = { if isHeard { self.write("\(part) → \(engine.rawValue), stopped") } }
                    do {
                        try await voices.speak(chunk, with: engine, settings: { self.settings(engine) }, deadline: deadline) { isCached in
                            if isFirst { self.write("first audio: \(engine.rawValue) \(elapsed(pressed))\(isCached ? ", kept" : "")") }
                            self.pill.heard(engine)
                            // the chain's own first voice out of quota: the pill says who reads instead, once per voice
                            if let first = self.saved().chain[chunk.lang]?.first, first != engine, only == nil, toldFellThrough != engine,
                               self.outOfQuota[first].map({ $0.until > Date() }) == true {
                                self.pill.noticed(.fellThrough(from: first, to: engine))
                                toldFellThrough = engine
                            }
                            isFirst = false
                            isHeard = true
                            wasAsked = !isCached
                            self.tally?.heard(engine)
                            if engine.facts.streams, parts.indices.contains(index + 1) { self.openAhead(parts[index + 1], with: engine, only: only, benched: benched()) }
                        }
                        // a voice may return normally from a stop
                        if Task.isCancelled { return stopped() }
                        if wasAsked { outOfQuota[engine] = nil }
                        if isHeard, wasAsked, only != nil || engine.facts.isLocalServer { skipUntil[engine] = nil }
                        // a cloud voice with nothing to say, «…», leads nothing
                        if isHeard || !engine.isCloud {
                            if let lead, lead != engine { write("voice switch: \(lead.rawValue) → \(engine.rawValue) mid-read") }
                            lead = engine
                            if wasAsked { proven = engine } else if proven != engine { proven = nil }
                        }
                        if isHeard { write("\(part) → \(engine.rawValue)") }
                        break
                    } catch {
                        if Task.isCancelled { return stopped() }
                        if isHeard { write("\(part) → \(engine.rawValue), cut off") }
                        // a stream cut off by its own deadline can say «cancelled»: the read goes on
                        handle(error is CancellationError ? EngineError.timeout : error, from: engine)
                        // a chunk that was heard is never read again by the next engine
                        if isHeard { break }
                        // a wait that was never the cloud's budget takes none of it and gives none back
                        if !isOnBudget(engine, lead: proven) {
                            budgetEnds = budgetEnds.map { $0 + (.now - asked) } ?? newBudget()
                        } else if budgetEnds == nil {
                            budgetEnds = player.quietSince.map { $0 + .milliseconds(firstAudioMs) }
                        }
                    }
                }
                tally?.ended(end: player.sound)
            }
            await player.drained()
            if !Task.isCancelled {
                closed(.finished).map(onRead)
                write("read \(read): ended")
                draft = nil
                // what was asked ahead and never played is for no one
                voices.dropAhead()
                player.idle()
                happened(.ended(read))
            }
        }
        return read
    }

    // only where the engine goes first on the next chunk too
    private func openAhead(_ chunk: Chunk, with engine: Engine, only: Engine?, benched: [Engine: Date]) {
        guard !chunk.isCodeBlock else { return }
        let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: benched, lead: engine, now: Date())
        if engines.first == engine { voices.openAhead(chunk, with: engine, settings: settings(engine)) }
    }

    private func handle(_ error: Error, from engine: Engine) {
        let decision = bench(for: error, from: engine)
        if let seconds = decision.seconds { skipUntil[engine] = Date().addingTimeInterval(seconds) }
        if let message = decision.quota {
            outOfQuota[engine] = refused(message, now: Date())
            // the refusal knows no refill date; the probe does, and benches the engine until then instead of for an hour
            Task { await probeQuota() }
        }
        // off the hot path
        if decision.restartsServer { voices.restartServer(of: engine) }
        write("\(engine.rawValue) skipped: \(error)\(decision.seconds.map { ", off for \(Int($0)) s" } ?? "")")
        if case EngineError.status(let code) = error, let note = engine.type.refusalNote(status: code, model: settings(engine).model) { write(note) }
    }
}
