// what each hotkey does, over the grab and the read it is handed
import Foundation

@MainActor
protocol SelectionGrab: AnyObject {
    // read live: a grant given while the daemon runs applies on the next press, no restart
    var isTrusted: Bool { get }
    // the selected text, the way it came («ax» or «⌘C»), and the list marker right before the selection's end
    func selection() async -> (text: String?, via: String, marker: String?)
    // the app in front
    var app: String? { get }
    func copy() async -> String?
}

@MainActor
protocol ReadTarget: AnyObject {
    var isSpeaking: Bool { get }
    var isPaused: Bool { get }
    // the last order that decides what plays: a read, a preview or a stop, from a key, the pill or the socket
    var order: Int { get }
    func takeOrder() -> Int
    func togglePause()
    // silences every voice, even one no read owns any more, and the pill leaves unless stick holds it
    func silence()
    // cuts off what plays
    func read(_ parts: [Chunk], from app: String?, pressed: ContinuousClock.Instant)
}

@MainActor
final class PressSequencer {
    private let grab: any SelectionGrab
    private let target: any ReadTarget
    private let refreshSettings: () -> Void
    // a grab, and the list marker right before its end
    private let toChunks: (String, String?) -> [Chunk]
    private let write: (String) -> Void
    // two ⌘C grabs at once read each other's restored clipboard, so each waits for the one before it
    private var lastGrab: Task<Void, Never>?

    init(grab: any SelectionGrab, target: any ReadTarget, refreshSettings: @escaping () -> Void, toChunks: @escaping (String, String?) -> [Chunk], log write: @escaping (String) -> Void) {
        self.grab = grab
        self.target = target
        self.refreshSettings = refreshSettings
        self.toChunks = toChunks
        self.write = write
    }

    // F4 reads the selection, cutting off what plays; with nothing selected it pauses / resumes what plays. ⇧F4 is
    // pause's second door, selection or not (dima, 2026-09-30). F5 stops. a grab that a newer order overtook is dropped
    func readPressed() async {
        let pressed = ContinuousClock.now
        let order = target.takeOrder()
        let app = grab.app
        refreshSettings()
        guard grab.isTrusted else {
            write("press: accessibility missing — grant \(CommandLine.arguments[0]) in Privacy & Security")
            return
        }
        let earlier = lastGrab
        let grabbing = Task {
            await earlier?.value
            return target.order == order ? await selection(order) : nil
        }
        lastGrab = Task { _ = await grabbing.value }
        guard let (text, via, marker) = await grabbing.value, target.order == order else {
            write("press: dropped, a newer order came")
            return
        }
        let took = elapsed(pressed)
        let parts = toChunks(text ?? "", marker)
        guard !parts.isEmpty else {
            write("press: nothing selected (grab \(via) \(took))\(ends(of: text))\(target.isSpeaking ? " → pause / resume" : "")")
            target.togglePause()
            return
        }
        write("press: grab \(via) \(took), normalize \(elapsed(pressed)), \(parts.count) chunks\(ends(of: text))\(marker.map { ", before the marker «\($0)»" } ?? "")")
        target.read(parts, from: app, pressed: pressed)
    }

    private func selection(_ order: Int) async -> (text: String?, via: String, marker: String?) {
        let (text, via, marker) = await grab.selection()
        // an empty accessibility answer is trusted only while something plays (F4 = pause, no 300 ms ⌘C wait);
        // idle, F4 means «read», so ⌘C gets a try: a selection inside a canvas or a frame is not the focused
        // element's (Chrome on a claude.ai artifact, 2026-10-01)
        guard (text ?? "").isEmpty, via == "ax", !target.isSpeaking, target.order == order else { return (text, via, marker) }
        return (await grab.copy(), "ax → ⌘C", nil)
    }

    // ⇧F4: pause / resume what plays, whatever is selected
    func pausePressed() {
        write("press: ⇧F4 → \(target.isSpeaking ? (target.isPaused ? "resume" : "pause") : "nothing playing")")
        target.togglePause()
    }

    // F5
    func stopPressed() { target.silence() }
}

// a grab as one line of the log: the whole of a short one, the two ends of a long one
private func ends(of text: String?) -> String {
    guard let text, !text.isEmpty else { return "" }
    let line = { (part: Substring) in
        String(part.map { $0.isNewline ? "⏎" : $0.unicodeScalars.allSatisfy { $0.properties.generalCategory == .control } ? "·" : $0 })
    }
    let count = text.count
    return ", \(count) characters " + (count > 80 ? "«\(line(text.prefix(40)))» … «\(line(text.suffix(40)))»" : "«\(line(text[...]))»")
}
