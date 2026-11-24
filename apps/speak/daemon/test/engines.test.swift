// every engine over a planted net: what it asks, what it renders, what is left at its provider. nothing here reaches a provider
import Foundation

@MainActor
enum EnginesTest {
    static func failures() async -> Int {
        await requestFailures() + renderFailures() + balanceFailures() + holdFailures() + playFailures() + voicesFailures()
    }

    static func engine(_ id: Engine, _ net: PlantedNet) -> any VoiceEngine { id.type.init(EngineParts(net: net, mac: PlantedMac())) }

    static func requestFailures() async -> Int {
        let asked = { (id: Engine, lang: Lang, settings: EngineConfig, key: String?) async -> String in
            let net = PlantedNet()
            do {
                for try await _ in try engine(id, net).render(Chunk(lang: lang, text: "Hi"), settings, key: key) {}
            } catch {
                if net.asked.isEmpty { return "\(error)" }
            }
            return net.asked.joined()
        }
        let named = EngineConfig(voice: ["en": "jess", "*": "any"])
        var other = named
        other.model = "other"
        var rows: [(name: String, got: String, want: String)] = []
        rows.append(("elevenlabs", await asked(.elevenlabs, .en, named, "k"), #"POST https://api.elevenlabs.io/v1/text-to-speech/jess/stream?output_format=pcm_24000 xi-api-key=k {"language_code":"en","model_id":"eleven_v4_turbo","text":"Hi"}"#))
        rows.append(("elevenlabs, another language and model", await asked(.elevenlabs, .uk, other, "k"), #"POST https://api.elevenlabs.io/v1/text-to-speech/any/stream?output_format=pcm_24000 xi-api-key=k {"language_code":"uk","model_id":"other","text":"Hi"}"#))
        rows.append(("elevenlabs, no voice", await asked(.elevenlabs, .en, EngineConfig(), "k"), "noVoice"))
        rows.append(("fish", await asked(.fish, .ru, named, "k"), #"POST https://api.fish.audio/v1/tts authorization=Bearer k model=s2.1-pro-free {"format":"pcm","latency":"balanced","reference_id":"any","sample_rate":24000,"text":"Hi"}"#))
        rows.append(("fish, another model", await asked(.fish, .ru, other, "k"), #"POST https://api.fish.audio/v1/tts authorization=Bearer k model=other {"format":"pcm","latency":"balanced","reference_id":"any","sample_rate":24000,"text":"Hi"}"#))
        rows.append(("fish, no voice", await asked(.fish, .en, EngineConfig(), "k"), "noVoice"))
        let spoken = #"{"contents":[{"parts":[{"text":"Hi"}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"VOICE"}}}}}"#
        rows.append(("gemini, its own voice", await asked(.gemini, .en, EngineConfig(), "k"), "POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent x-goog-api-key=k " + spoken.replacingOccurrences(of: "VOICE", with: "Kore")))
        rows.append(("gemini, named", await asked(.gemini, .en, other, "k"), "POST https://generativelanguage.googleapis.com/v1beta/models/other:generateContent x-goog-api-key=k " + spoken.replacingOccurrences(of: "VOICE", with: "jess")))
        rows.append(("kokoro, its own voice", await asked(.kokoro, .en, EngineConfig(), nil), #"POST http://127.0.0.1:7385/v1/audio/speech {"input":"Hi","model":"mlx-community/Kokoro-82M-bf16","response_format":"pcm","voice":"af_heart"}"#))
        rows.append(("kokoro, named", await asked(.kokoro, .en, named, nil), #"POST http://127.0.0.1:7385/v1/audio/speech {"input":"Hi","model":"mlx-community/Kokoro-82M-bf16","response_format":"pcm","voice":"jess"}"#))
        rows.append(("the mac voice", await asked(.system, .en, named, nil), ""))
        for id in Engine.allCases where id.isCloud { rows.append(("\(id), no key", await asked(id, .en, named, nil), "noKey")) }
        return check("engine request", rows)
    }

    static func renderFailures() async -> Int {
        let render = { (id: Engine, net: PlantedNet) async -> String in
            var got: [String] = []
            do {
                for try await piece in try engine(id, net).render(Chunk(lang: .en, text: "Hi"), EngineConfig(voice: ["*": "v"]), key: "k") {
                    got.append("\(piece.pcm.map(String.init).joined(separator: "."))\(piece.marks.isEmpty ? "" : " \(piece.marks)")")
                }
            } catch {
                got.append("\(error)")
            }
            return got.joined(separator: " | ")
        }
        let net = { (body: [Data], status: Int) in PlantedNet(status: status, body: body) }
        let gemini = { (audio: [UInt8]) in Data(#"{"candidates":[{"content":{"parts":[{"inlineData":{"data":"\#(Data(audio).base64EncodedString())"}}]}}]}"#.utf8) }
        var rows: [(name: String, got: String, want: String)] = []
        // the pieces as they come, the marks with them: none from any engine today
        for id in Engine.allCases {
            let body = id == .gemini ? [gemini([1, 2, 3, 4])] : [Data([1, 2]), Data([3, 4])]
            let want = id == .system ? "7.7" : id.facts.streams ? "1.2 | 3.4" : "1.2.3.4"
            rows.append(("\(id) renders", await render(id, net(body, 200)), want))
            if id != .system { rows.append(("\(id) refuses", await render(id, net([Data("no".utf8)], 503)), "status(503)")) }
        }
        rows.append(("a sample cut between two pieces", await render(.fish, net([Data([1, 2, 3]), Data([4, 5])], 200)), "1.2 | 3.4"))
        rows.append(("a piece of half a sample", await render(.fish, net([Data([1]), Data([2, 3, 4])], 200)), "1.2.3.4"))
        rows.append(("a quota refusal, in pieces", await render(.elevenlabs, net([Data(#"{"detail":{"status":"quota_exc"#.utf8), Data(#"eeded","message":"14 left"}}"#.utf8)], 401)), #"quota("14 left")"#))
        rows.append(("a refusal that never ends is cut", await render(.elevenlabs, net([Data(repeating: 32, count: 5000), Data(#"{"detail":{"status":"quota_exceeded"}}"#.utf8)], 500)), "status(500)"))
        rows.append(("a stream that breaks off", await render(.fish, PlantedNet(body: [Data([1, 2])], breaks: EngineError.status(0))), "1.2 | \(EngineError.status(0))"))
        rows.append(("gemini's wav loses its header", await render(.gemini, net([gemini(Array("RIFF".utf8) + [UInt8](repeating: 0, count: 40) + [9, 9])], 200)), "9.9"))
        rows.append(("gemini with no audio in it has no sound", await render(.gemini, net([Data("{}".utf8)], 200)), ""))
        rows.append(("gemini's audio that is no base64 has no sound", await render(.gemini, net([Data(#"{"candidates":[{"content":{"parts":[{"inlineData":{"data":"%%%"}}]}}]}"#.utf8)], 200)), ""))
        return check("engine render", rows)
    }

    static func balanceFailures() async -> Int {
        let left = { (id: Engine, body: String, model: String?) async -> Balance? in
            var settings = EngineConfig()
            settings.model = model
            return await engine(id, PlantedNet(body: [Data(body.utf8)])).balance(key: "k", settings)
        }
        let reset = Date(timeIntervalSince1970: 1_790_000_000)
        let day = reset.formatted(.dateTime.month(.abbreviated).day())
        return check("balance", [
            ("elevenlabs", await left(.elevenlabs, #"{"character_count":9000,"character_limit":10000,"next_character_count_reset_unix":1790000000}"#, nil), Balance(left: 1000, refills: reset)),
            ("elevenlabs under a sentence", await left(.elevenlabs, #"{"character_count":9901,"character_limit":10000,"next_character_count_reset_unix":1790000000}"#, nil), Balance(left: 99, refills: reset, empty: "99 of 10000 credits left, refills \(day)")),
            ("elevenlabs, 100 left", await left(.elevenlabs, #"{"character_count":9900,"character_limit":10000,"next_character_count_reset_unix":null}"#, nil), Balance(left: 100)),
            ("elevenlabs, no refill date hides nothing", await left(.elevenlabs, #"{"character_count":9100,"character_limit":10000,"next_character_count_reset_unix":null}"#, nil), Balance(left: 900)),
            ("elevenlabs, empty with no refill date", await left(.elevenlabs, #"{"character_count":10000,"character_limit":10000}"#, nil), Balance(left: 0, empty: "0 of 10000 credits left")),
            ("elevenlabs, a key that may not ask", await left(.elevenlabs, #"{"detail":{"status":"missing_permissions"}}"#, nil), nil),
            ("fish, the free model", await left(.fish, "{}", nil), Balance(left: .infinity)),
            ("fish, the free model by name", await left(.fish, "{}", "s2.1-pro-free"), Balance(left: .infinity)),
            ("fish, a paid one", await left(.fish, #"{"credit":"4.5"}"#, "s2.1-pro"), Balance(left: 4.5)),
            ("fish, a paid one, empty", await left(.fish, #"{"credit":"0"}"#, "s2.1-pro"), Balance(left: 0, empty: "api balance $0 — top up at fish.audio")),
            ("fish, no number", await left(.fish, #"{"credit":null}"#, "s2.1-pro"), nil),
            ("kokoro has none", await left(.kokoro, "{}", nil), nil),
            ("gemini tells none", await left(.gemini, "{}", nil), nil),
        ])
    }

    static func holdFailures() -> Int {
        let now = Date(timeIntervalSince1970: 1_000_000), hour = now.addingTimeInterval(3600), month = now.addingTimeInterval(2_000_000)
        let refusal = refused("needs 203", now: now)
        let seen = after(Balance(left: 150, refills: month), refusal, now: now)
        return check("quota hold", [
            ("a refusal holds an hour", refusal, QuotaHold(note: "needs 203", until: hour)),
            ("the first balance after it lifts nothing", seen, QuotaHold(note: "needs 203", until: hour, left: 150, refills: month)),
            ("the same balance", after(Balance(left: 150, refills: month), seen, now: hour), seen),
            ("a smaller one", after(Balance(left: 120, refills: month), seen, now: hour), seen),
            ("a grown one lifts it", after(Balance(left: 151, refills: month), seen, now: now), nil),
            ("the refill passed: lifted", after(Balance(left: 150, refills: month), seen, now: month), nil),
            ("too little for a sentence holds until the refill", after(Balance(left: 14, refills: month, empty: "14 left"), seen, now: now), QuotaHold(note: "14 left", until: month, left: 14, refills: month)),
            ("too little, no refill date: an hour", after(Balance(left: 0, empty: "$0"), nil, now: now), QuotaHold(note: "$0", until: hour, left: 0)),
            ("an empty one that grew is lifted", after(Balance(left: 5), QuotaHold(note: "$0", until: hour, left: 0), now: now), nil),
            ("no hold, enough left", after(Balance(left: 900), nil, now: now), nil),
            ("a model that draws on no balance lifts it", after(Balance(left: .infinity), seen, now: now), nil),
        ])
    }

    static func playFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, text: String, deadline: Duration?, act: @MainActor (Pieces.Continuation, PlantedAudio, Player) async throws -> Void, after: @MainActor (Task<Void, Error>, Pieces.Continuation) async -> Void, want: String) in
            let calls = Calls(), audio = PlantedAudio { calls.made.append($0) }
            let player = Player(device: audio, settling: .seconds(60), log: { _ in })
            let (pieces, line) = Pieces.makeStream()
            line.onTermination = { if case .cancelled = $0 { Task { @MainActor in calls.made.append("cancelled") } } }
            try? await act(line, audio, player)
            calls.made = []
            var gain = 1.0
            let task = Task {
                try await play(pieces, of: Chunk(lang: .en, text: text), into: player, settings: { gain += 1; return EngineConfig(gain: gain) }, deadline: deadline) { calls.made.append("heard") }
            }
            // no row waits for good
            let limit = Task { try await Task.sleep(for: .seconds(1)); line.finish() }
            defer { limit.cancel() }
            await settle()
            await after(task, line)
            let end = await task.result
            await settle()
            if case .failure(let error) = end { calls.made.append("\(error)".contains("Cancellation") ? "stopped" : "\(error)") }
            rows.append((name, calls.made.filter { !["start", "play", "speed 1.0"].contains($0) }.joined(separator: " | "), want))
        }
        let pcm = Rendered(pcm: Data([1, 2])), nothing: @MainActor (Task<Void, Error>, Pieces.Continuation) async -> Void = { _, _ in }
        await row("two pieces", "Hi", nil, { line, _, _ in line.yield(pcm); line.yield(pcm); line.finish() }, nothing, "sound gain 2.0 | heard | sound gain 2.0")
        await row("an empty piece is no first sound", "Hi", nil, { line, _, _ in line.yield(Rendered(pcm: Data())); line.yield(pcm); line.finish() }, nothing, "sound gain 2.0 | heard")
        await row("no sound at all", "Hi", nil, { line, _, _ in line.finish() }, nothing, "noSound")
        await row("an empty answer whole", "Hi", .milliseconds(50), { line, _, _ in line.yield(Rendered(pcm: Data())); line.finish() }, nothing, "noSound")
        await row("no word to say is spoken", "…", nil, { line, _, _ in line.finish() }, nothing, "")
        await row("a refusal", "Hi", .seconds(5), { line, _, _ in line.finish(throwing: EngineError.status(500)) }, nothing, "status(500)")
        await row("broken off in the middle", "Hi", .seconds(5), { line, _, _ in line.yield(pcm); line.finish(throwing: EngineError.status(0)) }, nothing, "sound gain 2.0 | heard | status(0)")
        await row("late", "Hi", .milliseconds(30), { _, _, _ in }, nothing, "cancelled | timeout")
        await row("a piece after the deadline is never heard", "Hi", .milliseconds(30), { _, _, _ in }, { task, line in _ = await task.result; line.yield(pcm); await settle() }, "cancelled | timeout")
        await row("the deadline is the first sound's alone", "Hi", .milliseconds(40), { line, _, _ in line.yield(pcm) }, { _, line in
            try? await Task.sleep(for: .milliseconds(80))
            line.yield(pcm)
            line.finish()
        }, "sound gain 2.0 | heard | sound gain 2.0")
        await row("no deadline waits", "Hi", nil, { _, _, _ in }, { _, line in
            try? await Task.sleep(for: .milliseconds(60))
            line.yield(pcm)
            line.finish()
        }, "sound gain 2.0 | heard")
        await row("stopped before the first sound", "Hi", .seconds(5), { _, _, _ in }, { task, _ in task.cancel() }, "cancelled | stopped")
        await row("stopped in the middle: a piece that lands after it is never heard", "Hi", nil, { line, _, _ in line.yield(pcm) }, { task, line in task.cancel(); line.yield(pcm) }, "sound gain 2.0 | heard | cancelled | stopped")
        await row("stopped as a piece landed: it is never heard", "Hi", nil, { _, _, _ in }, { task, line in line.yield(pcm); task.cancel() }, "cancelled | stopped")
        await row("stopped as the line ended with nothing", "Hi", nil, { _, _, _ in }, { task, line in line.finish(); task.cancel() }, "stopped")
        await row("stopped, though the line had ended", "Hi", nil, { _, _, _ in }, { task, line in task.cancel(); line.finish() }, "cancelled | stopped")
        // the wait runs from the moment nothing plays
        await row("under sound the deadline holds", "Hi", .milliseconds(30), { _, _, player in try player.schedule(Data([1, 2]), EngineConfig()) }, { _, line in
            try? await Task.sleep(for: .milliseconds(90))
            line.yield(pcm)
            line.finish()
        }, "sound gain 2.0 | heard")
        return check("play", rows)
    }

    static func voicesFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        var mac: VoiceOutput!
        let row = { (name: String, act: @MainActor (Voices, PlantedNet, Calls) async throws -> Void, want: String) in
            let calls = Calls(), net = PlantedNet(body: [Data([1, 2])])
            mac = VoiceOutput(make: PlantedSynths(calls).make)
            net.call = { line in Task { @MainActor in calls.made.append(line) } }
            let player = Player(device: PlantedAudio { calls.made.append($0) }, settling: .seconds(60), log: { _ in })
            let keys = Keys(run: { _ in "k\0k\0k\0" }, log: { _ in })
            await keys.load()
            let voices = Voices(EngineParts(net: net, mac: PlantedMac()), player: player, macVoice: mac, keys: keys, servers: [:])
            do { try await act(voices, net, calls) } catch { calls.made.append("\(error)") }
            await settle()
            rows.append((name, calls.made.filter { !["start", "play", "speed 1.0"].contains($0) }.joined(separator: " | "), want))
        }
        let chunk = { (text: String) in Chunk(lang: .en, text: text) }
        let named = EngineConfig(voice: ["*": "v"])
        let say = { (voices: Voices, text: String, engine: Engine, calls: Calls) async throws in
            try await voices.speak(chunk(text), with: engine, settings: { named }, deadline: nil) { calls.made.append("heard") }
        }
        await row("a chunk asked ahead is asked once", { voices, _, calls in
            voices.openAhead(chunk("One."), with: .fish, settings: named)
            await settle()
            calls.made.append("—")
            try await say(voices, "One.", .fish, calls)
        }, "ask One. | — | sound | heard")
        await row("what was asked ahead for another chunk is dropped", { voices, net, calls in
            net.hangs = true
            voices.openAhead(chunk("One."), with: .fish, settings: named)
            await settle()
            net.hangs = false
            try await say(voices, "Two.", .fish, calls)
        }, "ask One. | dropped One. | ask Two. | sound | heard")
        await row("a server's render of this chunk outlives the cloud's miss", { voices, net, calls in
            voices.openAhead(chunk("One."), with: .kokoro, settings: named)
            await settle()
            net.hangs = true
            try? await voices.speak(chunk("One."), with: .fish, settings: { named }, deadline: .milliseconds(20)) {}
            await settle()
            try await say(voices, "One.", .kokoro, calls)
        }, "ask One. | ask One. | dropped One. | sound | heard")
        await row("a server's render the cloud beat is for no one, on the next read too", { voices, _, calls in
            voices.openAhead(chunk("One."), with: .kokoro, settings: named)
            await settle()
            try await say(voices, "One.", .fish, calls)
            calls.made = []
            try await say(voices, "One.", .kokoro, calls)
        }, "ask One. | sound | heard")
        await row("the next chunk's look ahead outlives this one, the same words too", { voices, _, calls in
            try await voices.speak(chunk("One."), with: .fish, settings: { named }, deadline: nil) { voices.openAhead(chunk("One."), with: .fish, settings: named) }
            await settle()
            calls.made = []
            try await say(voices, "One.", .fish, calls)
        }, "sound | heard")
        await row("a stop drops what was asked ahead", { voices, net, calls in
            net.hangs = true
            voices.openAhead(chunk("One."), with: .fish, settings: named)
            await settle()
            voices.openAhead(chunk("Two."), with: .kokoro, settings: named)
            await settle()
            voices.dropAhead()
            await settle()
            calls.made.sort()
        }, "ask One. | ask Two. | dropped One. | dropped Two.")
        await row("a second look ahead drops the first", { voices, net, _ in
            net.hangs = true
            voices.openAhead(chunk("One."), with: .fish, settings: named)
            await settle()
            voices.openAhead(chunk("Two."), with: .fish, settings: named)
            await settle()
            net.call = { _ in }
        }, "ask One. | dropped One. | ask Two.")
        await row("a stopped mac voice's late end leaves the next read what it asked ahead", { voices, _, calls in
            let task = Task { try await say(voices, "Old.", .system, calls) }
            await settle()
            task.cancel()
            voices.dropAhead()
            voices.openAhead(chunk("One."), with: .fish, settings: named)
            await settle()
            mac.stop()
            await settle()
            try await say(voices, "One.", .fish, calls)
        }, "start Old. | ask One. | stop Old. | sound | heard")
        await row("the mac voice plays for itself until it is told to render", { voices, _, calls in
            let task = Task { try await say(voices, "One.", .system, calls) }
            await settle()
            task.cancel()
        }, "start One.")
        await row("the mac voice through the player", { voices, _, calls in
            var one = named
            one.oneOutput = true
            try await voices.speak(chunk("One."), with: .system, settings: { one }, deadline: nil) { calls.made.append("heard") }
        }, "sound | heard")
        await row("the mac voices: its own names, then the installed", { voices, _, calls in
            calls.made.append(voices.voices(of: .system).map { "\($0.name) \($0.lang?.rawValue ?? "-")" }.joined(separator: ", "))
        }, "Spoken Content voice (Siri) en, best installed uk, best installed ru, Planted uk")
        return check("voices", rows)
    }
}

// answers every request the same; `call` hears each one asked and each one dropped
final class PlantedNet: Net, @unchecked Sendable {
    private let lock = NSLock()
    private let status: Int
    private let body: [Data]
    private let breaks: Error?
    var hangs = false
    var call: @Sendable (String) -> Void = { _ in }
    private var lines: [String] = []
    var asked: [String] { lock.withLock { lines } }

    init(status: Int = 200, body: [Data] = [], breaks: Error? = nil) {
        (self.status, self.body, self.breaks) = (status, body, breaks)
    }

    func open(_ request: URLRequest) async throws -> (status: Int, body: AsyncThrowingStream<Data, Error>) {
        try await ask(request)
        return (status, AsyncThrowingStream { continuation in
            body.forEach { continuation.yield($0) }
            continuation.finish(throwing: breaks)
        })
    }

    func whole(_ request: URLRequest) async throws -> (status: Int, body: Data) {
        try await ask(request)
        if let breaks { throw breaks }
        return (status, body.reduce(Data(), +))
    }

    private func ask(_ request: URLRequest) async throws {
        let headers = (request.allHTTPHeaderFields ?? [:]).map { ($0.key.lowercased(), $0.value) }.filter { $0.0 != "content-type" }.sorted { $0.0 < $1.0 }
        let json = request.httpBody.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
        let sorted = json.flatMap { try? JSONSerialization.data(withJSONObject: $0, options: [.sortedKeys, .withoutEscapingSlashes]) }.map { String(decoding: $0, as: UTF8.self) }
        let parts = [request.httpMethod ?? "", request.url?.absoluteString ?? ""] + headers.map { "\($0.0)=\($0.1)" } + [sorted ?? ""]
        lock.withLock { lines.append(parts.joined(separator: " ")) }
        let text = (json?["text"] ?? json?["input"]) as? String ?? ""
        call("ask \(text)")
        guard hangs else { return }
        let call = call
        do { try await Task.sleep(for: .seconds(1)) } catch {
            call("dropped \(text)")
            throw error
        }
    }
}

struct PlantedMac: MacVoices {
    func installed() -> [Voice] { [Voice(id: "p", name: "Planted", lang: .uk)] }
    func render(_ chunk: Chunk, _ settings: EngineConfig) -> Pieces {
        Pieces { $0.yield(Rendered(pcm: Data([7, 7]))); $0.finish() }
    }
}
