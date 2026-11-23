import Foundation

@MainActor
final class Speaker: ReadTarget {
    private let player: Player
    private let macVoice: MacVoice
    private let panel: Panel
    private let keys: Keys
    private let kokoro: KokoroServer
    private let saved: () -> Config
    private var outputs: [any SpeechOutput] { [player, macVoice] }
    // engine → when it may be tried again; a failure costs its time once, then nothing until the reset
    private var skipUntil: [Engine: Date] = [:]
    // engine → the provider's quota message; cleared by the engine's next success, so a monthly reset heals itself
    private var outOfQuota: [Engine: String] = [:]
    private var quotaProbedAt: Date?
    private var job: Task<Void, Never>?
    // numbers each read in the log, so two reads talking at once show as two numbers interleaved
    private var reads = 0
    private var kokoroPrefetch: (text: String, task: Task<Data, Error>)?
    // the next chunk's request, opened once this one is heard: its first-audio wait (0.5–3 s on fish's free tier)
    // hides behind the audio instead of sitting between two sentences
    private var cloudPrefetch: (engine: Engine, text: String, task: Task<(URLSession.AsyncBytes, URLResponse), Error>)?
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
            let needsKey = engine.isCloud && keys[engine] == nil
            let until = skipUntil[engine].flatMap { $0 > Date() ? $0 : nil }
            result[engine.rawValue] = needsKey ? ["state": "no key"]
                : outOfQuota[engine].map { ["state": "no quota", "note": $0] }
                ?? until.map { ["state": "benched", "until": ISO8601DateFormatter().string(from: $0)] } ?? ["state": "live"]
        }
        return result
    }

    init(player: Player, macVoice: MacVoice, panel: Panel, keys: Keys, kokoro: KokoroServer, settings saved: @escaping () -> Config) {
        self.player = player
        self.macVoice = macVoice
        self.panel = panel
        self.keys = keys
        self.kokoro = kokoro
        self.saved = saved
        // the next press can use it
        kokoro.onWarm = { [weak self] in self?.skipUntil[.kokoro] = nil }
        player.onLevels = { [panel] levels, spacing in panel.model.push(levels, spacing: spacing) }
        panel.model.onClose = { [panel] in panel.hide() }
        panel.model.onPause = { [weak self] in self?.togglePause() }
        panel.model.onStop = { [weak self] in self?.silence() }
        panel.model.onUnstick = { [weak self] in
            if self?.isSpeaking == false { self?.panel.hide() }
        }
    }

    func togglePause() {
        guard isSpeaking else { return }
        panel.model.isPaused.toggle()
        outputs.forEach { if panel.model.isPaused { $0.pause() } else { $0.resume() } }
    }

    func stop() {
        if job != nil { log("read \(reads): stopped") }
        job?.cancel()
        cloudPrefetch?.task.cancel()
        cloudPrefetch = nil
        kokoroPrefetch?.task.cancel()
        kokoroPrefetch = nil
        outputs.forEach { $0.stop() }
        job = nil
        draft = nil
    }

    // a preview ignores the bench: dima asked to hear this engine, so it is tried even when benched
    func preview(_ text: String, with engine: Engine, settings: EngineConfig) {
        stop()
        draft = (engine, settings)
        skipUntil[engine] = nil
        speak(chunks(normalize(text)), only: engine, pressed: .now)
    }

    var isSpeaking: Bool { job != nil }
    var isPaused: Bool { panel.model.isPaused }

    func silence() {
        stop()
        panel.speechEnded()
    }

    func read(_ parts: [Chunk], pressed: ContinuousClock.Instant) {
        if job != nil { stop() }
        speak(parts, only: nil, pressed: pressed)
        keys.reloadIfMissing()
    }

    // the providers' balance calls cost nothing: a card shows the real quota before a press finds it, and an empty
    // engine sits benched until its refill instead of spending ~1 s of every press on a refusal
    func probeQuota() async {
        quotaProbedAt = Date()
        let elevenKey = keys[.elevenlabs], fishKey = keys[.fish], fishModel = settings(.fish).model ?? "s2.1-pro-free"
        async let eleven = Quota.elevenlabs(key: elevenKey)
        async let fish = Quota.fish(key: fishKey, model: fishModel)
        for (engine, quota) in [(Engine.elevenlabs, await eleven), (.fish, await fish)] {
            switch quota {
            case .empty(let message, let until)?:
                outOfQuota[engine] = message
                skipUntil[engine] = until
            case .left? where outOfQuota[engine] != nil:
                outOfQuota[engine] = nil
                skipUntil[engine] = nil
            default: break
            }
        }
    }

    func speak(_ parts: [Chunk], only: Engine?, pressed: ContinuousClock.Instant) {
        // real speech ends the admin's infinite waveform: the meter goes back to the sound
        panel.stopWave()
        panel.show()
        reads += 1
        let read = reads
        job = Task {
            var isFirst = true
            // a cloud engine that missed chunk 1's budget never takes over mid-read once audio is playing
            var lead: Engine?
            for (index, chunk) in parts.enumerated() {
                // the mac voice and kokoro finish a chunk normally even after a stop, so a stopped read ends here
                if Task.isCancelled { return }
                log("read \(read): chunk \(index + 1)/\(parts.count)")
                let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: skipUntil, lead: lead, now: Date())
                if rendersKokoroAhead(engines, lead: lead, isPlaying: player.isPlaying) {
                    let voice = settings(.kokoro).voice(for: .en)
                    kokoroPrefetch = (chunk.text, Task { try await kokoro.pcm(chunk.text, voice: voice) })
                }
                let budgetEnds = firstAudioBudgetEnds(isPlaying: outputs.contains { $0.isBusy }, firstAudioMs: saved().firstAudioMs, now: .now)
                for engine in engines {
                    let deadline: Duration?
                    switch firstAudioWait(for: engine, among: engines, lead: lead, budgetEnds: budgetEnds, now: .now) {
                    case .skip: continue
                    case .asLongAsItTakes: deadline = nil
                    case .atMost(let wait): deadline = wait
                    }
                    do {
                        try await speak(chunk, with: engine, deadline: deadline) {
                            if isFirst { log("first audio: \(engine.rawValue) \(elapsed(pressed))") }
                            isFirst = false
                            if engine.streams, parts.indices.contains(index + 1) { self.openAhead(parts[index + 1], with: engine) }
                        }
                        outOfQuota[engine] = nil
                        if let lead, lead != engine { log("voice switch: \(lead.rawValue) → \(engine.rawValue) mid-read") }
                        lead = engine
                        break
                    } catch is CancellationError {
                        return
                    } catch {
                        if Task.isCancelled { return }
                        handle(error, from: engine)
                    }
                }
            }
            await player.drained()
            if !Task.isCancelled {
                job = nil
                draft = nil
                player.idle()
                panel.speechEnded()
            }
        }
    }

    private func handle(_ error: Error, from engine: Engine) {
        let decision = bench(for: error, from: engine)
        if let seconds = decision.seconds { skipUntil[engine] = Date().addingTimeInterval(seconds) }
        if let message = decision.quota {
            outOfQuota[engine] = message
            // the refusal knows no refill date; the probe does, and benches the engine until then instead of for an hour
            Task { await probeQuota() }
        }
        // off the hot path
        if decision.restartsKokoro { Task { await kokoro.warm() } }
        log("\(engine.rawValue) skipped: \(error)\(decision.seconds.map { ", off for \(Int($0)) s" } ?? "")")
        if decision.mayEndFishFreeTier, case EngineError.status(let code) = error {
            log("⚠️ FISH REFUSED \(settings(.fish).model ?? "s2.1-pro-free") (\(code)): the free tier may have ended; the chain falls through for an hour; check fish.audio")
        }
    }

    private func speak(_ chunk: Chunk, with engine: Engine, deadline: Duration?, onAudio: @escaping () -> Void) async throws {
        switch engine {
        case .system:
            await player.drained()
            try Task.checkCancellation()
            await macVoice.speak(chunk, settings(.system), onFirstWord: onAudio)
        case .gemini:
            // read once: a save while it renders waits for the next chunk
            let settings = settings(.gemini)
            let pcm = try await geminiPCM(chunk, key: keys[.gemini], settings: settings)
            try Task.checkCancellation()
            try player.schedule(pcm, settings)
            onAudio()
        // the kokoro server answers only once the whole chunk is rendered, so there is nothing to stream
        case .kokoro:
            let prefetched = kokoroPrefetch.flatMap { $0.text == chunk.text ? $0.task : nil }
            kokoroPrefetch = nil
            let pcm = if let prefetched { try await prefetched.value } else { try await kokoro.pcm(chunk.text, voice: settings(.kokoro).voice(for: .en)) }
            // a render that lands after a stop never reaches the player
            try Task.checkCancellation()
            try player.schedule(pcm, settings(.kokoro))
            onAudio()
        default:
            let ahead = cloudPrefetch.flatMap { $0.engine == engine && $0.text == chunk.text ? $0.task : nil }
            if ahead == nil { cloudPrefetch?.task.cancel() }
            cloudPrefetch = nil
            let request = try request(for: engine, chunk, key: keys[engine], settings: settings(engine))
            let open = ahead ?? Task { try await URLSession.shared.bytes(for: request) }
            try await stream(open, into: player, settings(engine), deadline: deadline, onAudio: onAudio)
        }
    }

    private func openAhead(_ chunk: Chunk, with engine: Engine) {
        guard let request = try? request(for: engine, chunk, key: keys[engine], settings: settings(engine)) else { return }
        cloudPrefetch?.task.cancel()
        cloudPrefetch = (engine, chunk.text, Task { try await URLSession.shared.bytes(for: request) })
    }
}
