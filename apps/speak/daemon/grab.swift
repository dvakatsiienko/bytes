import AppKit
import Carbon.HIToolbox

// the focused element's selected text through accessibility; ⌘C only where an app exposes none. an empty answer
// from accessibility is trusted as «nothing selected»: the ⌘C fallback waits ~300 ms for a copy that never comes,
// and that wait was the delay on every pause / resume (dima, 2026-09-29)
// apps whose accessibility focus is a different element from the selection: Slack reports its message box, empty,
// while the selected text sits in the message list (36 «nothing selected» presses, 2026-10-01)
let copyOnlyApps: Set<String> = ["com.tinyspeck.slackmacgap"]

@MainActor
func grabSelection() async -> (String?, String) {
    if let id = NSWorkspace.shared.frontmostApplication?.bundleIdentifier, copyOnlyApps.contains(id) {
        return (await copySelection(), "⌘C")
    }
    // electron and chromium build their accessibility tree only when asked; the flag is per app and idempotent
    if let pid = NSWorkspace.shared.frontmostApplication?.processIdentifier {
        AXUIElementSetAttributeValue(AXUIElementCreateApplication(pid), "AXManualAccessibility" as CFString, kCFBooleanTrue)
    }
    // the app's own focused element first: electron's system-wide focus query fails (-25204) where the app's answers
    var focused: CFTypeRef?
    let front = NSWorkspace.shared.frontmostApplication.map { AXUIElementCreateApplication($0.processIdentifier) }
    if !(front.map { AXUIElementCopyAttributeValue($0, kAXFocusedUIElementAttribute as CFString, &focused) == .success } ?? false) {
        _ = AXUIElementCopyAttributeValue(AXUIElementCreateSystemWide(), kAXFocusedUIElementAttribute as CFString, &focused)
    }
    if let element = focused, CFGetTypeID(element) == AXUIElementGetTypeID() {
        var selected: CFTypeRef?
        switch AXUIElementCopyAttributeValue(element as! AXUIElement, kAXSelectedTextAttribute as CFString, &selected) {
        case .success: return ((selected as? String).flatMap { $0.isEmpty ? nil : $0 }, "ax")
        // the element keeps selected text and has none right now: nothing is selected, no ⌘C wait
        case .noValue: return (nil, "ax")
        default: break
        }
    }
    return (await copySelection(), "⌘C")
}

// the clipboard comes back whole, every type of every item, once the copy has been read
@MainActor
func copySelection() async -> String? {
    let board = NSPasteboard.general
    let saved = board.pasteboardItems?.map { item in item.types.compactMap { type in item.data(forType: type).map { (type, $0) } } } ?? []
    let before = board.changeCount
    let source = CGEventSource(stateID: .combinedSessionState)
    for isDown in [true, false] {
        let event = CGEvent(keyboardEventSource: source, virtualKey: CGKeyCode(kVK_ANSI_C), keyDown: isDown)
        event?.flags = .maskCommand
        event?.post(tap: .cghidEventTap)
    }
    for _ in 0..<60 where board.changeCount == before { try? await Task.sleep(for: .milliseconds(5)) }
    guard board.changeCount != before else { return nil }
    let text = board.string(forType: .string)
    board.clearContents()
    board.writeObjects(saved.map { pairs in
        let item = NSPasteboardItem()
        for (type, data) in pairs { item.setData(data, forType: type) }
        return item
    })
    return text
}
