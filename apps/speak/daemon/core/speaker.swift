// runs one read: each chunk through its candidates, onto the player. the engines, the player and the pill are handed in
import Foundation

// the engines, as a read hears them
@MainActor
protocol ChunkVoices: AnyObject {
    // returns once the chunk is played or on its way to the player; `onAudio` once, at its first sound
    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws
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
}

@MainActor
final class Speaker: ReadTarget {
    private let player: Player
    private let voices: any ChunkVoices
    private let pill: any SpeechPill
    private let saved: () -> Config
    private let write: (String) -> Void
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
        draft.flatMap { $0.engine == engine ? $0.settings : nil } ?? saved()[engine]
    }

    // the admin asks every few seconds: a status older than 10 min refreshes the quota behind this answer
    func health() -> [String: [String: String]] {
        if quotaProbedAt.map({ Date().timeIntervalSince($0) > 600 }) ?? true { Task { await probeQuota() } }
        var result: [String: [String: String]] = [:]
        for engine in Engine.allCases {
            let needsKey = engine.isCloud && !voices.hasKey(engine)
            let until = skipUntil[engine].flatMap { $0 > Date() ? $0 : nil }
            let hold = outOfQuota[engine].flatMap { $0.until > Date() ? $0 : nil }
            result[engine.rawValue] = needsKey ? ["state": "no key"]
                : hold.map { ["state": "no quota", "note": $0.note] }
                ?? until.map { ["state": "benched", "until": ISO8601DateFormatter().string(from: $0)] } ?? ["state": "live"]
        }
        return result
    }

    init(player: Player, voices: any ChunkVoices, pill: any SpeechPill, settings saved: @escaping () -> Config, log write: @escaping (String) -> Void) {
        self.player = player
        self.voices = voices
        self.pill = pill
        self.saved = saved
        self.write = write
    }

    // the next press can use it
    func serverIsWarm(of engine: Engine) { skipUntil[engine] = nil }

    private func happened(_ event: PlaybackEvent) {
        let before = playback
        playback = next(before, event)
        if playback.isPaused != before.isPaused { playback.isPaused ? player.pause() : player.resume() }
        if playback != before { pill.follow(playback) }
    }

    func togglePause() { happened(.pausePressed) }

    @discardableResult
    func takeOrder() -> Int {
        order += 1
        return order
    }

    private func cut() {
        takeOrder()
        if isSpeaking { write("read \(reads): stopped") }
        job?.cancel()
        voices.dropAhead()
        player.stop()
        draft = nil
    }

    // a preview ignores the bench: dima asked to hear this engine, so it is tried even when benched
    // answers the read's number
    func preview(_ text: String, with engine: Engine, settings: EngineConfig) -> Int {
        cut()
        draft = (engine, settings)
        skipUntil[engine] = nil
        return speak(chunks(normalize(text)), only: engine, pressed: .now)
    }

    var isSpeaking: Bool { playback != .idle }
    var isPaused: Bool { playback.isPaused }

    func silence() {
        cut()
        isSpeaking ? happened(.stopped) : pill.leave()
    }

    func read(_ parts: [Chunk], pressed: ContinuousClock.Instant) {
        if isSpeaking { cut() } else { takeOrder() }
        speak(parts, only: nil, pressed: pressed)
        voices.reloadMissingKeys()
    }

    // the control socket's read: whatever sounds is cut, and no key is looked for
    func readGiven(_ parts: [Chunk]) {
        cut()
        speak(parts, only: nil, pressed: .now)
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
            // a cloud engine that missed chunk 1's budget never takes over mid-read once audio is playing
            var lead: Engine?
            for (index, chunk) in parts.enumerated() {
                // a stopped read ends here
                if Task.isCancelled { return }
                write("read \(read): chunk \(index + 1)/\(parts.count)")
                let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: skipUntil, lead: lead, now: Date())
                if let server = rendersAhead(engines, lead: lead, isPlaying: player.isPlaying) {
                    voices.openAhead(chunk, with: server, settings: settings(server))
                }
                let firstAudioMs = saved().firstAudioMs
                let newBudget = { firstAudioBudgetEnds(isPlaying: self.player.isPlaying, firstAudioMs: firstAudioMs, now: .now) }
                var budgetEnds = newBudget()
                for engine in engines {
                    var isHeard = false
                    let deadline: Duration?
                    switch firstAudioWait(for: engine, among: engines, lead: lead, firstAudioMs: firstAudioMs, budgetEnds: budgetEnds, now: .now) {
                    case .skip: continue
                    case .asLongAsItTakes: deadline = nil
                    case .atMost(let wait): deadline = wait
                    }
                    let asked = ContinuousClock.now
                    do {
                        try await voices.speak(chunk, with: engine, settings: { self.settings(engine) }, deadline: deadline) {
                            if isFirst { self.write("first audio: \(engine.rawValue) \(elapsed(pressed))") }
                            isFirst = false
                            isHeard = true
                            if engine.facts.streams, parts.indices.contains(index + 1) { self.openAhead(parts[index + 1], with: engine, only: only) }
                        }
                        // a voice may return normally from a stop
                        if Task.isCancelled { return }
                        outOfQuota[engine] = nil
                        // a cloud voice with nothing to say, «…», leads nothing
                        if isHeard || !engine.isCloud {
                            if let lead, lead != engine { write("voice switch: \(lead.rawValue) → \(engine.rawValue) mid-read") }
                            lead = engine
                        }
                        break
                    } catch {
                        if Task.isCancelled { return }
                        // a stream cut off by its own deadline can say «cancelled»: the read goes on
                        handle(error is CancellationError ? EngineError.timeout : error, from: engine)
                        // a chunk that was heard is never read again by the next engine
                        if isHeard { break }
                        // a wait that was never the cloud's budget takes none of it and gives none back
                        if !isOnBudget(engine, lead: lead) {
                            budgetEnds = budgetEnds.map { $0 + (.now - asked) } ?? newBudget()
                        } else if budgetEnds == nil {
                            budgetEnds = player.dryAt.map { $0 + .milliseconds(firstAudioMs) }
                        }
                    }
                }
            }
            await player.drained()
            if !Task.isCancelled {
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
    private func openAhead(_ chunk: Chunk, with engine: Engine, only: Engine?) {
        let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: skipUntil, lead: engine, now: Date())
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
