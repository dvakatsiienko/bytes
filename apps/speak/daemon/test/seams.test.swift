// the seams the shell is wired through, each driven here without a daemon: the socket's ops and answers over recorded
// commands, the presses over a planted grab, the pill's look, the meter over a planted tuning
import Foundation

@MainActor
enum SeamsTest {
    static func failures() async -> Int {
        var failed = opFailures()
        failed += await answerFailures()
        failed += await pressFailures()
        failed += playbackFailures() + pillFailures()
        failed += meterFailures()
        failed += clockFailures() + restartFailures()
        return failed
    }

    static func opFailures() -> Int {
        let ask = { (line: String, setup: (Recorder) -> Void) -> String in
            let recorder = Recorder()
            setup(recorder)
            let request: Request
            do {
                request = try JSONDecoder().decode(Request.self, from: Data(line.utf8))
            } catch {
                return error is RequestError ? "\(error)" : "bad request"
            }
            let encoder = JSONEncoder()
            encoder.outputFormatting = .sortedKeys
            let json = (try? encoder.encode(run(request, with: recorder))).map { String(decoding: $0, as: UTF8.self) } ?? "?"
            return ([json] + recorder.calls).joined(separator: " | ")
        }
        let plain = { (line: String) in ask(line, { _ in }) }
        let settings = #"{"config":{"chain":{"en":["kokoro"]},"firstAudioMs":900},"ok":true,"version":"v2","was":"v1"}"#
        return check("op", [
            ("status", plain(#"{"op":"status"}"#), #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"paused":false,"read":7,"settings":"at","speaking":true}"#),
            ("status, nothing playing", ask(#"{"op":"status"}"#) { $0.isSpeaking = false }, #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"paused":false,"settings":"at","speaking":false}"#),
            ("voices", plain(#"{"op":"voices"}"#), #"{"engines":[{"id":"elevenlabs","label":"ElevenLabs","languages":["en","uk","ru"],"voices":[]},{"id":"kokoro","label":"Kokoro (local)","languages":["en"],"voices":[]},{"id":"system","label":"macOS voice","languages":["en","uk","ru"],"voices":[{"id":"a","lang":"uk","name":"A"}]},{"id":"fish","label":"Fish","languages":["en","uk","ru"],"voices":[{"id":"f","name":"F"}]},{"id":"gemini","label":"Gemini","languages":["en","uk","ru"],"voices":[]}]}"#),
            ("reload", plain(#"{"op":"reload"}"#), #"{"ok":true} | reload"#),
            ("reload with a bad file", ask(#"{"op":"reload"}"#) { $0.reloadError = "config.json: not readable" }, #"{"error":"config.json: not readable"} | reload"#),
            ("config", plain(#"{"op":"config"}"#), settings + " | config"),
            ("save", plain(#"{"op":"save","version":"v1","patch":{"engines":{"fish":{"gain":2,"model":null}}}}"#), settings + #" | save {"engines":{"fish":{"gain":2,"model":null}}} v1"#),
            ("save with nothing", plain(#"{"op":"save"}"#), settings + " | save - -"),
            ("a refused save", ask(#"{"op":"save"}"#) { $0.refusal = .stale }, #"{"error":"the settings changed since this page read them","stale":true} | save - -"#),
            ("heart", plain(#"{"op":"heart","engine":"fish","voice":"x","on":true}"#), settings + " | heart fish x true"),
            ("heart with nothing", plain(#"{"op":"heart"}"#), settings + " | heart - - -"),
            ("a refused heart", ask(#"{"op":"heart"}"#) { $0.refusal = .heartless }, #"{"error":"a heart needs an engine it knows, a voice, and on or off"} | heart - - -"#),
            ("pause", plain(#"{"op":"pause"}"#), #"{"ok":true} | pause"#),
            ("stop", plain(#"{"op":"stop"}"#), #"{"ok":true} | stop"#),
            ("restart", plain(#"{"op":"restart"}"#), #"{"ok":true} | restart"#),
            ("a refused restart", ask(#"{"op":"restart"}"#) { $0.restartRefusal = "x-speak is reading aloud" }, #"{"error":"x-speak is reading aloud"} | restart"#),
            ("panel-demo", plain(#"{"op":"panel-demo"}"#), #"{"ok":true} | demo"#),
            ("panel-hide", plain(#"{"op":"panel-hide"}"#), #"{"ok":true} | hide"#),
            ("wave on", plain(#"{"op":"wave","on":true,"glide":30,"flow":55}"#), #"{"ok":true} | wave true 30.0 55.0"#),
            ("wave with nothing named is off", plain(#"{"op":"wave"}"#), #"{"ok":true} | wave false - -"#),
            ("wave on while a read plays", ask(#"{"op":"wave","on":true}"#) { $0.refusesWave = true }, #"{"error":"the waveform waits: x-speak is reading aloud"} | wave true - -"#),
            ("block-main", plain(#"{"op":"block-main","seconds":2}"#), #"{"ok":true} | block 2.0"#),
            ("block-main with no seconds", plain(#"{"op":"block-main"}"#), #"{"ok":true} | block 5.0"#),
            ("read", plain(#"{"op":"read","text":"Hello. Bye."}"#), #"{"ok":true} | read Hello./Bye."#),
            ("read with no text", plain(#"{"op":"read"}"#), "read needs text"),
            ("read with an empty text", plain(#"{"op":"read","text":""}"#), #"{"error":"read: nothing to say"}"#),
            ("preview", plain(#"{"op":"preview","engine":"kokoro","text":"Hi","settings":{"gain":2}}"#), #"{"ok":true,"read":7} | preview kokoro Hi 2.0"#),
            ("preview on the saved settings", plain(#"{"op":"preview","engine":"kokoro","text":"Hi"}"#), #"{"ok":true,"read":7} | preview kokoro Hi saved"#),
            ("preview of an unknown engine", plain(#"{"op":"preview","engine":"nobody","text":"Hi"}"#), "preview needs engine and text"),
            ("preview with no text", plain(#"{"op":"preview","engine":"kokoro"}"#), "preview needs engine and text"),
            ("an unknown op", plain(#"{"op":"dance"}"#), "unknown op dance"),
            ("no op", plain("{}"), "bad request"),
        ])
    }

    static func restartFailures() -> Int {
        let ask = { (isSpeaking: Bool, job: String?, runs: String?, installed: String?) in
            restartRefusal(isSpeaking: isSpeaking, sinceAsked: nil, sinceStart: 60, job: job, runs: runs, installed: installed) ?? "restarts"
        }
        let again = { (seconds: TimeInterval) in restartRefusal(isSpeaking: false, sinceAsked: seconds, sinceStart: 60, job: "com.x", runs: "a", installed: "a") ?? "restarts" }
        let started = { (seconds: TimeInterval) in restartRefusal(isSpeaking: false, sinceAsked: nil, sinceStart: seconds, job: "com.x", runs: "a", installed: "a") ?? "restarts" }
        let newer = "another build is installed and has not run yet: daemon:relaunch starts it", alone = "launchd does not run this daemon"
        return check("restart", [
            ("quiet, on the installed build", ask(false, "com.x", "a", "a"), "restarts"),
            ("reading, or paused in a read", ask(true, "com.x", "a", "a"), "x-speak is reading aloud"),
            ("a build that never ran", ask(false, "com.x", "a", "b"), newer),
            ("no binary at its place", ask(false, "com.x", "a", nil), newer),
            ("a binary never read", ask(false, "com.x", nil, nil), newer),
            ("asked again at once", again(0.1), "a restart is on its way"),
            ("asked again, just inside the 30 s", again(29), "a restart is on its way"),
            ("asked again, the first one failed long ago", again(31), "restarts"),
            ("the daemon a restart started, asked again", started(1), "x-speak started under 30 s ago"),
            ("a daemon up just under 30 s", started(29), "x-speak started under 30 s ago"),
            ("a daemon up past 30 s", started(31), "restarts"),
            ("by hand", ask(false, nil, "a", "a"), alone),
            ("from a terminal", ask(false, "0", "a", "a"), alone),
        ])
    }

    // the log's two clocks: a press's milliseconds, a stall's seconds
    static func clockFailures() -> Int {
        let ms = { (ago: Duration) in Int(elapsed(.now - ago).dropLast(3)) ?? -1 }
        return check("clock", [
            ("a second and a half in ms", (1500..<2000).contains(ms(.milliseconds(1500))), true),
            ("a minute in ms", (60_000..<60_500).contains(ms(.seconds(60))), true),
            ("ms are named", elapsed(.now).hasSuffix(" ms"), true),
            ("a second and a half", seconds(.milliseconds(1500)) == "1.5 s", true),
            ("a minute", seconds(.seconds(60)) == "60.0 s", true),
        ])
    }

    // main's side is handed in: it runs at once, never, late, or is still busy when the budget ends
    static func answerFailures() async -> Int {
        let main = PlantedMain(), recorder = Recorder()
        let age = { (seconds: Int) in Answers(commands: { recorder }, mainAge: { .seconds(seconds) }, budget: { _ in 0 }, onMain: main.run) }
        let raw = { (answers: Answers, line: String) -> String in
            let object = try? JSONSerialization.jsonObject(with: answers.answer(Data(line.utf8)))
            let json = object.flatMap { try? JSONSerialization.data(withJSONObject: $0, options: .sortedKeys) }
            return json.map { String(decoding: $0, as: UTF8.self) } ?? "?"
        }
        let ask = { (answers: Answers, line: String) -> String in
            raw(answers, line).replacingOccurrences(of: #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"#, with: "{… ").replacingOccurrences(of: #""settings":"at","#, with: "").replacingOccurrences(of: #""read":7,"#, with: "")
        }
        let status = #"{"op":"status"}"#, stop = #"{"op":"stop"}"#
        var rows: [(name: String, got: String, want: String)] = []
        rows.append(("not a request", ask(age(0), "hello"), #"{"error":"bad request"}"#))
        rows.append(("a status is asked for once", "\(ask(age(0), status)) \(recorder.statuses)", #"{… "paused":false,"speaking":true} 1"#))
        rows.append(("an op it does not know", ask(age(0), #"{"op":"dance"}"#), #"{"error":"unknown op dance"}"#))
        rows.append(("an op without what it needs", ask(age(0), #"{"op":"read"}"#), #"{"error":"read needs text"}"#))
        rows.append(("a field of the wrong kind", ask(age(0), #"{"op":"read","text":5}"#), #"{"error":"bad request"}"#))
        main.isBlocked = true
        rows.append(("a status before main ever answered", ask(age(3), status), #"{"error":"main thread blocked for 3.0 s, status dropped","main":"blocked for 3.0 s"}"#))
        rows.append(("a stop main never began", ask(age(3), stop), #"{"error":"main thread blocked for 3.0 s, stop dropped","main":"blocked for 3.0 s"}"#))
        main.runWaiting()
        rows.append(("the stop main reached late", recorder.calls.joined(), ""))
        let busy = age(2), stalled = age(3)
        for answers in [busy, stalled] {
            main.isBlocked = false
            rows.append(("a status main answers", ask(answers, status), #"{… "paused":false,"speaking":true}"#))
        }
        recorder.isSpeaking = false
        main.isBlocked = true
        rows.append(("main missed the budget, not stalled: its last status", ask(busy, status), #"{… "paused":false,"speaking":true}"#))
        rows.append(("main stalled: its last status, with the note", ask(stalled, status), #"{… "main":"blocked for 3.0 s","paused":false,"speaking":true}"#))
        rows.append(("main stalled: another op is dropped", ask(stalled, stop), #"{"error":"main thread blocked for 3.0 s, stop dropped","main":"blocked for 3.0 s"}"#))
        main.isBlocked = false
        rows.append(("a status from before an order", ask(busy, status), #"{… "paused":false,"speaking":false}"#))
        recorder.isSpeaking = true
        rows.append(("the order", ask(busy, stop), #"{"ok":true}"#))
        main.isBlocked = true
        rows.append(("main busy right after it: the status as the order left it", ask(busy, status), #"{… "paused":false,"speaking":true}"#))
        main.isBlocked = false
        let minute = age(60), more = age(61)
        recorder.isPaused = true
        for answers in [minute, more] { _ = ask(answers, status) }
        main.isBlocked = true
        rows.append(("a minute's stall in a read: it may still sound", ask(minute, status), #"{… "main":"blocked for 60.0 s","paused":true,"speaking":true}"#))
        rows.append(("past a minute it is neither speaking nor paused", raw(more, status), #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"main":"blocked for 61.0 s","paused":false,"settings":"at","speaking":false}"#))
        recorder.isPaused = false
        main.isBlocked = false
        rows.append(("main answers again after that", ask(more, status), #"{… "paused":false,"speaking":true}"#))
        recorder.isSpeaking = false
        rows.append(("main answers again: the new status", ask(stalled, status), #"{… "paused":false,"speaking":false}"#))
        rows.append(("a stop does not become the last status", ask(stalled, stop), #"{"ok":true}"#))
        main.isBlocked = true
        rows.append(("the last status after a stop", ask(stalled, status), #"{… "main":"blocked for 3.0 s","paused":false,"speaking":false}"#))
        let slow = SlowStop()
        let begun = Answers(commands: { slow }, mainAge: { .zero }, budget: { _ in 0 }, onMain: { work in
            DispatchQueue.main.async { MainActor.assumeIsolated { work() } }
            _ = slow.begun.wait(timeout: .now() + 2)
        })
        let late = await withCheckedContinuation { done in
            DispatchQueue.global().async { done.resume(returning: String(decoding: begun.answer(Data(stop.utf8)), as: UTF8.self)) }
        }
        rows.append(("a stop main had begun when the budget ended", late, #"{"ok":true}"#))
        return check("answer", rows) + check("budget", [("status", mainBudget(.status), 0.05), ("any other op", mainBudget(.stop), 2)])
    }

    static func pressFailures() async -> Int {
        let press = { (setup: (PlantedGrab, PlantedRead) -> Void, key: (PressSequencer) async -> Void) -> String in
            let grab = PlantedGrab(), read = PlantedRead(Calls())
            setup(grab, read)
            let sequencer = PressSequencer(grab: grab, target: read, refreshSettings: { read.calls.append("refresh") }, toChunks: { spokenChunks(of: $0, nextMarker: $1) }, log: { line in
                read.calls.append("«" + line.replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression) + "»")
            })
            await key(sequencer)
            return read.calls.joined(separator: " | ").replacingOccurrences(of: CommandLine.arguments[0], with: "X-SPEAK")
        }
        let f4 = { (setup: @escaping (PlantedGrab, PlantedRead) -> Void) in await press(setup) { await $0.readPressed() } }
        var rows: [(name: String, got: String, want: String)] = []
        var reader: PlantedRead?
        _ = await f4 { grab, read in grab.selected = ("Hello.", "ax"); reader = read }
        rows.append(("a read knows the app in front", reader?.app ?? "-", "com.example.app"))
        rows.append(("F4 on a selection", await f4 { grab, _ in grab.selected = ("Hello. Bye.", "ax") },
                     "refresh | «press: grab ax N ms, normalize N ms, 2 chunks, 11 characters «Hello. Bye.»» | read Hello./Bye."))
        rows.append(("F4 on a copied selection", await f4 { grab, _ in grab.selected = ("Hello.", "⌘C") },
                     "refresh | «press: grab ⌘C N ms, normalize N ms, 1 chunks, 6 characters «Hello.»» | read Hello."))
        rows.append(("F4 while it speaks, on a selection", await f4 { grab, read in grab.selected = ("Hello.", "ax"); read.isSpeaking = true },
                     "refresh | «press: grab ax N ms, normalize N ms, 1 chunks, 6 characters «Hello.»» | read Hello."))
        rows.append(("F4 idle, accessibility empty: ⌘C gets a try", await f4 { grab, _ in grab.selected = (nil, "ax"); grab.copied = "Copied." },
                     "refresh | «press: grab ax → ⌘C N ms, normalize N ms, 1 chunks, 7 characters «Copied.»» | read Copied."))
        rows.append(("F4 idle, an empty string is no selection", await f4 { grab, _ in grab.selected = ("", "ax"); grab.copied = "Copied." },
                     "refresh | «press: grab ax → ⌘C N ms, normalize N ms, 1 chunks, 7 characters «Copied.»» | read Copied."))
        rows.append(("F4 idle, nothing anywhere", await f4 { grab, _ in grab.selected = (nil, "ax") },
                     "refresh | «press: nothing selected (grab ax → ⌘C N ms)» | toggle"))
        rows.append(("F4 while it speaks, accessibility empty: no ⌘C", await f4 { grab, read in grab.selected = (nil, "ax"); grab.copied = "Copied."; read.isSpeaking = true },
                     "refresh | «press: nothing selected (grab ax N ms) → pause / resume» | toggle"))
        rows.append(("F4 idle, ⌘C an empty string", await f4 { grab, _ in grab.selected = ("", "⌘C") },
                     "refresh | «press: nothing selected (grab ⌘C N ms)» | toggle"))
        rows.append(("F4 idle, ⌘C empty: no second ⌘C", await f4 { grab, _ in grab.selected = (nil, "⌘C"); grab.copied = "Copied." },
                     "refresh | «press: nothing selected (grab ⌘C N ms)» | toggle"))
        let line = { (text: String) -> String in
            let made = await f4 { grab, _ in grab.selected = (text, "ax") }
            return made.replacingOccurrences(of: ".*chunks, ", with: "", options: .regularExpression).replacingOccurrences(of: "» \\| read.*", with: "", options: .regularExpression)
        }
        rows.append(("a grab of 80 characters is logged whole", await line(String(repeating: "word ", count: 16)), "80 characters «\(String(repeating: "word ", count: 16))»"))
        rows.append(("a longer one by its two ends", await line("a" + String(repeating: "word ", count: 16)), "81 characters «a\(String(repeating: "word ", count: 7))word» … «\(String(repeating: "word ", count: 8))»"))
        rows.append(("a grab of lines is one line", await line("one\ntwo\r\nthree\u{2028}four\tfive\u{0}\u{1B}[31m"), "29 characters «one⏎two⏎three⏎four·five··[31m»"))
        rows.append(("a grab with nothing to say is logged too", await f4 { grab, _ in grab.selected = ("\n \n", "ax") },
                     "refresh | «press: nothing selected (grab ax N ms), 3 characters «⏎ ⏎»» | toggle"))
        // chromium's answers to a list line selected whole (Chrome and the Claude app, 25 Nov)
        let read = { (text: String, marker: String?) -> String in
            let made = await f4 { grab, _ in grab.selected = (text, "ax"); grab.marker = marker }
            return made.replacingOccurrences(of: ".*» \\| ", with: "", options: .regularExpression)
        }
        rows.append(("a list item reads without the next one's number", await read("commit3. ", "3. "), "read commit"))
        rows.append(("so does one that ends a sentence", await read("a count must dedupe.5. ", "5. "), "read a count must dedupe."))
        rows.append(("whole items keep their own", await read("steps1. build it2. ship it3. ", "3. "), "read steps./1: build it./2: ship it"))
        rows.append(("one that ends in a digit too", await read("lane1. merge pr #522. sleep now3. ", "3. "), "read lane./1: merge P R number 52./2: sleep now"))
        rows.append(("and one item under its lead line", await read("steps1. build it2. ", "2. "), "read steps./1: build it"))
        rows.append(("a double-clicked word", await read("commit", nil), "read commit"))
        rows.append(("a word's own number stays", await read("then python3.", nil), "read then python3."))
        rows.append(("and before a space too", await read("then python3. ", nil), "read then python3."))
        rows.append(("a marker the text does not end in cuts nothing", await read("then python3. ", "4. "), "read then python3."))
        rows.append(("an earlier marker stays", await read("see 3. then commit3. ", "3. "), "read see 3./then commit"))
        rows.append(("a marker of any sign", await read("commit3) ", "3) "), "read commit"))
        rows.append(("the log names the marker it read up to", await f4 { grab, _ in grab.selected = ("commit3. ", "ax"); grab.marker = "3. " },
                     "refresh | «press: grab ax N ms, normalize N ms, 1 chunks, 9 characters «commit3. », before the marker «3. »» | read commit"))
        rows.append(("only a marker touched: nothing to read", await read("3. ", "3. "), "toggle"))
        rows.append(("F4 with no grant", await f4 { grab, _ in grab.isTrusted = false; grab.selected = ("Hello.", "ax") },
                     "refresh | «press: accessibility missing — grant X-SPEAK in Privacy & Security»"))
        rows.append(("⇧F4 idle", await press({ _, _ in }) { $0.pausePressed() }, "«press: ⇧F4 → nothing playing» | toggle"))
        rows.append(("⇧F4 while it speaks", await press({ _, read in read.isSpeaking = true }) { $0.pausePressed() }, "«press: ⇧F4 → pause» | toggle"))
        rows.append(("⇧F4 while paused", await press({ _, read in read.isSpeaking = true; read.isPaused = true }) { $0.pausePressed() }, "«press: ⇧F4 → resume» | toggle"))
        rows.append(("F5", await press({ _, _ in }) { $0.stopPressed() }, "silence"))
        return await check("press", rows) + overtakenFailures() + markerFailures()
    }

    // «commit», the marker «3. », «push», by their places
    static func markerFailures() -> Int {
        let marker = { (from: Int?, to: Int) in markerBeforeEnd(of: PlantedPlaces(selected: from.map { ($0, to) })) }
        return check("marker", [
            ("a line selected to the next item's start", marker(0, 9), "3. "),
            ("made backwards", marker(9, 0), "3. "),
            ("a word, its end inside the item", marker(0, 6), nil),
            ("an end inside the next item", marker(0, 11), nil),
            ("an end at the text's own start", marker(0, 0), nil),
            ("an app with no places", marker(nil, 0), nil),
        ])
    }

    // the grab window: every grab waits until the row lets it end
    static func overtakenFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, setup: (SlowGrab, PlantedRead) -> Void, act: (PressSequencer, SlowGrab, PlantedRead) async -> Void, want: String) in
            let calls = Calls(), grab = SlowGrab(calls), read = PlantedRead(calls)
            setup(grab, read)
            let presses = PressSequencer(grab: grab, target: read, refreshSettings: {}, toChunks: { spokenChunks(of: $0, nextMarker: $1) }, log: { line in
                calls.made.append("«" + line.replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression) + "»")
            })
            await act(presses, grab, read)
            await settle()
            rows.append((name, calls.made.joined(separator: " | "), want))
        }
        let dropped = "«press: dropped, a newer order came»"
        let press = { (presses: PressSequencer) in
            Task { await presses.readPressed() }
            await settle()
        }
        await row("F4 alone", { _, _ in }, { presses, grab, _ in await press(presses); await grab.ends("One.") },
                  "grab | ended | «press: grab ax N ms, normalize N ms, 1 chunks, 4 characters «One.»» | read One.")
        await row("F5 inside the grab: no read", { _, _ in }, { presses, grab, _ in await press(presses); presses.stopPressed(); await grab.ends("One.") },
                  "grab | silence | ended | " + dropped)
        await row("two F4 inside the grab: one read, the newer", { _, _ in }, { presses, grab, _ in
            await press(presses)
            await press(presses)
            await grab.ends("One.")
            await grab.ends("Two.")
        }, "grab | ended | \(dropped) | grab | ended | «press: grab ax N ms, normalize N ms, 1 chunks, 4 characters «Two.»» | read Two.")
        await row("twelve F4 at once: two grabs, one read", { _, _ in }, { presses, grab, _ in
            for _ in 0..<12 { await press(presses) }
            await grab.ends("One.")
            await grab.ends("Twelve.")
        }, "grab | ended" + String(repeating: " | " + dropped, count: 11) + " | grab | ended | «press: grab ax N ms, normalize N ms, 1 chunks, 7 characters «Twelve.»» | read Twelve.")
        await row("F4, F5, F4: the last one reads", { _, _ in }, { presses, grab, _ in
            await press(presses)
            presses.stopPressed()
            await press(presses)
            await grab.ends("One.")
            await grab.ends("Two.")
        }, "grab | silence | ended | \(dropped) | grab | ended | «press: grab ax N ms, normalize N ms, 1 chunks, 4 characters «Two.»» | read Two.")
        await row("F4 then F5 before ⌘C's try: no ⌘C", { _, _ in }, { presses, grab, _ in await press(presses); presses.stopPressed(); await grab.ends(nil) },
                  "grab | silence | ended | " + dropped)
        await row("an order from the socket inside the grab", { _, _ in }, { presses, grab, read in await press(presses); _ = read.takeOrder(); await grab.ends("One.") },
                  "grab | ended | " + dropped)
        await row("an overtaken F4 on nothing does not pause", { _, read in read.isSpeaking = true }, { presses, grab, _ in await press(presses); presses.stopPressed(); await grab.ends(nil) },
                  "grab | silence | ended | " + dropped)
        await row("⇧F4 inside the grab pauses what plays, the grab goes on", { _, read in read.isSpeaking = true }, { presses, grab, _ in await press(presses); presses.pausePressed(); await grab.ends("One.") },
                  "grab | «press: ⇧F4 → pause» | toggle | ended | «press: grab ax N ms, normalize N ms, 1 chunks, 4 characters «One.»» | read One.")
        await row("a press with no grant takes its order too", { grab, _ in grab.isTrusted = false }, { presses, _, read in await press(presses); read.calls.append("\(read.order)") },
                  "«press: accessibility missing — grant \(CommandLine.arguments[0]) in Privacy & Security» | 1")
        return check("overtaken press", rows)
    }

    static func playbackFailures() -> Int {
        let after = { (events: [PlaybackEvent]) in events.reduce(Playback.idle, next) }
        return check("playback", [
            ("nothing yet", after([]), .idle),
            ("a read begins", after([.began(1)]), .reading(1, isPaused: false)),
            ("paused", after([.began(1), .pausePressed]), .reading(1, isPaused: true)),
            ("resumed", after([.began(1), .pausePressed, .pausePressed]), .reading(1, isPaused: false)),
            ("pause with nothing playing", after([.pausePressed]), .idle),
            ("it ends", after([.began(1), .ended(1)]), .idle),
            ("it ends paused: nothing is left paused", after([.began(1), .pausePressed, .ended(1), .began(2)]), .reading(2, isPaused: false)),
            ("a new read over a paused one", after([.began(1), .pausePressed, .began(2)]), .reading(2, isPaused: false)),
            ("the cut read's late end", after([.began(1), .began(2), .ended(1)]), .reading(2, isPaused: false)),
            ("the cut read's late end, paused", after([.began(1), .began(2), .pausePressed, .ended(1)]), .reading(2, isPaused: true)),
            ("a late end after a stop", after([.began(1), .stopped, .ended(1)]), .idle),
            ("stopped while paused, then the next", after([.began(1), .pausePressed, .stopped, .began(2)]), .reading(2, isPaused: false)),
            ("a stop with nothing playing", after([.stopped]), .idle),
        ]) + check("playback says", [
            ("idle", "\(Playback.idle.read.map(String.init) ?? "-") \(Playback.idle.isPaused)", "- false"),
            ("reading", "\(Playback.reading(3, isPaused: false).read ?? 0) \(Playback.reading(3, isPaused: false).isPaused)", "3 false"),
            ("paused", "\(Playback.reading(3, isPaused: true).read ?? 0) \(Playback.reading(3, isPaused: true).isPaused)", "3 true"),
        ])
    }

    static func pillFailures() -> Int {
        let reading = Playback.reading(1, isPaused: false), paused = Playback.reading(1, isPaused: true)
        let pill = { (steps: (inout PillState) -> Void) -> PillState in
            var state = PillState()
            steps(&state)
            return state
        }
        let look = { (steps: (inout PillState) -> Void) -> String in
            let look = pill(steps).look
            return "\(look.symbol) \(look.label)\(look.isDisabled ? ", off" : "")\(look.isMeterRunning ? ", meter" : "")"
        }
        let idle = "play.fill Nothing playing, off", talks = "pause.fill Pause · F4", held = "play.fill Resume · F4"
        return check("pill", [
            ("nothing plays", look { _ in }, idle),
            ("it talks", look { $0.follow(reading); $0.hasSignal = true }, talks + ", meter"),
            ("the mac voice talks", look { $0.follow(reading) }, talks),
            ("paused", look { $0.follow(reading); $0.hasSignal = true; $0.follow(paused) }, held),
            ("resumed, its signal still counts", look { $0.follow(reading); $0.hasSignal = true; $0.follow(paused); $0.follow(reading) }, talks + ", meter"),
            ("a signal left over", look { $0.follow(reading); $0.hasSignal = true; $0.follow(.idle) }, idle),
            ("the next read waits for its own signal", look { $0.follow(reading); $0.hasSignal = true; $0.follow(.reading(2, isPaused: false)) }, talks),
            ("a pill that left", look { _ = $0.startWave(); $0.hasSignal = true; $0.leave() }, idle),
            ("the wave alone has no ⏸ to press", look { _ = $0.startWave(); $0.hasSignal = true }, idle + ", meter"),
            ("the wave before its first level", look { _ = $0.startWave() }, idle),
            ("the wave is off again", look { _ = $0.startWave(); $0.hasSignal = true; _ = $0.stopWave() }, idle),
            ("a read over the wave waits for its own signal", look { _ = $0.startWave(); $0.hasSignal = true; $0.follow(reading) }, talks),
            ("a read over the wave has ended", look { _ = $0.startWave(); $0.follow(reading); $0.follow(.idle); $0.hasSignal = true }, idle),
            ("a wave over a paused read", look { $0.follow(paused); _ = $0.startWave(); $0.hasSignal = true }, held),
            ("a sample", look { $0.showSample() }, talks),
            ("a read over a sample has ended", look { $0.showSample(); $0.follow(reading); $0.follow(.idle) }, idle),
            ("a sample that left", look { $0.showSample(); $0.leave() }, idle),
        ]) + check("wave", [
            ("starts where nothing plays", pill { _ = $0.startWave() }.isWaveOn, true),
            ("never over a read", pill { $0.follow(reading); _ = $0.startWave() }.isWaveOn, false),
            ("a read that begins ends it", pill { _ = $0.startWave(); $0.follow(reading) }.isWaveOn, false),
            ("ends with the pill that leaves", pill { _ = $0.startWave(); $0.leave() }.isWaveOn, false),
            ("says why it did not start", { var state = pill { $0.follow(reading) }; return state.startWave() != nil }(), true),
            ("a renewal of one that runs", { var state = pill { _ = $0.startWave() }; return state.startWave(isRenewal: true) == nil }(), true),
            ("a renewal never starts one", { var state = PillState(); return state.startWave(isRenewal: true) == nil || state.isWaveOn }(), false),
            ("its end lets the pill leave", { var state = pill { _ = $0.startWave() }; return state.stopWave() }(), true),
            ("an end under a read leaves the read its pill", { var state = pill { $0.follow(reading) }; return state.stopWave() }(), false),
            ("an end under a read leaves the read its meter", pill { $0.follow(reading); $0.hasSignal = true; _ = $0.stopWave() }.hasSignal, true),
        ])
    }

    // how many readings move the wave one bar outward, and how far one frame glides, both by the tuning it was handed
    static func meterShapeFailures() -> Int {
        let start = Date(timeIntervalSince1970: 0)
        let meter = { (glide: Double, flow: Double, setup: (Meter) -> Void) -> Meter in
            let meter = Meter(tuning: { (glide, flow) })
            setup(meter)
            return meter
        }
        let drawn = { (glide: Double, flow: Double, after: TimeInterval, setup: (Meter) -> Void) -> [String] in
            meter(glide, flow, setup).frame(at: start.addingTimeInterval(after)).map { String(format: "%.2f", $0) }
        }
        let centre = { (glide: Double, flow: Double, after: TimeInterval, setup: (Meter) -> Void) in drawn(glide, flow, after, setup)[8] }
        return check("meter shape", [
            ("a full history is the envelope alone", drawn(0, 10, 0) { meter in (0..<9).forEach { _ in meter.push(1) } }.joined(separator: " "),
             "0.40 0.42 0.49 0.59 0.70 0.81 0.91 0.98 1.00 0.98 0.91 0.81 0.70 0.59 0.49 0.42 0.40"),
            ("one reading blurs across its neighbours", drawn(0, 10, 0) { $0.push(1) }[6...10].joined(separator: " "), "0.00 0.24 0.50 0.24 0.00"),
            ("a drop falls by a share, never to a dot", centre(0, 10, 0) { $0.push(1); $0.push(0) }, "0.86"),
            ("a step carries its loudest reading", centre(0, 20, 0) { $0.push(1); $0.push(0.2) }, "0.50"),
            ("a frame that comes late eases one tenth of a second at most", centre(1000, 10, 10) { _ = $0.frame(at: start); $0.push(1) }, "0.05"),
            ("shown levels are on screen at once", drawn(1000, 10, 0) { $0.show([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]) }.first ?? "", "0.10"),
        ]) + check("meter queue", [
            ("a reading over a second late is dropped", centre(0, 10, 3) { $0.enqueue([1], spacing: 0.01, at: start); $0.enqueue([0], spacing: 0.01, at: start.addingTimeInterval(2)) }, "0.00"),
            ("a reading half a second late is drawn", centre(0, 10, 3) { $0.enqueue([1], spacing: 0.01, at: start); $0.enqueue([0], spacing: 0.01, at: start.addingTimeInterval(0.5)) }, "0.86"),
            ("readings are spaced", centre(0, 10, 0.05) { $0.enqueue([0, 1], spacing: 0.1, at: start) }, "0.00"),
            ("a second buffer waits behind the first", centre(0, 10, 0.15) { $0.enqueue([0, 0], spacing: 0.1, at: start); $0.enqueue([1], spacing: 0.1, at: start) }, "0.00"),
            ("a drawn reading is not drawn twice", centre(0, 10, 1) { $0.enqueue([1], spacing: 0.01, at: start); _ = $0.frame(at: start) }, "0.50"),
        ]) + check("meter reset", [
            ("the history", centre(0, 10, 0) { $0.push(1); $0.reset() }, "0.00"),
            ("the bars on screen", centre(1000, 10, 0) { $0.show(Array(repeating: 0.9, count: 9)); $0.reset() }, "0.00"),
            ("the readings waiting", centre(0, 10, 1) { $0.enqueue([1], spacing: 0.01, at: start); $0.reset() }, "0.00"),
            ("the step's loudest", centre(0, 20, 0) { $0.push(1); $0.reset(); $0.push(0); $0.push(0) }, "0.00"),
            ("the step's count", centre(0, 20, 0) { $0.push(0); $0.reset(); $0.push(1) }, "0.00"),
            ("the last frame", centre(200, 10, 10) { _ = $0.frame(at: start); $0.reset(); $0.push(1) }, "0.04"),
        ]) + check("sample voice", [0, 0.1, 0.35, 0.8, 1.29, 1.31, 1.4, 1.7].map { String(format: "%.3f", speechLevel(at: $0)) }.enumerated().map { index, got in
            ("moment \(index)", got, ["0.325", "0.723", "0.745", "0.792", "0.797", "0.020", "0.020", "0.516"][index])
        })
    }

    static func meterFailures() -> Int {
        let centre = { (glide: Double, flow: Double, readings: Int) -> Float in
            let meter = Meter(tuning: { (glide, flow) })
            for _ in 0..<readings { meter.push(1) }
            return meter.frame(at: Date(timeIntervalSince1970: 0))[8]
        }
        let moved = { (flow: Double) in (1...12).first { centre(0, flow, $0) > 0.1 } }
        let late = { () -> Float in
            let meter = Meter(tuning: { (0, 10) })
            meter.enqueue([1], spacing: 0.01)
            return meter.frame(at: .distantPast)[8]
        }
        return meterShapeFailures() + check("meter flow", [
            ("10 ms: each reading", moved(10), 1),
            ("40 ms: every fourth", moved(40), 4),
            ("55 ms rounds to six", moved(55), 6),
            ("0 ms is one", moved(0), 1),
        ]) + check("meter glide", [
            ("0 steps straight to the reading", centre(0, 10, 1) > 0.49, true),
            ("a slow glide covers little of it in one frame", centre(1000, 10, 1) < 0.05, true),
            ("a reading waits for its moment", late() == 0, true),
        ])
    }
}

// main as the answers see it: a block waits here until a row lets it run
final class PlantedMain: @unchecked Sendable {
    var isBlocked = false
    private var waiting: [@MainActor () -> Void] = []
    @Sendable func run(_ work: @escaping @MainActor () -> Void) {
        if isBlocked { waiting.append(work) } else { MainActor.assumeIsolated { work() } }
    }
    @MainActor func runWaiting() {
        waiting.forEach { $0() }
        waiting = []
    }
}

final class SlowStop: Recorder, @unchecked Sendable {
    let begun = DispatchSemaphore(value: 0)
    override func stop() {
        begun.signal()
        Thread.sleep(forTimeInterval: 0.05)
    }
}

class Recorder: DaemonCommands {
    var calls: [String] = []
    var reloadError: String?
    var isSpeaking = true
    var isPaused = false
    var statuses = 0
    func status() -> Status {
        statuses += 1
        return Status(engines: ["kokoro": Health(state: .live)], isTrusted: true, isSpeaking: isSpeaking, isPaused: isPaused, read: isSpeaking ? 7 : nil, settings: "at")
    }
    func chunks(of text: String) -> [Chunk] { spokenChunks(of: text) }
    func voices(of engine: Engine) -> [Voice] { engine == .system ? [Voice(id: "a", name: "A", lang: .uk)] : engine == .fish ? [Voice(id: "f", name: "F")] : [] }
    func reload() -> String? { calls.append("reload"); return reloadError }
    var refusal: SaveError?
    private func settings(_ call: String) throws -> SavedSettings {
        calls.append(call)
        if let refusal { throw refusal }
        return SavedSettings(config: StoreTest.json(#"{"firstAudioMs":900,"chain":{"en":["kokoro"]}}"#), version: "v2", was: "v1")
    }
    func savedSettings() throws -> SavedSettings { try settings("config") }
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings {
        try settings("save \(patch?.text().split(whereSeparator: \.isWhitespace).joined() ?? "-") \(version ?? "-")")
    }
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings {
        try settings("heart \(engine ?? "-") \(voice ?? "-") \(isOn.map { "\($0)" } ?? "-")")
    }
    func togglePause() { calls.append("pause") }
    func stop() { calls.append("stop") }
    var restartRefusal: String?
    func restart() -> String? { calls.append("restart"); return restartRefusal }
    func demoPill() { calls.append("demo") }
    var refusesWave = false
    func wave(on: Bool, glide: Double?, flow: Double?) -> String? {
        calls.append("wave \(on) \(glide.map { "\($0)" } ?? "-") \(flow.map { "\($0)" } ?? "-")")
        return refusesWave ? "the waveform waits: x-speak is reading aloud" : nil
    }
    func hidePill() { calls.append("hide") }
    func blockMain(for seconds: Double) { calls.append("block \(seconds)") }
    func read(_ parts: [Chunk]) { calls.append("read " + parts.map(\.text).joined(separator: "/")) }
    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) -> Int {
        calls.append("preview \(engine.rawValue) \(text) \(settings.map { "\($0.gain)" } ?? "saved")")
        return 7
    }
}

struct PlantedPlaces: SelectionPlaces {
    var selected: (Int, Int)?
    func ends() -> (Int, Int)? { selected }
    func later(_ one: Int, _ other: Int) -> Int? { max(one, other) }
    func before(_ place: Int) -> Int? { place > 0 ? place - 1 : nil }
    func element(at place: Int) -> (role: String?, value: String?)? {
        switch place {
        case 0..<6: ("AXStaticText", "commit")
        case 6..<9: ("AXListMarker", "3. ")
        default: ("AXStaticText", "push")
        }
    }
}

final class PlantedGrab: SelectionGrab {
    var isTrusted = true
    var selected: (text: String?, via: String) = (nil, "ax")
    var marker: String?
    var copied: String?
    let app: String? = "com.example.app"
    func selection() async -> (text: String?, via: String, marker: String?) { (selected.text, selected.via, marker) }
    func copy() async -> String? { copied }
}

// a selection that comes when the row says so
@MainActor
final class SlowGrab: SelectionGrab {
    var isTrusted = true
    private let calls: Calls
    private var waiting: [CheckedContinuation<String?, Never>] = []
    let app: String? = nil
    init(_ calls: Calls) { self.calls = calls }
    func selection() async -> (text: String?, via: String, marker: String?) {
        calls.made.append("grab")
        let text = await withCheckedContinuation { waiting.append($0) }
        calls.made.append("ended")
        return (text, "ax", nil)
    }
    func copy() async -> String? {
        calls.made.append("copy")
        return nil
    }
    func ends(_ text: String?) async {
        for _ in 0..<200 where waiting.isEmpty { try? await Task.sleep(for: .milliseconds(5)) }
        if !waiting.isEmpty { waiting.removeFirst().resume(returning: text) }
        await settle()
    }
}

@MainActor
final class PlantedRead: ReadTarget {
    private let log: Calls
    init(_ log: Calls) { self.log = log }
    var calls: [String] {
        get { log.made }
        set { log.made = newValue }
    }
    var isSpeaking = false
    var isPaused = false
    private(set) var order = 0
    func takeOrder() -> Int {
        order += 1
        return order
    }
    func togglePause() { calls.append("toggle") }
    func silence() { _ = takeOrder(); calls.append("silence") }
    private(set) var app: String?
    func read(_ parts: [Chunk], from app: String?, pressed: ContinuousClock.Instant) { _ = takeOrder(); self.app = app; calls.append("read " + parts.map(\.text).joined(separator: "/")) }
}
