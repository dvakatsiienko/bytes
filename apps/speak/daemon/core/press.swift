// what each hotkey does, over the grab and the read it is handed
import Foundation

@MainActor
protocol SelectionGrab: AnyObject {
    // read live: a grant given while the daemon runs applies on the next press, no restart
    var isTrusted: Bool { get }
    // the selected text, and the way it came: «ax» or «⌘C»
    func selection() async -> (text: String?, via: String)
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
    func read(_ parts: [Chunk], pressed: ContinuousClock.Instant)
}

@MainActor
final class PressSequencer {
    private let grab: any SelectionGrab
    private let target: any ReadTarget
    private let refreshSettings: () -> Void
    private let write: (String) -> Void
    // two ⌘C grabs at once read each other's restored clipboard, so each waits for the one before it
    private var lastGrab: Task<Void, Never>?

    init(grab: any SelectionGrab, target: any ReadTarget, refreshSettings: @escaping () -> Void, log write: @escaping (String) -> Void) {
        self.grab = grab
        self.target = target
        self.refreshSettings = refreshSettings
        self.write = write
    }

    // F4 reads the selection, cutting off what plays; with nothing selected it pauses / resumes what plays. ⇧F4 is
    // pause's second door, selection or not (dima, 2026-09-30). F5 stops. a grab that a newer order overtook is dropped
    func readPressed() async {
        let pressed = ContinuousClock.now
        let order = target.takeOrder()
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
        guard let (text, via) = await grabbing.value, target.order == order else {
            write("press: dropped, a newer order came")
            return
        }
        let grabbed = elapsed(pressed)
        let parts = chunks(normalize(text ?? ""))
        guard !parts.isEmpty else {
            write("press: nothing selected (grab \(via) \(grabbed))\(target.isSpeaking ? " → pause / resume" : "")")
            target.togglePause()
            return
        }
        write("press: grab \(via) \(grabbed), normalize \(elapsed(pressed)), \(parts.count) chunks")
        target.read(parts, pressed: pressed)
    }

    private func selection(_ order: Int) async -> (text: String?, via: String) {
        let (text, via) = await grab.selection()
        // an empty accessibility answer is trusted only while something plays (F4 = pause, no 300 ms ⌘C wait);
        // idle, F4 means «read», so ⌘C gets a try: a selection inside a canvas or a frame is not the focused
        // element's (Chrome on a claude.ai artifact, 2026-10-01)
        guard (text ?? "").isEmpty, via == "ax", !target.isSpeaking, target.order == order else { return (text, via) }
        return (await grab.copy(), "ax → ⌘C")
    }

    // ⇧F4: pause / resume what plays, whatever is selected
    func pausePressed() {
        write("press: ⇧F4 → \(target.isSpeaking ? (target.isPaused ? "resume" : "pause") : "nothing playing")")
        target.togglePause()
    }

    // F5
    func stopPressed() { target.silence() }
}
