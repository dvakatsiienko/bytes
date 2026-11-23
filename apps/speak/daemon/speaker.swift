import AppKit
import os

func failure(_ status: Int, _ bytes: URLSession.AsyncBytes) async -> EngineError {
    var body = Data()
    do { for try await byte in bytes { body.append(byte); if body.count > 4096 { break } } } catch {}
    return engineError(status: status, body: body)
}

@MainActor
final class Speaker {
    private let player = Player()
    private let systemVoice = SystemVoice()
    let panel = Panel()
    private var keys: [Engine: String] = [:]
    private var keysLoadedAt: Date?
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
        draft.flatMap { $0.engine == engine ? $0.settings : nil } ?? config[engine]
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

    init() {
        player.onLevels = { [panel] levels, spacing in panel.model.push(levels, spacing: spacing) }
        panel.model.onClose = { [panel] in panel.hide() }
        panel.model.onPause = { [weak self] in self?.togglePause() }
        panel.model.onStop = { [weak self] in
            self?.stop()
            self?.panel.speechEnded()
        }
        panel.model.onUnstick = { [weak self] in
            if self?.isSpeaking == false { self?.panel.hide() }
        }
    }

    func togglePause() {
        guard isSpeaking else { return }
        panel.model.isPaused.toggle()
        if panel.model.isPaused {
            player.pause()
            systemVoice.pause()
        } else {
            player.resume()
            systemVoice.resume()
        }
    }

