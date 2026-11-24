// one read, driven whole with no sound: planted engines, a planted audio device, a planted pill, and every call in order
import Foundation

@MainActor
enum SpeakerTest {
    static func failures() async -> Int {
        await readFailures() + playerFailures()
    }

    static func readFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, setup: (Stage) -> Void, act: (Stage) async -> Void, want: String) in
            let stage = Stage()
            setup(stage)
            await act(stage)
            await settle()
            rows.append((name, stage.transcript, want))
        }
        let plain = { (_: Stage) in }
        await row("a read, chunk by chunk, then the pill leaves", plain, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. | «first audio: kokoro N ms» | «read 1: chunk 2/2» | kokoro Bye. | rest | pill -")
        await row("an engine that fails before its first sound hands the chunk on", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. | «kokoro skipped: status(500), off for 60 s» | system Hello. | «first audio: system N ms» | «read 1: chunk 2/2» | system Bye. | rest | pill -")
        await row("a quota refusal asks the provider", { $0.voices.script[.kokoro] = [.fails(EngineError.quota("14 left"))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. | «kokoro skipped: quota(\"14 left\"), off for 3600 s» | system Hello. | «first audio: system N ms» | rest | pill - | quotas")
        await row("kokoro's server gone is started again", { $0.voices.script[.kokoro] = [.fails(URLError(.cannotConnectToHost))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. | restart kokoro | «kokoro skipped: URLError, off for 60 s» | system Hello. | «first audio: system N ms» | rest | pill -")
        await row("every engine fails", { $0.voices.script = [.kokoro: [.fails(EngineError.timeout)], .system: [.fails(EngineError.noVoice)]] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. | «kokoro skipped: timeout» | system Hello. | «system skipped: noVoice» | rest | pill -")
        await row("a stop while an engine works: nothing after it", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.silence() } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. | «read 1: stopped» | drop ahead | stop | mac stop | pill - | rest")
        await row("a new read cuts the one that plays", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.read(Stage.chunks("New."), pressed: .now) } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. | «read 1: stopped» | drop ahead | stop | mac stop | pill 2 | «read 2: chunk 1/1» | kokoro New. | «first audio: kokoro N ms» | rest | pill - | rest")
        await row("a stop with nothing playing still silences and hides", plain, { $0.speaker.silence() }, "drop ahead | stop | mac stop | leave | rest")
        await row("a cloud engine that streams opens the next chunk ahead", { $0.chain = [.fish, .system] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | fish Hello. in 900 | «first audio: fish N ms» | ahead fish Bye. | «read 1: chunk 2/2» | fish Bye. | rest | pill -")
        await row("kokoro renders behind a cloud engine's race", { $0.chain = [.fish, .kokoro] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro ahead Hello. | fish Hello. in 900 | «first audio: fish N ms» | rest | pill -")
        await row("a preview hears its card's settings, benched or not", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
        }, "drop ahead | stop | mac stop | pill 2 | «read 2: chunk 1/1» | kokoro Sample. gain 3.0 | «first audio: kokoro N ms» | rest | pill - | rest")
        await row("a preview of a failing engine falls to nobody", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { stage in
            stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig())
        }, "drop ahead | stop | mac stop | pill 1 | «read 1: chunk 1/1» | kokoro Sample. | «kokoro skipped: status(500), off for 60 s» | rest | pill - | rest")
        await row("pause and resume reach both outputs", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello.") { $0.togglePause(); $0.togglePause() } },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. | pause | mac pause | pill 1 paused | play | mac resume | pill 1")
        await row("pause with nothing playing", plain, { $0.speaker.togglePause() }, "")
        let orders = { (act: (Speaker) -> Void) -> Int in
            let stage = Stage()
            act(stage.speaker)
            return stage.speaker.order
        }
        let hello = Stage.chunks("Hello.")
        var failed = check("read", rows) + check("order", [
            ("a read takes one", orders { $0.read(hello, pressed: .now) }, 1),
            ("a read over a read takes one more", orders { $0.read(hello, pressed: .now); $0.read(hello, pressed: .now) }, 2),
            ("the socket's read", orders { $0.readGiven(hello) }, 1),
            ("a preview", orders { _ = $0.preview("Hi.", with: .kokoro, settings: EngineConfig()) }, 1),
            ("a stop with nothing playing", orders { $0.silence() }, 1),
            ("a pause takes none", orders { $0.read(hello, pressed: .now); $0.togglePause() }, 1),
        ])
        failed += await healthFailures()
        return failed
    }

    static func healthFailures() async -> Int {
        let state = { (setup: @MainActor (Stage) -> Void, act: @MainActor (Stage) async -> Void, engine: Engine) async -> String in
            let stage = Stage()
            setup(stage)
            await act(stage)
            await settle()
            let health = stage.speaker.health()[engine.rawValue] ?? [:]
            return [health["state"], health["note"]].compactMap { $0 }.joined(separator: " ")
        }
        return check("health", [
            ("untouched", await state({ _ in }, { _ in }, .kokoro), "live"),
            ("a cloud engine with no key", await state({ $0.voices.keyless = [.fish] }, { _ in }, .fish), "no key"),
            ("a failure benches", await state({ $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello.") }, .kokoro), "benched"),
            ("a warm kokoro is live again", await state({ $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello."); await settle(); $0.speaker.kokoroIsWarm() }, .kokoro), "live"),
            ("an empty balance", await state({ $0.voices.quota = [(.fish, .empty("$0", until: .distantFuture))] }, { await $0.speaker.probeQuota() }, .fish), "no quota $0"),
            ("a balance that came back", await state({ $0.voices.quota = [(.fish, .empty("$0", until: .distantFuture))] }, { stage in
                await stage.speaker.probeQuota()
                stage.voices.quota = [(.fish, .left)]
                await stage.speaker.probeQuota()
            }, .fish), "live"),
            ("a provider that did not answer keeps its last word", await state({ $0.voices.quota = [(.fish, .empty("$0", until: .distantFuture))] }, { stage in
                await stage.speaker.probeQuota()
                stage.voices.quota = [(.fish, nil)]
                await stage.speaker.probeQuota()
            }, .fish), "no quota $0"),
        ])
    }

    static let pcm = Data(repeating: 0, count: 4)

    static func playerFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, act: (Player, PlantedAudio, Stage) async throws -> Void, want: String) in
            let stage = Stage()
            do { try await act(stage.player, stage.audio, stage) } catch { stage.calls.append("threw \(error)") }
            await settle()
            rows.append((name, stage.transcript, want))
        }
        await row("the first sound starts the device", { player, _, _ in try player.schedule(pcm, EngineConfig(gain: 2)) }, "speed 1.0 | start | play | sound gain 2.0")
        await row("the second finds it playing", { player, _, _ in try player.schedule(pcm, EngineConfig()); try player.schedule(pcm, EngineConfig()) },
                  "speed 1.0 | start | play | sound | speed 1.0 | sound")
        await row("half a sample is no sound", { player, _, stage in
            try player.schedule(Data([0]), EngineConfig())
            stage.calls.append("\(player.isPlaying)")
        }, "speed 1.0 | false")
        await row("a device that does not start", { player, audio, stage in
            audio.refuses = true
            do { try player.schedule(pcm, EngineConfig()) } catch { stage.calls.append("threw") }
            stage.calls.append("\(player.isPlaying)")
        }, "speed 1.0 | start | threw | false")
        await row("drained waits for the last sound", { player, audio, stage in
            try player.schedule(pcm, EngineConfig())
            try player.schedule(pcm, EngineConfig())
            Task { await player.drained(); stage.calls.append("drained") }
            await settle()
            audio.endsNext()
            await settle()
            stage.calls.append("one left")
            audio.endsNext()
        }, "speed 1.0 | start | play | sound | speed 1.0 | sound | one left | drained")
        await row("drained with nothing scheduled", { player, _, stage in await player.drained(); stage.calls.append("drained") }, "drained")
        await row("a gap mid-read is named", { player, audio, _ in
            try player.schedule(pcm, EngineConfig())
            audio.endsNext()
            await settle()
            try player.schedule(pcm, EngineConfig())
        }, "speed 1.0 | start | play | sound | speed 1.0 | «silence: N ms mid-read» | sound")
        await row("a gap between reads is not", { player, audio, _ in
            try player.schedule(pcm, EngineConfig())
            audio.endsNext()
            await settle()
            player.idle()
            try player.schedule(pcm, EngineConfig())
        }, "speed 1.0 | start | play | sound | rest | speed 1.0 | start | play | sound")
        await row("a stop ends the wait and drops what is scheduled", { player, audio, stage in
            try player.schedule(pcm, EngineConfig())
            Task { await player.drained(); stage.calls.append("drained") }
            await settle()
            player.stop()
            stage.calls.append("\(player.isPlaying)")
        }, "speed 1.0 | start | play | sound | stop | false | drained | rest")
        await row("a stopped sound's late end is not the next one's", { player, audio, stage in
            try player.schedule(pcm, EngineConfig())
            player.stop()
            try player.schedule(pcm, EngineConfig())
            audio.endsNext()
            await settle()
            stage.calls.append("\(player.isPlaying)")
        }, "speed 1.0 | start | play | sound | stop | speed 1.0 | play | sound | true")
        await row("idle while something is scheduled holds on", { player, _, _ in try player.schedule(pcm, EngineConfig()); player.idle() }, "speed 1.0 | start | play | sound")
        await row("the output went away", { player, audio, _ in try player.schedule(pcm, EngineConfig()); audio.onGone("gone") },
                  "speed 1.0 | start | play | sound | «audio: gone, engine released» | stop | release | rest")
        return check("player", rows)
    }
}

// the tasks in flight run until they wait on something
@MainActor
func settle() async {
    for _ in 0..<40 { await Task.yield() }
    try? await Task.sleep(for: .milliseconds(5))
    for _ in 0..<40 { await Task.yield() }
}

// what happened, in order; it outlives its stage, for a late call
@MainActor
final class Calls { var made: [String] = [] }

@MainActor
final class Stage {
    let log = Calls()
    var chain: [Engine] = [.kokoro, .system]
    let audio: PlantedAudio, voices: PlantedVoices, player: Player
    private(set) var speaker: Speaker!
    var calls: [String] {
        get { log.made }
        set { log.made = newValue }
    }

    init() {
        let log = log
        let call = { (call: String) in log.made.append(call) }
        audio = PlantedAudio(call)
        voices = PlantedVoices(call)
        player = Player(device: audio, settling: .zero, log: { call("«\($0)»") })
        speaker = Speaker(
            player: player, macVoice: PlantedOutput { call("mac " + $0) }, voices: voices, pill: PlantedPill(call),
            settings: { [weak self] in Stage.config(self?.chain ?? []) }, log: { call("«\($0)»") }
        )
    }

    var transcript: String {
        calls.joined(separator: " | ")
            .replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression)
            .replacingOccurrences(of: "in (8[0-9][0-9]|900)", with: "in 900", options: .regularExpression)
            .replacingOccurrences(of: "skipped: [^«»]*-1004[^«»]*, off", with: "skipped: URLError, off", options: .regularExpression)
    }

    static func config(_ chain: [Engine]) -> Config {
        let names = chain.map { "\"\($0.rawValue)\"" }.joined(separator: ",")
        return try! JSONDecoder().decode(Config.self, from: Data(#"{"chain":{"en":[\#(names)]},"firstAudioMs":900,"engines":{}}"#.utf8))
    }
    static func chunks(_ text: String) -> [Chunk] { text.split(separator: " ").map { Chunk(lang: .en, text: String($0)) } }
    func read(_ text: String) { speaker.read(Stage.chunks(text), pressed: .now); drop("reload keys") }
    func readThen(_ text: String, _ act: (Speaker) -> Void) async {
        read(text)
        await settle()
        act(speaker)
        drop("reload keys")
    }
    private func drop(_ call: String) { calls.removeAll { $0 == call } }
}

enum Step { case plays, waits, fails(Error) }

@MainActor
final class PlantedVoices: ChunkVoices {
    // the next answers of an engine, in order; past them it plays
    var script: [Engine: [Step]] = [:]
    var keyless: Set<Engine> = []
    var quota: [(Engine, Quota?)] = []
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }

    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws {
        let wait = deadline.map { " in \($0.components.seconds * 1000 + $0.components.attoseconds / 1_000_000_000_000_000)" } ?? ""
        let gain = settings().gain == 1 ? "" : " gain \(settings().gain)"
        call("\(engine.rawValue) \(chunk.text)\(wait)\(gain)")
        let step = script[engine].flatMap { $0.first } ?? .plays
        if script[engine]?.isEmpty == false { script[engine]?.removeFirst() }
        switch step {
        case .plays: onAudio()
        case .fails(let error): throw error
        case .waits: try await Task.sleep(for: .seconds(60))
        }
    }
    func renderKokoroAhead(_ chunk: Chunk, settings: EngineConfig) { call("kokoro ahead \(chunk.text)") }
    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig) { call("ahead \(engine.rawValue) \(chunk.text)") }
    func dropAhead() { call("drop ahead") }
    func hasKey(_ engine: Engine) -> Bool { !keyless.contains(engine) }
    func reloadMissingKeys() { call("reload keys") }
    func quotas(fish: EngineConfig) async -> [(Engine, Quota?)] { call("quotas"); return quota }
    func restartKokoro() { call("restart kokoro") }
}

@MainActor
final class PlantedAudio: AudioDevice {
    private(set) var isRunning = false
    private(set) var isPlaying = false
    var refuses = false
    var onGone: (String) -> Void = { _ in }
    private var ends: [@MainActor () -> Void] = []
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }

    func start() throws {
        call("start")
        if refuses { throw EngineError.timeout }
        isRunning = true
    }
    func play() { call("play"); isPlaying = true }
    func pause() { call("pause"); isPlaying = false }
    func stop() { call("stop"); isPlaying = false }
    func rest() { call("rest"); isRunning = false; isPlaying = false }
    func release() { call("release"); isRunning = false; isPlaying = false }
    func setSpeed(_ speed: Double) { call("speed \(speed)") }
    func schedule(_ pcm: Data, gain: Double, whenOver: @escaping @MainActor () -> Void) {
        call("sound" + (gain == 1 ? "" : " gain \(gain)"))
        ends.append(whenOver)
    }
    func endsNext() { if !ends.isEmpty { ends.removeFirst()() } }
}

@MainActor
final class PlantedOutput: SpeechOutput {
    var isBusy = false
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }
    func pause() { call("pause") }
    func resume() { call("resume") }
    func stop() { call("stop") }
}

@MainActor
final class PlantedPill: SpeechPill {
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }
    func follow(_ playback: Playback) { call("pill \(playback.read.map(String.init) ?? "-")\(playback.isPaused ? " paused" : "")") }
    func leave() { call("leave") }
}
