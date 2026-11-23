// the seams the shell is wired through, each driven here without a daemon: the socket's ops and answers over recorded
// commands, the presses over a planted grab, the pill's look, the meter over a planted tuning
import Foundation

@MainActor
enum SeamsTest {
    static func failures() async -> Int {
        var failed = opFailures()
        failed += await answerFailures()
        failed += await pressFailures()
        failed += pillFailures()
        failed += meterFailures()
        failed += clockFailures()
        return failed
    }

    static func opFailures() -> Int {
        let ask = { (line: String, setup: (Recorder) -> Void) -> String in
            let recorder = Recorder()
            setup(recorder)
            guard let request = try? JSONDecoder().decode(Request.self, from: Data(line.utf8)) else { return "bad request" }
            let reply = runOp(request, with: recorder)
            let json = (try? JSONSerialization.data(withJSONObject: reply, options: .sortedKeys)).map { String(decoding: $0, as: UTF8.self) } ?? "?"
            return ([json] + recorder.calls).joined(separator: " | ")
        }
        let plain = { (line: String) in ask(line, { _ in }) }
        return check("op", [
            ("status", plain(#"{"op":"status"}"#), #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"paused":false,"speaking":true}"#),
            ("voices", plain(#"{"op":"voices"}"#), #"{"system":[{"id":"a"}]}"#),
            ("reload", plain(#"{"op":"reload"}"#), #"{"ok":true} | reload"#),
            ("reload with a bad file", ask(#"{"op":"reload"}"#) { $0.reloadError = "config.json: not readable" }, #"{"error":"config.json: not readable"} | reload"#),
            ("pause", plain(#"{"op":"pause"}"#), #"{"ok":true} | pause"#),
            ("stop", plain(#"{"op":"stop"}"#), #"{"ok":true} | stop"#),
            ("panel-demo", plain(#"{"op":"panel-demo"}"#), #"{"ok":true} | demo"#),
            ("panel-hide", plain(#"{"op":"panel-hide"}"#), #"{"ok":true} | hide"#),
            ("wave on", plain(#"{"op":"wave","on":true,"glide":30,"flow":55}"#), #"{"ok":true} | wave true 30.0 55.0"#),
            ("wave with nothing named is off", plain(#"{"op":"wave"}"#), #"{"ok":true} | wave false - -"#),
            ("block-main", plain(#"{"op":"block-main","seconds":2}"#), #"{"ok":true} | block 2.0"#),
            ("block-main with no seconds", plain(#"{"op":"block-main"}"#), #"{"ok":true} | block 5.0"#),
            ("read", plain(#"{"op":"read","text":"Hello. Bye."}"#), #"{"ok":true} | read Hello./Bye."#),
            ("read with no text", plain(#"{"op":"read"}"#), #"{"error":"read needs text"}"#),
            ("read with an empty text", plain(#"{"op":"read","text":""}"#), #"{"error":"read: nothing to say"}"#),
            ("preview", plain(#"{"op":"preview","engine":"kokoro","text":"Hi","settings":{"gain":2}}"#), #"{"ok":true} | preview kokoro Hi 2.0"#),
            ("preview on the saved settings", plain(#"{"op":"preview","engine":"kokoro","text":"Hi"}"#), #"{"ok":true} | preview kokoro Hi saved"#),
            ("preview of an unknown engine", plain(#"{"op":"preview","engine":"nobody","text":"Hi"}"#), #"{"error":"preview needs engine and text"}"#),
            ("preview with no text", plain(#"{"op":"preview","engine":"kokoro"}"#), #"{"error":"preview needs engine and text"}"#),
            ("an unknown op", plain(#"{"op":"dance"}"#), #"{"error":"unknown op dance"}"#),
            ("no op", plain("{}"), "bad request"),
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
        let ask = { (answers: Answers, line: String) -> String in
            let object = try? JSONSerialization.jsonObject(with: answers.answer(Data(line.utf8)))
            let json = object.flatMap { try? JSONSerialization.data(withJSONObject: $0, options: .sortedKeys) }
            return (json.map { String(decoding: $0, as: UTF8.self) } ?? "?").replacingOccurrences(of: #"{"accessibility":true,"engines":{"kokoro":{"state":"live"}},"#, with: "{… ")
        }
        let status = #"{"op":"status"}"#, stop = #"{"op":"stop"}"#
        var rows: [(name: String, got: String, want: String)] = []
        rows.append(("not a request", ask(age(0), "hello"), #"{"error":"bad request"}"#))
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
        return check("answer", rows) + check("budget", [("status", mainBudget("status"), 0.05), ("any other op", mainBudget("read"), 2)])
    }

    static func pressFailures() async -> Int {
        let press = { (setup: (PlantedGrab, PlantedRead) -> Void, key: (PressSequencer) async -> Void) -> String in
            let grab = PlantedGrab(), read = PlantedRead()
            setup(grab, read)
            let sequencer = PressSequencer(grab: grab, target: read, refreshSettings: { read.calls.append("refresh") }, log: { line in
                read.calls.append("«" + line.replacingOccurrences(of: "[0-9]+ ms", with: "N ms", options: .regularExpression) + "»")
            })
            await key(sequencer)
            return read.calls.joined(separator: " | ").replacingOccurrences(of: CommandLine.arguments[0], with: "X-SPEAK")
        }
        let f4 = { (setup: @escaping (PlantedGrab, PlantedRead) -> Void) in await press(setup) { await $0.readPressed() } }
        var rows: [(name: String, got: String, want: String)] = []
        rows.append(("F4 on a selection", await f4 { grab, _ in grab.selected = ("Hello. Bye.", "ax") },
                     "refresh | «press: grab ax N ms, normalize N ms, 2 chunks» | read Hello./Bye."))
        rows.append(("F4 on a copied selection", await f4 { grab, _ in grab.selected = ("Hello.", "⌘C") },
                     "refresh | «press: grab ⌘C N ms, normalize N ms, 1 chunks» | read Hello."))
        rows.append(("F4 while it speaks, on a selection", await f4 { grab, read in grab.selected = ("Hello.", "ax"); read.isSpeaking = true },
                     "refresh | «press: grab ax N ms, normalize N ms, 1 chunks» | read Hello."))
        rows.append(("F4 idle, accessibility empty: ⌘C gets a try", await f4 { grab, _ in grab.selected = (nil, "ax"); grab.copied = "Copied." },
                     "refresh | «press: grab ax → ⌘C N ms, normalize N ms, 1 chunks» | read Copied."))
        rows.append(("F4 idle, an empty string is no selection", await f4 { grab, _ in grab.selected = ("", "ax"); grab.copied = "Copied." },
                     "refresh | «press: grab ax → ⌘C N ms, normalize N ms, 1 chunks» | read Copied."))
        rows.append(("F4 idle, nothing anywhere", await f4 { grab, _ in grab.selected = (nil, "ax") },
                     "refresh | «press: nothing selected (grab ax → ⌘C N ms)» | toggle"))
        rows.append(("F4 while it speaks, accessibility empty: no ⌘C", await f4 { grab, read in grab.selected = (nil, "ax"); grab.copied = "Copied."; read.isSpeaking = true },
                     "refresh | «press: nothing selected (grab ax N ms) → pause / resume» | toggle"))
        rows.append(("F4 idle, ⌘C empty: no second ⌘C", await f4 { grab, _ in grab.selected = (nil, "⌘C"); grab.copied = "Copied." },
                     "refresh | «press: nothing selected (grab ⌘C N ms)» | toggle"))
        rows.append(("F4 with no grant", await f4 { grab, _ in grab.isTrusted = false; grab.selected = ("Hello.", "ax") },
                     "refresh | «press: accessibility missing — grant X-SPEAK in Privacy & Security»"))
        rows.append(("⇧F4 idle", await press({ _, _ in }) { $0.pausePressed() }, "«press: ⇧F4 → nothing playing» | toggle"))
        rows.append(("⇧F4 while it speaks", await press({ _, read in read.isSpeaking = true }) { $0.pausePressed() }, "«press: ⇧F4 → pause» | toggle"))
        rows.append(("⇧F4 while paused", await press({ _, read in read.isSpeaking = true; read.isPaused = true }) { $0.pausePressed() }, "«press: ⇧F4 → resume» | toggle"))
        rows.append(("F5", await press({ _, _ in }) { $0.stopPressed() }, "silence"))
        return check("press", rows)
    }

    static func pillFailures() -> Int {
        check("pill", [
            ("nothing plays", pillLook(isSpeaking: false, isPaused: false, hasSignal: false), PillLook(symbol: "play.fill", label: "Nothing playing", isDisabled: true, isMeterRunning: false)),
            ("it talks", pillLook(isSpeaking: true, isPaused: false, hasSignal: true), PillLook(symbol: "pause.fill", label: "Pause · F4", isDisabled: false, isMeterRunning: true)),
            ("the mac voice talks", pillLook(isSpeaking: true, isPaused: false, hasSignal: false), PillLook(symbol: "pause.fill", label: "Pause · F4", isDisabled: false, isMeterRunning: false)),
            ("paused", pillLook(isSpeaking: true, isPaused: true, hasSignal: true), PillLook(symbol: "play.fill", label: "Resume · F4", isDisabled: false, isMeterRunning: false)),
            ("a signal left over", pillLook(isSpeaking: false, isPaused: false, hasSignal: true), PillLook(symbol: "play.fill", label: "Nothing playing", isDisabled: true, isMeterRunning: false)),
            ("paused with nothing playing", pillLook(isSpeaking: false, isPaused: true, hasSignal: false), PillLook(symbol: "play.fill", label: "Nothing playing", isDisabled: true, isMeterRunning: false)),
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
    func status() -> Status { Status(engines: ["kokoro": ["state": "live"]], isTrusted: true, isSpeaking: isSpeaking, isPaused: false) }
    func voices() -> [[String: String]] { [["id": "a"]] }
    func reload() -> String? { calls.append("reload"); return reloadError }
    func togglePause() { calls.append("pause") }
    func stop() { calls.append("stop") }
    func demoPill() { calls.append("demo") }
    func wave(on: Bool, glide: Double?, flow: Double?) { calls.append("wave \(on) \(glide.map { "\($0)" } ?? "-") \(flow.map { "\($0)" } ?? "-")") }
    func hidePill() { calls.append("hide") }
    func blockMain(for seconds: Double) { calls.append("block \(seconds)") }
    func read(_ parts: [Chunk]) { calls.append("read " + parts.map(\.text).joined(separator: "/")) }
    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) {
        calls.append("preview \(engine.rawValue) \(text) \(settings.map { "\($0.gain)" } ?? "saved")")
    }
}

final class PlantedGrab: SelectionGrab {
    var isTrusted = true
    var selected: (text: String?, via: String) = (nil, "ax")
    var copied: String?
    func selection() async -> (text: String?, via: String) { selected }
    func copy() async -> String? { copied }
}

final class PlantedRead: ReadTarget {
    var calls: [String] = []
    var isSpeaking = false
    var isPaused = false
    func togglePause() { calls.append("toggle") }
    func silence() { calls.append("silence") }
    func read(_ parts: [Chunk], pressed: ContinuousClock.Instant) { calls.append("read " + parts.map(\.text).joined(separator: "/")) }
}
