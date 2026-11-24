// one read, driven whole with no sound: planted engines, a planted audio device, a planted pill, and every call in order
import Foundation

@MainActor
enum SpeakerTest {
    static func failures() async -> Int {
        await readFailures() + playerFailures() + voiceFailures() + deadlineFailures()
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
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «read 1: chunk 2/2» | kokoro Bye. in 3000 | rest | pill -")
        await row("an engine that fails before its first sound hands the chunk on", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «kokoro skipped: status(500), off for 60 s» | system Hello. | «first audio: system N ms» | «read 1: chunk 2/2» | system Bye. | rest | pill -")
        await row("an engine that fails after its first sound ends the chunk: no second voice reads it", { $0.voices.script[.kokoro] = [.failsMidChunk(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «kokoro skipped: status(500), off for 60 s» | «read 1: chunk 2/2» | system Bye. | rest | pill -")
        await row("a stream that says «cancelled» on its own ends no read", { $0.voices.script[.kokoro] = [.fails(CancellationError())] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout» | system Hello. | «first audio: system N ms» | rest | pill -")
        await row("a read ends with its last sound, not before", { $0.voices.script[.kokoro] = [.sounds] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls.append("\(stage.speaker.playback)")
            stage.audio.endsNext()
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | speed 1.0 | start | play | sound | «first audio: kokoro N ms» | reading(1, isPaused: false) | rest | pill -")
        await row("a stop while the last sound plays ends it once", { $0.voices.script[.kokoro] = [.sounds] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.silence()
        }, "«read 1: stopped» | drop ahead | stop | mac stop | pill - | rest")
        await row("a new read while the last sound plays is not ended by the old one", { $0.voices.script[.kokoro] = [.sounds, .waits] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.read("New.")
            await settle()
            stage.calls.append("\(stage.speaker.playback)")
        }, "«read 1: stopped» | drop ahead | stop | mac stop | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | rest | reading(2, isPaused: false)")
        await row("a stopped read asks for no second chunk", { $0.voices.script[.kokoro] = [.ignoresStop] }, { stage in
            await stage.readThen("Hello. Bye.") { $0.silence() }
            try? await Task.sleep(for: .milliseconds(60))
        }, "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | mac stop | pill - | rest")
        await row("a read after a preview hears the saved settings", plain, { stage in
            _ = stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
            await settle()
            stage.calls = []
            stage.read("Hello.")
        }, "pill 2 | «read 2: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | rest | pill -")
        await row("a read over a preview hears the saved settings", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            _ = stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
            await settle()
            stage.calls = []
            stage.read("Hello.")
        }, "«read 1: stopped» | drop ahead | stop | mac stop | pill 2 | «read 2: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | rest | pill - | rest")
        await row("nothing is opened ahead in a language the engine does not lead", { $0.chain = [.fish, .system] }, { $0.read([Chunk(lang: .en, text: "Hello."), Chunk(lang: .uk, text: "Привіт.")]) },
                  "pill 1 | «read 1: chunk 1/2» | fish Hello. in 900 | «first audio: fish N ms» | «read 1: chunk 2/2» | system Привіт. | «voice switch: fish → system mid-read» | rest | pill -")
        await row("a wait that ran out costs only this chunk", { $0.voices.script[.kokoro] = [.fails(EngineError.timeout)] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout» | system Hello. | «first audio: system N ms» | rest | pill -")
        await row("a quota refusal asks the provider", { $0.voices.script[.kokoro] = [.fails(EngineError.quota("14 left"))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: quota(\"14 left\"), off for 3600 s» | system Hello. | «first audio: system N ms» | rest | pill - | quotas")
        await row("kokoro's server gone is started again", { $0.voices.script[.kokoro] = [.fails(URLError(.cannotConnectToHost))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | restart kokoro | «kokoro skipped: URLError, off for 60 s» | system Hello. | «first audio: system N ms» | rest | pill -")
        await row("every engine fails", { $0.voices.script = [.kokoro: [.fails(EngineError.timeout)], .system: [.fails(EngineError.noVoice)]] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout» | system Hello. | «system skipped: noVoice» | rest | pill -")
        await row("a stop while an engine works: nothing after it", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.silence() } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | mac stop | pill - | rest")
        await row("a new read cuts the one that plays", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.read(Stage.chunks("New."), pressed: .now) } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | mac stop | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | «first audio: kokoro N ms» | rest | pill - | rest")
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
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | mac pause | pill 1 paused | mac resume | pill 1")
        await row("a chunk that lands under a pause waits for the resume", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause() }
            try? stage.player.schedule(pcm, EngineConfig())
            stage.calls.append("\(stage.speaker.playback)")
            stage.speaker.togglePause()
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | mac pause | pill 1 paused | speed 1.0 | start | sound | reading(1, isPaused: true) | play | mac resume | pill 1")
        await row("a read over a paused one is not paused", { $0.voices.script[.kokoro] = [.waits, .waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause(); $0.read(Stage.chunks("New."), pressed: .now) }
            await settle()
            try? stage.player.schedule(pcm, EngineConfig())
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | mac pause | pill 1 paused | «read 1: stopped» | drop ahead | stop | mac stop | mac resume | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | rest | speed 1.0 | start | play | sound")
        await row("a stop under a pause leaves nothing paused", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause(); $0.silence() }
            await settle()
            try? stage.player.schedule(pcm, EngineConfig())
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | mac pause | pill 1 paused | «read 1: stopped» | drop ahead | stop | mac stop | mac resume | pill - | rest | speed 1.0 | start | play | sound")
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
            ("a stopped voice that returns normally proves nothing", await state({ $0.voices.quota = [(.fish, .empty("$0", until: .distantFuture))]; $0.voices.script[.fish] = [.ignoresStop] }, { stage in
                await stage.speaker.probeQuota()
                _ = stage.speaker.preview("Hi.", with: .fish, settings: EngineConfig())
                await settle()
                stage.speaker.silence()
                try? await Task.sleep(for: .milliseconds(60))
            }, .fish), "no quota $0"),
            ("a provider that did not answer keeps its last word", await state({ $0.voices.quota = [(.fish, .empty("$0", until: .distantFuture))] }, { stage in
                await stage.speaker.probeQuota()
                stage.voices.quota = [(.fish, nil)]
                await stage.speaker.probeQuota()
            }, .fish), "no quota $0"),
        ])
    }

    static func deadlineFailures() async -> Int {
        let outcome = { (deadline: Duration?, quiet: @escaping @Sendable () async -> Void, work: @escaping @Sendable () async throws -> Int) async -> String in
            let task = Task { try await work() }
            do { return "\(try await answer(of: task, within: deadline, after: quiet))" } catch {
                return "\(error)\(task.isCancelled ? ", cancelled" : "")"
            }
        }
        let cancelled = Task { try await Task.sleep(for: .seconds(60)); return 1 }
        let waiter = Task { try await answer(of: cancelled, within: .seconds(60)) }
        await settle()
        waiter.cancel()
        // a drain does not end on a cancel
        let longQuiet = { @Sendable () async -> Void in
            await withCheckedContinuation { done in DispatchQueue.global().asyncAfter(deadline: .now() + 4) { done.resume() } }
        }
        let began = ContinuousClock.now
        _ = try? await waiter.value
        return check("deadline", [
            ("an answer in time", await outcome(.seconds(60), {}) { 1 }, "1"),
            ("no deadline", await outcome(nil, {}) { 1 }, "1"),
            ("too late: the task ends too", await outcome(.milliseconds(10), {}) { try await Task.sleep(for: .seconds(60)); return 1 }, "timeout, cancelled"),
            ("the deadline waits for the quiet", await outcome(.milliseconds(1), { try? await Task.sleep(for: .seconds(60)) }) { try await Task.sleep(for: .milliseconds(30)); return 1 }, "1"),
            ("a failure before the quiet does not wait for it", "\(await outcome(.seconds(60), longQuiet) { throw EngineError.status(500) }), \(ContinuousClock.now - began < .seconds(2) ? "at once" : "late")", "status(500), at once"),
            ("a failure of its own", await outcome(.seconds(60), {}) { throw EngineError.status(500) }, "status(500)"),
            ("a wait that is cancelled cancels the task", cancelled.isCancelled ? "cancelled" : "runs on", "cancelled"),
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
        await row("paused mid-sound: the next one waits", { player, _, _ in
            try player.schedule(pcm, EngineConfig())
            player.pause()
            try player.schedule(pcm, EngineConfig())
            player.resume()
        }, "speed 1.0 | start | play | sound | pause | speed 1.0 | sound | play")
        await row("paused before the first sound", { player, _, _ in
            player.pause()
            try player.schedule(pcm, EngineConfig())
            player.resume()
        }, "pause | speed 1.0 | start | sound | play")
        await row("resumed before the first sound: a resting device is not played", { player, _, _ in player.pause(); player.resume() }, "pause")
        await row("a pause between two sounds is no gap", { player, audio, _ in
            try player.schedule(pcm, EngineConfig())
            audio.endsNext()
            await settle()
            player.pause()
            try? await Task.sleep(for: .milliseconds(400))
            player.resume()
            try player.schedule(pcm, EngineConfig())
        }, "speed 1.0 | start | play | sound | pause | speed 1.0 | play | «silence: N ms mid-read» | sound")
        return check("player", rows)
    }

    static func voiceFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, act: (VoiceOutput, PlantedSynths, Calls) async -> Void, want: String) in
            let calls = Calls(), synths = PlantedSynths(calls)
            await act(VoiceOutput(make: synths.make), synths, calls)
            await settle()
            rows.append((name, calls.made.joined(separator: " | "), want))
        }
        let speak = { (voice: VoiceOutput, text: String, calls: Calls) in
            Task {
                await voice.speak(Chunk(lang: .en, text: text), EngineConfig()) { calls.made.append("first word") }
                calls.made.append("over")
            }
            await settle()
        }
        await row("a text, to its end", { voice, synths, calls in
            await speak(voice, "One.", calls)
            calls.made.append("\(voice.isBusy)")
            synths.made[0].onWord()
            synths.made[0].onWord()
            synths.made[0].onEnd()
            await settle()
            calls.made.append("\(voice.isBusy)")
        }, "start One. | true | first word | over | false")
        await row("an end with no word reported frees it", { voice, synths, calls in
            await speak(voice, "—", calls)
            synths.made[0].onEnd()
            await settle()
            calls.made.append("\(voice.isBusy)")
        }, "start — | over | false")
        await row("a synth that refuses", { voice, synths, calls in
            synths.refuses = true
            await speak(voice, "One.", calls)
            calls.made.append("\(voice.isBusy)")
        }, "start One. | stop One. | over | false")
        await row("stopped", { voice, _, calls in await speak(voice, "One.", calls); voice.stop() }, "start One. | stop One. | over")
        await row("a stopped one's late words are not the next one's", { voice, synths, calls in
            await speak(voice, "One.", calls)
            voice.stop()
            await settle()
            await speak(voice, "Two.", calls)
            synths.made[0].onWord()
            synths.made[0].onEnd()
            await settle()
            calls.made.append("\(voice.isBusy)")
        }, "start One. | stop One. | over | start Two. | true")
        await row("a new text cuts the one that talks", { voice, _, calls in await speak(voice, "One.", calls); await speak(voice, "Two.", calls) },
                  "start One. | stop One. | start Two. | over")
        await row("paused and resumed mid-text", { voice, _, calls in await speak(voice, "One.", calls); voice.pause(); voice.resume() }, "start One. | pause One. | resume One.")
        await row("a text that comes under a pause waits for the resume", { voice, _, calls in
            voice.pause()
            await speak(voice, "One.", calls)
            calls.made.append("held")
            voice.resume()
        }, "held | start One.")
        await row("a pause over a held text pauses nothing", { voice, _, calls in voice.pause(); await speak(voice, "One.", calls); voice.pause() }, "")
        await row("a held text that is stopped never starts", { voice, _, calls in
            voice.pause()
            await speak(voice, "One.", calls)
            voice.stop()
            await settle()
            voice.resume()
        }, "stop One. | over")
        await row("a text after a pause that ended starts at once", { voice, _, calls in
            voice.pause()
            voice.resume()
            await speak(voice, "One.", calls)
        }, "start One.")
        await row("a held text after a spoken one starts, it does not resume", { voice, synths, calls in
            await speak(voice, "One.", calls)
            synths.made[0].onEnd()
            await settle()
            voice.pause()
            await speak(voice, "Two.", calls)
            voice.resume()
        }, "start One. | over | start Two.")
        await row("resume with nothing held", { voice, _, _ in voice.resume() }, "")
        return check("voice", rows)
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
        voices.player = player
        speaker = Speaker(
            player: player, macVoice: PlantedOutput { call("mac " + $0) }, voices: voices, pill: PlantedPill(call),
            settings: { [weak self] in Stage.config(self?.chain ?? []) }, log: { call("«\($0)»") }
        )
    }

    var transcript: String {
        calls.joined(separator: " | ")
            .replacingOccurrences(of: "silence: ([3-9][0-9][0-9]|[0-9]{4,}) ms", with: "silence: LONG", options: .regularExpression)
            .replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression)
            .replacingOccurrences(of: "in (8[0-9][0-9]|900)", with: "in 900", options: .regularExpression)
            .replacingOccurrences(of: "skipped: [^«»]*-1004[^«»]*, off", with: "skipped: URLError, off", options: .regularExpression)
    }

    static func config(_ chain: [Engine]) -> Config {
        let names = chain.map { "\"\($0.rawValue)\"" }.joined(separator: ",")
        return try! JSONDecoder().decode(Config.self, from: Data(#"{"chain":{"en":[\#(names)],"uk":["system"]},"firstAudioMs":900,"engines":{}}"#.utf8))
    }
    static func chunks(_ text: String) -> [Chunk] { text.split(separator: " ").map { Chunk(lang: .en, text: String($0)) } }
    func read(_ text: String) { read(Stage.chunks(text)) }
    func read(_ parts: [Chunk]) { speaker.read(parts, pressed: .now); drop("reload keys") }
    func readThen(_ text: String, _ act: (Speaker) -> Void) async {
        read(text)
        await settle()
        act(speaker)
        drop("reload keys")
    }
    private func drop(_ call: String) { calls.removeAll { $0 == call } }
}

enum Step { case plays, waits, fails(Error), failsMidChunk(Error), ignoresStop, sounds }

@MainActor
final class PlantedVoices: ChunkVoices {
    // the next answers of an engine, in order; past them it plays
    var script: [Engine: [Step]] = [:]
    var keyless: Set<Engine> = []
    var quota: [(Engine, Quota?)] = []
    var player: Player?
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
        case .failsMidChunk(let error):
            onAudio()
            throw error
        case .sounds:
            try player?.schedule(SpeakerTest.pcm, EngineConfig())
            onAudio()
        case .ignoresStop: try? await Task.sleep(for: .milliseconds(20))
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
final class PlantedSynths {
    private let calls: Calls
    var refuses = false
    private(set) var made: [PlantedSynth] = []
    init(_ calls: Calls) { self.calls = calls }
    func make(_ chunk: Chunk, _ settings: EngineConfig, _ onWord: @escaping @MainActor () -> Void, _ onEnd: @escaping @MainActor () -> Void) -> any Synth {
        let synth = PlantedSynth(chunk.text, calls, refuses, onWord, onEnd)
        made.append(synth)
        return synth
    }
}

@MainActor
final class PlantedSynth: Synth {
    private let text: String, calls: Calls, refuses: Bool
    let onWord: @MainActor () -> Void, onEnd: @MainActor () -> Void
    init(_ text: String, _ calls: Calls, _ refuses: Bool, _ onWord: @escaping @MainActor () -> Void, _ onEnd: @escaping @MainActor () -> Void) {
        (self.text, self.calls, self.refuses, self.onWord, self.onEnd) = (text, calls, refuses, onWord, onEnd)
    }
    func start() -> Bool { calls.made.append("start \(text)"); return !refuses }
    func pause() { calls.made.append("pause \(text)") }
    func resume() { calls.made.append("resume \(text)") }
    func stop() { calls.made.append("stop \(text)") }
}

@MainActor
final class PlantedPill: SpeechPill {
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }
    func follow(_ playback: Playback) { call("pill \(playback.read.map(String.init) ?? "-")\(playback.isPaused ? " paused" : "")") }
    func leave() { call("leave") }
}