    func stop() {
        if job != nil { log("read \(reads): stopped") }
        job?.cancel()
        cloudPrefetch?.task.cancel()
        cloudPrefetch = nil
        kokoroPrefetch?.task.cancel()
        kokoroPrefetch = nil
        player.stop()
        systemVoice.stop()
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

    // one op-run per daemon start (~0.8 s), never on the hot path; a key pasted later is picked up within a minute
    func loadKeys() async {
        guard let keysRun = launch.keysRunPath else { return }
        keysLoadedAt = Date()
        let names: [(Engine, String)] = [(.elevenlabs, "ELEVENLABS_API_KEY"), (.fish, "FISH_API_KEY"), (.gemini, "GEMINI_API_KEY")]
        let printf = "printf '%s\\0%s\\0%s' " + names.map { "\"$\($0.1)\"" }.joined(separator: " ")
        let output: String = await Task.detached {
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/bin/sh")
            process.arguments = [keysRun, "/bin/sh", "-c", printf]
            // op run masks secrets in its child's stdout; the keys go straight into this process, never a log
            process.environment = ProcessInfo.processInfo.environment.merging(["OP_RUN_NO_MASKING": "true"]) { $1 }
            let pipe = Pipe()
            process.standardOutput = pipe
            process.standardError = FileHandle.nullDevice
            try? process.run()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            process.waitUntilExit()
            return String(decoding: data, as: UTF8.self)
        }.value
        for (value, (engine, _)) in zip(output.split(separator: "\0", omittingEmptySubsequences: false), names) where !value.isEmpty {
            keys[engine] = String(value)
        }
        log("keys: " + names.map { "\($0.0.rawValue) \(keys[$0.0] == nil ? "missing" : "ok")" }.joined(separator: ", "))
    }

    private var kokoroServer: Process?
    private var isWarmingKokoro = false

    // one warm-up at a time; a finished one lifts kokoro's bench so the next press can use it
    // the providers' balance calls cost nothing: a card shows the real quota before a press finds it, and an empty
    // engine sits benched until its refill instead of spending ~1 s of every press on a refusal
    func probeQuota() async {
        quotaProbedAt = Date()
        async let eleven = elevenlabsQuota()
        async let fish = fishQuota()
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

    // needs the key's «User» permission (user_read); a key without it answers 401 and the card keeps its last state
    private func elevenlabsQuota() async -> Quota? {
        guard let key = keys[.elevenlabs] else { return nil }
        var request = URLRequest(url: URL(string: "https://api.elevenlabs.io/v1/user/subscription")!)
        request.setValue(key, forHTTPHeaderField: "xi-api-key")
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let used = json["character_count"] as? Int, let limit = json["character_limit"] as? Int,
              let reset = json["next_character_count_reset_unix"] as? Double else { return nil }
        // a sentence costs 30–200 credits, so under 100 left a press fails more often than it plays
        guard limit - used < 100 else { return .left }
        let refill = Date(timeIntervalSince1970: reset)
        return .empty("\(limit - used) of \(limit) credits left, refills \(refill.formatted(.dateTime.month(.abbreviated).day()))", until: refill)
    }

    // the free model draws on no balance; a paid one spends the pay-as-you-go api credit, which has no refill date
    private func fishQuota() async -> Quota? {
        guard (settings(.fish).model ?? "s2.1-pro-free").hasSuffix("-free") == false else { return .left }
        guard let key = keys[.fish] else { return nil }
        var request = URLRequest(url: URL(string: "https://api.fish.audio/wallet/self/api-credit")!)
        request.setValue("Bearer \(key)", forHTTPHeaderField: "authorization")
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let credit = (json["credit"] as? String).flatMap(Double.init) else { return nil }
        return credit > 0 ? .left : .empty("api balance $0 — top up at fish.audio", until: Date().addingTimeInterval(3600))
    }

    func warmKokoro() async {
        guard !isWarmingKokoro else { return }
        isWarmingKokoro = true
        defer { isWarmingKokoro = false }
        if await kokoroReady() { return }
        guard launch.mayStartKokoro else { return }
        let server = Process()
        server.executableURL = URL(fileURLWithPath: NSHomeDirectory() + "/.local/bin/mlx_audio.server")
        server.arguments = ["--host", "127.0.0.1", "--port", String(kokoroURL.port ?? 7385)]
        // launchd starts us in /, read-only, and the server makes a logs/ dir in its working directory
        server.currentDirectoryURL = URL(fileURLWithPath: NSHomeDirectory() + "/.local/share/x-speak")
        // its own log, beside the daemon's: a server that dies at start says why here
        let logPath = NSHomeDirectory() + "/.local/share/x-speak/kokoro.log"
        FileManager.default.createFile(atPath: logPath, contents: nil)
        let logFile = FileHandle(forWritingAtPath: logPath)
        server.standardOutput = logFile ?? FileHandle.nullDevice
        server.standardError = logFile ?? FileHandle.nullDevice
        server.terminationHandler = { process in log("kokoro: server exited, status \(process.terminationStatus)") }
        do {
            try server.run()
        } catch {
            log("kokoro: server did not start — \(error)")
            return
        }
        kokoroServer = server
        for _ in 0..<240 where !(await kokoroReady()) { try? await Task.sleep(for: .milliseconds(250)) }
        guard await kokoroReady() else {
            log("kokoro: server not answering after 60 s")
            return
        }
        _ = try? await URLSession.shared.data(for: kokoroRequest("Ready.", voice: config[.kokoro].voice(for: .en)))
        skipUntil[.kokoro] = nil
        log("kokoro: warm")
    }

    // F5: stop, and the pill leaves unless stick holds it
    // ⇧F4: pause / resume what plays, whatever is selected
    func pausePressed() {
        log("press: ⇧F4 → \(isSpeaking ? (panel.model.isPaused ? "resume" : "pause") : "nothing playing")")
        togglePause()
    }

    // unconditional: F5 silences every voice, even one no read owns any more
    func stopPressed() {
        stop()
        panel.speechEnded()
    }

    // F4 reads the selection, cutting off what plays; with nothing selected it pauses / resumes what plays. ⇧F4 is
    // pause's second door, selection or not (dima, 2026-09-30). F5 stops
    func readPressed() async {
        let pressed = ContinuousClock.now
        configFile.refresh()
        // read live: a grant given while the daemon runs applies on the next press, no restart
        guard AXIsProcessTrusted() else {
            log("press: accessibility missing — grant \(CommandLine.arguments[0]) in Privacy & Security")
            return
        }
        var (text, via) = await grabSelection()
        // an empty accessibility answer is trusted only while something plays (F4 = pause, no 300 ms ⌘C wait);
        // idle, F4 means «read», so ⌘C gets a try: a selection inside a canvas or a frame is not the focused
        // element's (Chrome on a claude.ai artifact, 2026-10-01)
        if (text ?? "").isEmpty, via == "ax", !isSpeaking {
            text = await copySelection()
            via = "ax → ⌘C"
        }
        let grabbed = elapsed(pressed)
        let parts = chunks(normalize(text ?? ""))
        guard !parts.isEmpty else {
            log("press: nothing selected (grab \(via) \(grabbed))\(isSpeaking ? " → pause / resume" : "")")
            togglePause()
            return
        }
        log("press: grab \(via) \(grabbed), normalize \(elapsed(pressed)), \(parts.count) chunks")
        if job != nil { stop() }
        speak(parts, only: nil, pressed: pressed)
        if keys.count < 3, let loaded = keysLoadedAt, Date().timeIntervalSince(loaded) > 60 {
            Task { await loadKeys() }
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
                let engines = candidates(chain: config.chain, lang: chunk.lang, only: only, benched: skipUntil, lead: lead, now: Date())
                if rendersKokoroAhead(engines, lead: lead, isPlaying: player.isPlaying) {
                    let voice = settings(.kokoro).voice(for: .en)
                    kokoroPrefetch = (chunk.text, Task { try await kokoroPCM(chunk.text, voice: voice) })
                }
                let budgetEnds = firstAudioBudgetEnds(isPlaying: player.isPlaying || systemVoice.isBusy, firstAudioMs: config.firstAudioMs, now: .now)
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
        if decision.restartsKokoro { Task { await warmKokoro() } }
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
            await systemVoice.speak(chunk, settings(.system), onFirstWord: onAudio)
        case .gemini:
            try await playGemini(chunk, onAudio: onAudio)
        // the kokoro server answers only once the whole chunk is rendered, so there is nothing to stream
        case .kokoro:
            let prefetched = kokoroPrefetch.flatMap { $0.text == chunk.text ? $0.task : nil }
            kokoroPrefetch = nil
            let pcm = if let prefetched { try await prefetched.value } else { try await kokoroPCM(chunk.text, voice: settings(.kokoro).voice(for: .en)) }
            // a render that lands after a stop never reaches the player
            try Task.checkCancellation()
            try player.schedule(pcm, settings(.kokoro))
            onAudio()
        default:
            let ahead = cloudPrefetch.flatMap { $0.engine == engine && $0.text == chunk.text ? $0.task : nil }
            if ahead == nil { cloudPrefetch?.task.cancel() }
            cloudPrefetch = nil
            let request = try request(for: engine, chunk)
            let open = ahead ?? Task { try await URLSession.shared.bytes(for: request) }
            try await stream(open, settings(engine), deadline: deadline, onAudio: onAudio)
        }
    }

    private func openAhead(_ chunk: Chunk, with engine: Engine) {
        guard let request = try? request(for: engine, chunk) else { return }
        cloudPrefetch?.task.cancel()
        cloudPrefetch = (engine, chunk.text, Task { try await URLSession.shared.bytes(for: request) })
    }

    private func request(for engine: Engine, _ chunk: Chunk) throws -> URLRequest {
        switch engine {
        case .elevenlabs:
            guard let key = keys[.elevenlabs] else { throw EngineError.noKey }
            // a premade voice: library voices answer 402 on free and restricted keys
            guard let voice = settings(.elevenlabs).voice(for: chunk.lang) else { throw EngineError.noVoice }
            var request = URLRequest(url: URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(voice)/stream?output_format=pcm_24000")!)
            request.httpMethod = "POST"
            request.setValue(key, forHTTPHeaderField: "xi-api-key")
            request.setValue("application/json", forHTTPHeaderField: "content-type")
            request.httpBody = try JSONSerialization.data(withJSONObject: ["language_code": chunk.lang.rawValue, "model_id": settings(.elevenlabs).model ?? "eleven_v4_turbo", "text": chunk.text])
            return request
        case .fish:
            guard let key = keys[.fish] else { throw EngineError.noKey }
            guard let voice = settings(.fish).voice(for: chunk.lang) else { throw EngineError.noVoice }
            // s2.1-pro-free: no character cap, free until 2026-11-30 (fish's blog also names 08-31; a live call answered 200
            // on 2026-11-19); after that its non-2xx drops the tier by itself, and a 402 or 429 logs the loud line in handle
            var request = URLRequest(url: URL(string: "https://api.fish.audio/v1/tts")!)
            request.httpMethod = "POST"
            request.setValue("Bearer \(key)", forHTTPHeaderField: "authorization")
            request.setValue("application/json", forHTTPHeaderField: "content-type")
            request.setValue(settings(.fish).model ?? "s2.1-pro-free", forHTTPHeaderField: "model")
            request.httpBody = try JSONSerialization.data(withJSONObject: [
                "format": "pcm", "latency": "balanced", "reference_id": voice, "sample_rate": 24000, "text": chunk.text,
            ])
            return request
        default:
            preconditionFailure("\(engine) is not a streaming engine")
        }
    }

    // plays as bytes arrive; with a deadline, no audio by then throws before anything was heard
    // the byte loop runs off the main actor: on it, a buffered response starved the deadline timer (fish
    // played at 604 ms under a 400 ms deadline). `state` settles the race — audio or timeout, never both.
    private func stream(_ open: Task<(URLSession.AsyncBytes, URLResponse), Error>, _ settings: EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws {
        let state = OSAllocatedUnfairLock(initialState: StreamState.waiting)
        let player = self.player
        try await withThrowingTaskGroup(of: Void.self) { group in
            group.addTask {
                let (bytes, response) = try await withTaskCancellationHandler { try await open.value } onCancel: { open.cancel() }
                let status = (response as? HTTPURLResponse)?.statusCode ?? 0
                guard status == 200 else { throw await failure(status, bytes) }
                var buffer = Data()
                // 20 ms for the first buffer so audio starts at once, then 100 ms to schedule cheaply
                var threshold = 960
                func flush() async throws {
                    let pcm = buffer.prefix(buffer.count & ~1)
                    buffer.removeFirst(pcm.count)
                    let isFirst = state.withLock { current in
                        guard current != .timedOut else { return false }
                        defer { current = .playing }
                        return current == .waiting
                    }
                    guard state.withLock({ $0 == .playing }) else { throw CancellationError() }
                    // checked on main, where stop() runs: bytes that land after a stop never reach the player
                    try await MainActor.run {
                        try Task.checkCancellation()
                        try player.schedule(Data(pcm), settings)
                        if isFirst { onAudio() }
                    }
                }
                for try await byte in bytes {
                    buffer.append(byte)
                    if buffer.count >= threshold {
                        try await flush()
                        threshold = 4800
                    }
                }
                if buffer.count > 1 { try await flush() }
            }
            if let deadline {
                group.addTask {
                    try await Task.sleep(for: deadline)
                    let isLate = state.withLock { current in
                        guard current == .waiting else { return false }
                        current = .timedOut
                        return true
                    }
                    if isLate { throw EngineError.timeout }
                }
            }
            try await group.waitForAll()
        }
    }

    private func playGemini(_ chunk: Chunk, onAudio: () -> Void) async throws {
        guard let key = keys[.gemini] else { throw EngineError.noKey }
        let settings = settings(.gemini)
        let model = settings.model ?? "gemini-3.8-flash-tts"
        var request = URLRequest(url: URL(string: "https://generativelanguage.googleapis.com/v1beta/models/\(model):generateContent")!)
        request.httpMethod = "POST"
        request.setValue(key, forHTTPHeaderField: "x-goog-api-key")
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "contents": [["parts": [["text": chunk.text]]]],
            "generationConfig": ["responseModalities": ["AUDIO"], "speechConfig": ["voiceConfig": ["prebuiltVoiceConfig": ["voiceName": settings.voice(for: chunk.lang) ?? "Kore"]]]],
        ])
        let (data, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else { throw EngineError.status(status) }
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let parts = ((json?["candidates"] as? [[String: Any]])?.first?["content"] as? [String: Any])?["parts"] as? [[String: Any]]
        guard let base64 = (parts?.first?["inlineData"] as? [String: Any])?["data"] as? String, var audio = Data(base64Encoded: base64) else {
            throw EngineError.status(0)
        }
        if audio.prefix(4) == Data("RIFF".utf8) { audio = audio.dropFirst(44) }
        try Task.checkCancellation()
        try player.schedule(Data(audio), settings)
        onAudio()
    }
}

enum StreamState { case waiting, playing, timedOut }

enum Quota { case left, empty(String, until: Date) }
