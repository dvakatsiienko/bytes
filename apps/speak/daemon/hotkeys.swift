import Carbon.HIToolbox
import Foundation

@MainActor
final class Hotkeys {
    private let presses: () -> PressSequencer
    private var keys: [EventHotKeyRef?] = []

    init(presses: @escaping () -> PressSequencer) { self.presses = presses }

    // one handler for every key; the hotkey id says which fired: 1 is F4, 2 is F5, 3 is ⇧F4. answers how each was taken
    func register() -> String {
        var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        let installed = InstallEventHandler(GetEventDispatcherTarget(), { _, event, context in
            var fired = EventHotKeyID()
            GetEventParameter(event, EventParamName(kEventParamDirectObject), EventParamType(typeEventHotKeyID), nil, MemoryLayout<EventHotKeyID>.size, nil, &fired)
            let id = fired.id
            log("hotkey: \(id == 2 ? "F5" : id == 3 ? "⇧F4" : "F4")")
            let hotkeys = Unmanaged<Hotkeys>.fromOpaque(context!).takeUnretainedValue()
            Task { @MainActor in
                let presses = hotkeys.presses()
                switch id {
                case 2: presses.stopPressed()
                case 3: presses.pausePressed()
                default: await presses.readPressed()
                }
            }
            return noErr
        }, 1, &spec, Unmanaged.passUnretained(self).toOpaque(), nil)
        guard installed == noErr else { return "no key heard: its handler was refused (\(installed))" }
        return [("F4", kVK_F4, 0, UInt32(1)), ("F5", kVK_F5, 0, 2), ("⇧F4", kVK_F4, shiftKey, 3)].map { name, code, modifiers, id in
            var key: EventHotKeyRef?
            let status = RegisterEventHotKey(UInt32(code), UInt32(modifiers), EventHotKeyID(signature: 0x5350_4B31, id: id), GetEventDispatcherTarget(), 0, &key)
            keys.append(key)
            return "\(name) \(status == noErr ? "registered" : "refused (\(status))")"
        }.joined(separator: ", ")
    }
}
