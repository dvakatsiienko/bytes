// one read, driven whole with no sound: planted engines, a planted audio device, a planted pill, and every call in order
import Foundation

@MainActor
enum SpeakerTest {
    static func failures() async -> Int {
        await readFailures() + playerFailures() + deadlineFailures()
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
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «read 1: chunk 2/2» | kokoro Bye. in 3000 | drop ahead | rest | pill -")
        let named = { (script: [Engine: [Step]]) in { (stage: Stage) in
            stage.namesEngines = true
            stage.voices.script = script
        } }
        await row("a chunk names its engine, once it spoke", named([:]), { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «read 1: chunk 1/2 → kokoro» | «read 1: chunk 2/2» | kokoro Bye. in 3000 | «read 1: chunk 2/2 → kokoro» | drop ahead | rest | pill -")
        await row("a chunk that was cut off is one voice's, and no other's", named([.kokoro: [.failsMidChunk(EngineError.status(500))]]), { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «read 1: chunk 1/1 → kokoro, cut off» | «kokoro skipped: status(500), off for 60 s» | drop ahead | rest | pill -")
        await row("a chunk stopped in its sound names its engine too", named([.kokoro: [.soundsOn]]), { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.silence()
            await settle()
            stage.calls.removeAll { !$0.hasPrefix("«") }
        }, "«read 1: stopped» | «read 1: chunk 1/1 → kokoro, stopped»")
        await row("and one whose voice returns normally from the stop", named([.kokoro: [.soundsIgnoringStop]]), { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.silence()
            await settle()
            stage.calls.removeAll { !$0.hasPrefix("«") }
        }, "«read 1: stopped» | «read 1: chunk 1/1 → kokoro, stopped»")
        await row("a chunk stopped unheard names none", named([.kokoro: [.waits]]), { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.silence()
        }, "«read 1: stopped» | drop ahead | stop | pill - | rest")
        await row("a voice that failed unheard is not named", named([.kokoro: [.fails(EngineError.status(500))]]), { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: status(500), off for 60 s» | system Hello. | «first audio: system N ms» | «read 1: chunk 1/1 → system» | drop ahead | rest | pill -")
        await row("nor one with nothing to say", named([.kokoro: [.saysNothing]]), { $0.read("….") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro …. in 3000 | drop ahead | rest | pill -")
        await row("an engine that fails before its first sound hands the chunk on", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «kokoro skipped: status(500), off for 60 s» | system Hello. | «first audio: system N ms» | «read 1: chunk 2/2» | system Bye. | drop ahead | rest | pill -")
        await row("an engine that fails after its first sound ends the chunk: no second voice reads it", { $0.voices.script[.kokoro] = [.failsMidChunk(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | «kokoro skipped: status(500), off for 60 s» | «read 1: chunk 2/2» | system Bye. | drop ahead | rest | pill -")
        await row("a stream that says «cancelled» on its own ends no read", { $0.voices.script[.kokoro] = [.fails(CancellationError())] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout, off for 60 s» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("a read ends with its last sound, not before", { $0.voices.script[.kokoro] = [.sounds] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls.append("\(stage.speaker.playback)")
            stage.audio.endsNext()
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | speed 1.0 | start | play | sound | «first audio: kokoro N ms» | reading(1, isPaused: false) | drop ahead | rest | pill -")
        await row("a stop while the last sound plays ends it once", { $0.voices.script[.kokoro] = [.sounds] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.silence()
        }, "«read 1: stopped» | drop ahead | stop | pill - | rest")
        await row("a new read while the last sound plays is not ended by the old one", { $0.voices.script[.kokoro] = [.sounds, .waits] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.read("New.")
            await settle()
            stage.calls.append("\(stage.speaker.playback)")
        }, "«read 1: stopped» | drop ahead | stop | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | rest | reading(2, isPaused: false)")
        await row("a stopped read asks for no second chunk", { $0.voices.script[.kokoro] = [.ignoresStop] }, { stage in
            await stage.readThen("Hello. Bye.") { $0.silence() }
            try? await Task.sleep(for: .milliseconds(60))
        }, "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | pill - | rest")
        await row("a read after a preview hears the saved settings", plain, { stage in
            _ = stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
            await settle()
            stage.calls = []
            stage.read("Hello.")
        }, "pill 2 | «read 2: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | drop ahead | rest | pill -")
        await row("a read over a preview hears the saved settings", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            _ = stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
            await settle()
            stage.calls = []
            stage.read("Hello.")
        }, "«read 1: stopped» | drop ahead | stop | pill 2 | «read 2: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | drop ahead | rest | pill - | rest")
        await row("kokoro's hang takes none of the cloud's budget", { $0.chain = [.kokoro, .fish, .system]; $0.budget = 100; $0.voices.script[.kokoro] = [.failsLate(EngineError.timeout)] }, { stage in
            stage.read("Hello.")
            try? await Task.sleep(for: .milliseconds(300))
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout, off for 60 s» | fish Hello. in 100 | «first audio: fish N ms» | drop ahead | rest | pill -")
        await row("a hang under sound leaves the next engine its budget", { $0.chain = [.kokoro, .fish, .system]; $0.budget = 100; $0.voices.script[.kokoro] = [.sounds, .failsLate(EngineError.timeout)] }, { stage in
            stage.read("Hello. Bye.")
            await settle()
            stage.audio.endsNext()
            try? await Task.sleep(for: .milliseconds(300))
        }, "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | speed 1.0 | start | play | sound | «first audio: kokoro N ms» | «read 1: chunk 2/2» | kokoro Bye. in 3000 | «kokoro skipped: timeout, off for 60 s» | fish Bye. in 100 | «voice switch: kokoro → fish mid-read» | drop ahead | rest | pill -")
        await row("a cloud lead's hang leaves the next engine its budget", { $0.chain = [.fish, .elevenlabs, .system]; $0.budget = 100; $0.voices.script[.fish] = [.plays, .failsLate(EngineError.timeout)] }, { stage in
            stage.read("Hello. Bye.")
            try? await Task.sleep(for: .milliseconds(300))
        }, "pill 1 | «read 1: chunk 1/2» | fish Hello. in 100 | «first audio: fish N ms» | ahead fish Bye. | «read 1: chunk 2/2» | fish Bye. in 3000 | «fish skipped: timeout» | elevenlabs Bye. in 100 | «voice switch: fish → elevenlabs mid-read» | drop ahead | rest | pill -")
        await row("a cloud voice behind the read's own, under sound, gets the budget", { $0.chain = [.kokoro, .fish, .system]; $0.budget = 100; $0.voices.script[.kokoro] = [.sounds, .fails(EngineError.status(500))] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | speed 1.0 | start | play | sound | «first audio: kokoro N ms» | «read 1: chunk 2/2» | kokoro Bye. in 3000 | «kokoro skipped: status(500), off for 60 s» | fish Bye. in 100 | «voice switch: kokoro → fish mid-read»")
        await row("two cloud misses under sound share one budget, from the moment nothing plays", { $0.chain = [.kokoro, .fish, .elevenlabs, .system]; $0.budget = 100; $0.voices.script = [.kokoro: [.sounds, .fails(EngineError.status(500))], .fish: [.failsLate(EngineError.timeout)]] }, { stage in
            stage.read("Hello. Bye.")
            await settle()
            stage.calls = []
            stage.audio.endsNext()
            try? await Task.sleep(for: .milliseconds(300))
        }, "«fish skipped: timeout» | system Bye. | «voice switch: kokoro → system mid-read» | drop ahead | rest | pill -")
        await row("the output goes away under sound: the budget runs from there", { $0.chain = [.kokoro, .fish, .elevenlabs, .system]; $0.budget = 100; $0.voices.script = [.kokoro: [.sounds, .fails(EngineError.status(500))], .fish: [.failsLate(EngineError.timeout)]] }, { stage in
            stage.read("Hello. Bye.")
            await settle()
            stage.audio.onGone("gone")
            await settle()
            stage.calls = []
            try? await Task.sleep(for: .milliseconds(300))
        }, "«fish skipped: timeout» | system Bye. | «voice switch: kokoro → system mid-read» | drop ahead | rest | pill -")
        await row("a stop before the read is not its quiet", { $0.chain = [.kokoro, .fish, .elevenlabs, .system]; $0.budget = 100; $0.voices.script = [.kokoro: [.sounds, .fails(EngineError.status(500))], .fish: [.fails(EngineError.status(500))]] }, { stage in
            stage.speaker.silence()
            try? await Task.sleep(for: .milliseconds(150))
            stage.read("Hello. Bye.")
            await settle()
            stage.calls = [stage.calls.last { $0.hasPrefix("elevenlabs") } ?? "-"]
        }, "elevenlabs Bye. in 100")
        await row("a pause in the quiet is not part of the budget", { $0.chain = [.kokoro, .fish, .elevenlabs, .system]; $0.budget = 900; $0.voices.script = [.kokoro: [.sounds, .fails(EngineError.status(500))], .fish: [.failsWhenTold(EngineError.status(500))]] }, { stage in
            stage.read("Hello. Bye.")
            await settle()
            stage.audio.endsNext()
            await settle()
            stage.speaker.togglePause()
            try? await Task.sleep(for: .milliseconds(1000))
            stage.speaker.togglePause()
            stage.voices.tellToFail()
            await settle()
            stage.calls = [stage.calls.contains { $0.hasPrefix("elevenlabs") } ? "asked" : "skipped"]
        }, "asked")
        await row("a cloud miss under sound leaves the next one the whole budget", { $0.chain = [.kokoro, .fish, .elevenlabs, .system]; $0.budget = 100; $0.voices.script = [.kokoro: [.sounds, .fails(EngineError.status(500))], .fish: [.fails(EngineError.status(500))]] }, { stage in
            stage.read("Hello. Bye.")
            await settle()
            stage.calls = [stage.calls.last { $0.hasPrefix("elevenlabs") } ?? "-"]
        }, "elevenlabs Bye. in 100")
        await row("two cloud misses share one budget", { $0.chain = [.elevenlabs, .fish, .system]; $0.budget = 100; $0.voices.script[.elevenlabs] = [.failsLate(EngineError.timeout)] }, { stage in
            stage.read("Hello.")
            try? await Task.sleep(for: .milliseconds(300))
        }, "pill 1 | «read 1: chunk 1/1» | elevenlabs Hello. in 100 | «elevenlabs skipped: timeout» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        for (name, step) in [("refusal", Step.fails(EngineError.status(500))), ("hang", .failsLate(EngineError.timeout))] {
            let words = name == "hang" ? "timeout, off for 60 s" : "status(500), off for 60 s"
            await row("a spent budget stays spent after kokoro's \(name)", { $0.chain = [.elevenlabs, .kokoro, .fish, .system]; $0.budget = 100; $0.voices.script = [.elevenlabs: [.failsLate(EngineError.timeout)], .kokoro: [step]] }, { stage in
                stage.read("Hello.")
                try? await Task.sleep(for: .milliseconds(450))
            }, "pill 1 | «read 1: chunk 1/1» | ahead kokoro Hello. | elevenlabs Hello. in 100 | «elevenlabs skipped: timeout» | kokoro Hello. in 3000 | «kokoro skipped: \(words)» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        }
        await row("a press looks for the keys that were missing", plain, { $0.speaker.read(Stage.chunks("Hello."), pressed: .now) },
                  "pill 1 | reload keys | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «first audio: kokoro N ms» | drop ahead | rest | pill -")
        await row("a preview opens its own next chunk ahead, whatever the chain", plain, { _ = $0.speaker.preview("Hello there. Bye now.", with: .fish, settings: EngineConfig()) },
                  "drop ahead | stop | pill 1 | «read 1: chunk 1/2» | fish Hello there. | «first audio: fish N ms» | ahead fish Bye now. | «read 1: chunk 2/2» | fish Bye now. | drop ahead | rest | pill - | rest")
        await row("nothing is opened ahead in a language the engine does not lead", { $0.chain = [.fish, .system] }, { $0.read([Chunk(lang: .en, text: "Hello."), Chunk(lang: .uk, text: "Привіт.")]) },
                  "pill 1 | «read 1: chunk 1/2» | fish Hello. in 900 | «first audio: fish N ms» | «read 1: chunk 2/2» | system Привіт. | «voice switch: fish → system mid-read» | drop ahead | rest | pill -")
        await row("a hung kokoro costs its wait once: the next press goes past it", { $0.voices.script[.kokoro] = [.fails(EngineError.timeout)] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.read("Bye.")
        }, "pill 2 | «read 2: chunk 1/1» | system Bye. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("a benched kokoro is asked once no other voice spoke", { $0.voices.script = [.kokoro: [.fails(EngineError.timeout)], .system: [.fails(EngineError.noVoice), .fails(EngineError.noVoice)]] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «kokoro skipped: timeout, off for 60 s» | system Hello. | «system skipped: noVoice» | «read 1: chunk 2/2» | system Bye. | «system skipped: noVoice» | kokoro Bye. | «first audio: kokoro N ms» | drop ahead | rest | pill -")
        await row("on the next press too", { $0.chain = [.kokoro, .fish]; $0.voices.script = [.kokoro: [.fails(EngineError.timeout)], .fish: [.fails(EngineError.noKey), .fails(EngineError.noKey)]] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.read("Bye.")
        }, "pill 2 | «read 2: chunk 1/1» | fish Bye. | «fish skipped: noKey» | kokoro Bye. | «first audio: kokoro N ms» | drop ahead | rest | pill -")
        await row("a kokoro whose wait ran out hands its chunk on", { $0.voices.script[.kokoro] = [.fails(EngineError.timeout)] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout, off for 60 s» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("a quota refusal asks the provider", { $0.voices.script[.kokoro] = [.fails(EngineError.quota("14 left"))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: quota(\"14 left\"), off for 3600 s» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill - | balances")
        let refused = { (stage: Stage) in
            stage.chain = [.elevenlabs, .system]
            stage.voices.balance = [.elevenlabs: Balance(left: 150)]
            stage.voices.script[.elevenlabs] = [.fails(EngineError.quota("needs 203"))]
        }
        let again: @MainActor (Stage) async -> Void = { stage in
            await settle()
            stage.calls = []
            stage.read("Bye.")
        }
        await row("a refusal with credits left holds: the next read is not refused again", refused, { stage in
            stage.read("Hello.")
            await again(stage)
        }, "pill 2 | «read 2: chunk 1/1» | system Bye. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("a balance that grew lifts it", refused, { stage in
            stage.read("Hello.")
            await settle()
            stage.voices.balance = [.elevenlabs: Balance(left: 10_000)]
            await stage.speaker.probeQuota()
            await again(stage)
        }, "pill 2 | «read 2: chunk 1/1» | elevenlabs Bye. in 900 | «first audio: elevenlabs N ms» | drop ahead | rest | pill -")
        await row("a balance asked for before the refusal lifts nothing", { stage in
            refused(stage)
            stage.voices.balance = [.elevenlabs: Balance(left: 99, empty: "99 left")]
            stage.voices.balanceWaits = [.milliseconds(60)]
        }, { stage in
            let early = Task { await stage.speaker.probeQuota() }
            await settle()
            stage.voices.balance = [.elevenlabs: Balance(left: 150)]
            stage.read("Hello.")
            await early.value
            await settle()
            stage.calls = [stage.speaker.health()["elevenlabs"]?.note ?? "-"]
        }, "needs 203")
        await row("a cloud voice with nothing to say leads nothing", { $0.chain = [.fish, .kokoro, .system]; $0.voices.script[.fish] = [.saysNothing] }, { $0.read("… Hello.") },
                  "pill 1 | «read 1: chunk 1/2» | ahead kokoro … | fish … in 900 | «read 1: chunk 2/2» | ahead kokoro Hello. | fish Hello. in 900 | «first audio: fish N ms» | drop ahead | rest | pill -")
        await row("the mac voice leads, a word heard or not", { $0.chain = [.fish, .system]; $0.voices.script = [.fish: [.fails(EngineError.timeout)], .system: [.saysNothing]] }, { $0.read("… Hello.") },
                  "pill 1 | «read 1: chunk 1/2» | fish … in 900 | «fish skipped: timeout» | system … | «read 1: chunk 2/2» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("a refusal's own note is logged", { $0.chain = [.fish, .system]; $0.voices.script[.fish] = [.fails(EngineError.status(402))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | fish Hello. in 900 | «fish skipped: status(402), off for 3600 s» | «⚠️ FISH REFUSED s2.1-pro-free (402): the free tier may have ended; the chain falls through for an hour; check fish.audio» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("of two balance calls at once the newer one's answer stays", { stage in
            stage.voices.balance = [.fish: Balance(left: 0, empty: "$0")]
            stage.voices.balanceWaits = [.milliseconds(60)]
        }, { stage in
            let early = Task { await stage.speaker.probeQuota() }
            await settle()
            stage.voices.balance = [.fish: Balance(left: 5)]
            await stage.speaker.probeQuota()
            await early.value
            stage.calls = [stage.speaker.health()["fish"]?.state.rawValue ?? "-"]
        }, "live")
        await row("one engine's refusal leaves the other its balance", { stage in
            refused(stage)
            stage.voices.balance = [.elevenlabs: Balance(left: 150), .fish: Balance(left: 0, empty: "$0")]
            stage.voices.balanceWaits = [.milliseconds(60)]
        }, { stage in
            stage.read("Hello.")
            await settle()
            _ = stage.speaker.preview("Hi.", with: .elevenlabs, settings: EngineConfig())
            try? await Task.sleep(for: .milliseconds(120))
            stage.calls = [.elevenlabs, .fish].map { (engine: Engine) in stage.speaker.health()[engine.rawValue]?.state.rawValue ?? "-" }
        }, "live | no quota")
        await row("a balance asked for before the engine spoke again holds nothing", { stage in
            refused(stage)
            stage.voices.balance = [:]
        }, { stage in
            stage.read("Hello.")
            await settle()
            stage.voices.balance = [.elevenlabs: Balance(left: 0, empty: "0 left")]
            stage.voices.balanceWaits = [.milliseconds(60)]
            let early = Task { await stage.speaker.probeQuota() }
            await settle()
            _ = stage.speaker.preview("Hi.", with: .elevenlabs, settings: EngineConfig())
            await early.value
            await settle()
            stage.calls = [stage.speaker.health()["elevenlabs"]?.state.rawValue ?? "-"]
        }, "live")
        await row("kokoro's server gone is started again", { $0.voices.script[.kokoro] = [.fails(URLError(.cannotConnectToHost))] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | restart kokoro | «kokoro skipped: URLError, off for 60 s» | system Hello. | «first audio: system N ms» | drop ahead | rest | pill -")
        await row("every engine fails", { $0.voices.script = [.kokoro: [.fails(EngineError.timeout)], .system: [.fails(EngineError.noVoice)]] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | «kokoro skipped: timeout, off for 60 s» | system Hello. | «system skipped: noVoice» | drop ahead | rest | pill -")
        await row("a stop while an engine works: nothing after it", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.silence() } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | pill - | rest")
        await row("a new read cuts the one that plays", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello. Bye.") { $0.read(Stage.chunks("New."), pressed: .now) } },
                  "pill 1 | «read 1: chunk 1/2» | kokoro Hello. in 3000 | «read 1: stopped» | drop ahead | stop | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | «first audio: kokoro N ms» | drop ahead | rest | pill - | rest")
        await row("a stop with nothing playing still silences and hides", plain, { $0.speaker.silence() }, "drop ahead | stop | leave | rest")
        await row("a cloud engine that streams opens the next chunk ahead", { $0.chain = [.fish, .system] }, { $0.read("Hello. Bye.") },
                  "pill 1 | «read 1: chunk 1/2» | fish Hello. in 900 | «first audio: fish N ms» | ahead fish Bye. | «read 1: chunk 2/2» | fish Bye. in 3000 | drop ahead | rest | pill -")
        await row("kokoro renders behind a cloud engine's race", { $0.chain = [.fish, .kokoro] }, { $0.read("Hello.") },
                  "pill 1 | «read 1: chunk 1/1» | ahead kokoro Hello. | fish Hello. in 900 | «first audio: fish N ms» | drop ahead | rest | pill -")
        await row("a preview hears its card's settings, benched or not", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { stage in
            stage.read("Hello.")
            await settle()
            stage.calls = []
            stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig(gain: 3))
        }, "drop ahead | stop | pill 2 | «read 2: chunk 1/1» | kokoro Sample. gain 3.0 | «first audio: kokoro N ms» | drop ahead | rest | pill - | rest")
        await row("a preview of a failing engine falls to nobody", { $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { stage in
            stage.speaker.preview("Sample.", with: .kokoro, settings: EngineConfig())
        }, "drop ahead | stop | pill 1 | «read 1: chunk 1/1» | kokoro Sample. | «kokoro skipped: status(500), off for 60 s» | drop ahead | rest | pill - | rest")
        await row("pause and resume reach the player", { $0.voices.script[.kokoro] = [.waits] }, { await $0.readThen("Hello.") { $0.togglePause(); $0.togglePause() } },
                  "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | pill 1 paused | pill 1")
        await row("a chunk that lands under a pause waits for the resume", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause() }
            try? stage.player.schedule(pcm, EngineConfig())
            stage.calls.append("\(stage.speaker.playback)")
            stage.speaker.togglePause()
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | pill 1 paused | speed 1.0 | start | sound | reading(1, isPaused: true) | play | pill 1")
        await row("a read over a paused one is not paused", { $0.voices.script[.kokoro] = [.waits, .waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause(); $0.read(Stage.chunks("New."), pressed: .now) }
            await settle()
            try? stage.player.schedule(pcm, EngineConfig())
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | pill 1 paused | «read 1: stopped» | drop ahead | stop | pill 2 | «read 2: chunk 1/1» | kokoro New. in 3000 | rest | speed 1.0 | start | play | sound")
        await row("a stop under a pause leaves nothing paused", { $0.voices.script[.kokoro] = [.waits] }, { stage in
            await stage.readThen("Hello.") { $0.togglePause(); $0.silence() }
            await settle()
            try? stage.player.schedule(pcm, EngineConfig())
        }, "pill 1 | «read 1: chunk 1/1» | kokoro Hello. in 3000 | pause | pill 1 paused | «read 1: stopped» | drop ahead | stop | pill - | rest | speed 1.0 | start | play | sound")
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
            let health = stage.speaker.health()[engine.rawValue]
            return [health?.state.rawValue, health?.note].compactMap { $0 }.joined(separator: " ")
        }
        return check("health", [
            ("untouched", await state({ _ in }, { _ in }, .kokoro), "live"),
            ("a cloud engine with no key", await state({ $0.voices.keyless = [.fish] }, { _ in }, .fish), "no key"),
            ("a failure benches", await state({ $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello.") }, .kokoro), "benched"),
            ("a warm kokoro is live again", await state({ $0.voices.script[.kokoro] = [.fails(EngineError.status(500))] }, { $0.read("Hello."); await settle(); $0.speaker.serverIsWarm(of: .kokoro) }, .kokoro), "live"),
            ("a full balance ends no other bench", await state({ $0.chain = [.fish, .system]; $0.voices.balance = [.fish: Balance(left: 5)]; $0.voices.script[.fish] = [.fails(EngineError.status(500))] }, { stage in
                stage.read("Hello.")
                await settle()
                await stage.speaker.probeQuota()
            }, .fish), "benched"),
            ("an empty balance", await state({ $0.voices.balance = [.fish: Balance(left: 0, empty: "$0")] }, { await $0.speaker.probeQuota() }, .fish), "no quota $0"),
            ("an empty balance past its refill", await state({ $0.voices.balance = [.fish: Balance(left: 0, refills: Date() + 0.03, empty: "$0")] }, { stage in
                await stage.speaker.probeQuota()
                try? await Task.sleep(for: .milliseconds(60))
            }, .fish), "live"),
            ("an empty balance before its refill", await state({ $0.voices.balance = [.fish: Balance(left: 0, refills: Date() + 60, empty: "$0")] }, { await $0.speaker.probeQuota() }, .fish), "no quota $0"),
            ("a balance that came back", await state({ $0.voices.balance = [.fish: Balance(left: 0, empty: "$0")] }, { stage in
                await stage.speaker.probeQuota()
                stage.voices.balance = [.fish: Balance(left: 5)]
                await stage.speaker.probeQuota()
            }, .fish), "live"),
            ("a stopped voice that returns normally proves nothing", await state({ $0.voices.balance = [.fish: Balance(left: 0, empty: "$0")]; $0.voices.script[.fish] = [.ignoresStop] }, { stage in
                await stage.speaker.probeQuota()
                _ = stage.speaker.preview("Hi.", with: .fish, settings: EngineConfig())
                await settle()
                stage.speaker.silence()
                try? await Task.sleep(for: .milliseconds(60))
            }, .fish), "no quota $0"),
            ("a provider that did not answer keeps its last word", await state({ $0.voices.balance = [.fish: Balance(left: 0, empty: "$0")] }, { stage in
                await stage.speaker.probeQuota()
                stage.voices.balance = [:]
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
            ("an answer that came after it was cut is late", await outcome(.milliseconds(10), {}) {
                await withCheckedContinuation { done in DispatchQueue.global().asyncAfter(deadline: .now() + 0.06) { done.resume() } }
                return 1
            }, "timeout, cancelled"),
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
        await row("a drain whose wait is cancelled ends", { player, _, stage in
            try player.schedule(pcm, EngineConfig())
            let wait = Task { await player.drained(); stage.calls.append("over") }
            await settle()
            wait.cancel()
        }, "speed 1.0 | start | play | sound | over")
        await row("a drain asked for by a cancelled task ends at once", { player, _, stage in
            try player.schedule(pcm, EngineConfig())
            Task { await player.drained(); stage.calls.append("over") }.cancel()
        }, "speed 1.0 | start | play | sound | over")
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
        await row("a stop ends the wait and drops what is scheduled", { _, audio, stage in
            // it rests after the row's end: the two orders of the rest and the wait's end are both right
            let player = Player(device: audio, settling: .seconds(60), log: { _ in })
            try player.schedule(pcm, EngineConfig())
            Task { await player.drained(); stage.calls.append("drained") }
            await settle()
            player.stop()
            stage.calls.append("\(player.isPlaying)")
        }, "speed 1.0 | start | play | sound | stop | false | drained")
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
    var budget = 900
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
            player: player, voices: voices, pill: PlantedPill(call),
            settings: { [weak self] in Stage.config(self?.chain ?? [], self?.budget ?? 900) }, toChunks: { spokenChunks(of: $0) }, log: { call("«\($0)»") }
        )
    }

    // the lines that name a chunk's engine: asked for by the rows about them alone
    var namesEngines = false
    var transcript: String {
        calls.filter { namesEngines || !$0.contains(" → ") || !$0.hasPrefix("«read ") }.joined(separator: " | ")
            .replacingOccurrences(of: "silence: ([3-9][0-9][0-9]|[0-9]{4,}) ms", with: "silence: LONG", options: .regularExpression)
            .replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression)
            .replacingOccurrences(of: "in ([5-9][0-9]|100) ", with: "in 100 ", options: .regularExpression)
            .replacingOccurrences(of: "in (8[0-9][0-9]|900)", with: "in 900", options: .regularExpression)
            .replacingOccurrences(of: "skipped: [^«»]*-1004[^«»]*, off", with: "skipped: URLError, off", options: .regularExpression)
    }

    static func config(_ chain: [Engine], _ budget: Int) -> Config {
        let names = chain.map { "\"\($0.rawValue)\"" }.joined(separator: ",")
        return try! JSONDecoder().decode(Config.self, from: Data(#"{"chain":{"en":[\#(names)],"uk":["system"]},"firstAudioMs":\#(budget),"engines":{}}"#.utf8))
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

enum Step { case plays, waits, fails(Error), failsMidChunk(Error), ignoresStop, sounds, saysNothing, failsLate(Error), failsWhenTold(Error), soundsOn, soundsIgnoringStop }

@MainActor
final class PlantedVoices: ChunkVoices {
    // the next answers of an engine, in order; past them it plays
    var script: [Engine: [Step]] = [:]
    var keyless: Set<Engine> = []
    var balance: [Engine: Balance] = [:]
    // how long the next balance calls take, in order
    var balanceWaits: [Duration] = []
    var player: Player?
    private var told: CheckedContinuation<Void, Never>?
    func tellToFail() {
        told?.resume()
        told = nil
    }
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
        case .failsLate(let error):
            try? await Task.sleep(for: .milliseconds(150))
            throw error
        case .failsWhenTold(let error):
            await withCheckedContinuation { told = $0 }
            throw error
        case .soundsOn:
            onAudio()
            try await Task.sleep(for: .seconds(60))
        case .soundsIgnoringStop:
            onAudio()
            try? await Task.sleep(for: .seconds(60))
        case .ignoresStop: try? await Task.sleep(for: .seconds(60))
        case .saysNothing: break
        case .waits: try await Task.sleep(for: .seconds(60))
        }
    }
    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig) { call("ahead \(engine.rawValue) \(chunk.text)") }
    func dropAhead() { call("drop ahead") }
    func hasKey(_ engine: Engine) -> Bool { !keyless.contains(engine) }
    func reloadMissingKeys() { call("reload keys") }
    func balances(_ settings: (Engine) -> EngineConfig) async -> [Engine: Balance] {
        call("balances")
        let asked = balance
        if !balanceWaits.isEmpty { try? await Task.sleep(for: balanceWaits.removeFirst()) }
        return asked
    }
    func restartServer(of engine: Engine) { call("restart \(engine.rawValue)") }
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
final class PlantedPill: SpeechPill {
    private let call: (String) -> Void
    init(_ call: @escaping (String) -> Void) { self.call = call }
    func follow(_ playback: Playback) { call("pill \(playback.read.map(String.init) ?? "-")\(playback.isPaused ? " paused" : "")") }
    func leave() { call("leave") }
}
