// the seams the shell is wired through, each driven here without a daemon: the socket's ops over recorded commands,
// the presses over a planted grab, the pill's look, the meter over a planted tuning
import Foundation

@MainActor
enum SeamsTest {
    static func failures() async -> Int {
        var failed = opFailures()
        failed += await pressFailures()
        failed += pillFailures()
        failed += meterFailures()
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
            ("status", plain(#"{"op":"status"}"#), #"{"speaking":false}"#),
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
        return check("meter flow", [
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

final class Recorder: DaemonCommands {
    var calls: [String] = []
    var reloadError: String?
    func status() -> [String: Any] { ["speaking": false] }
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
