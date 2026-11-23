// x-speak — F4 reads the selection aloud, cutting off what plays, and with none pauses / resumes; ⇧F4 pauses / resumes; F5 stops. one resident process so the hot path
// pays no boot, no key fetch and no player spawn (the node version paid ~1.2 s, measured 2026-09-29).
// usage: x-speak --config <path> [--keys-run <script>]         the daemon (launchd)
//        x-speak --config <path> [--keys-run <script>] [--engine <name>] text   one-shot, for listening tests; it never starts the kokoro server
import AppKit
import AVFoundation
import Carbon.HIToolbox
import os

// chain, voices, speed, gain and the first-audio budget live in config.json, read again on the next F4 after a save
// the paths come in on argv (arguments.swift); a bad argv ends the process with one usage line
func usageExit(_ reason: String) -> Never {
    FileHandle.standardError.write(Data("x-speak: \(reason)\n\(Arguments.usage)\n".utf8))
    exit(2)
}

let launch: Arguments = {
    do { return try Arguments.parse(Array(CommandLine.arguments.dropFirst())) } catch { usageExit("\(error)") }
}()

@MainActor let configFile = ConfigFile(URL(fileURLWithPath: launch.configPath))
@MainActor var config: Config { configFile.current }

@MainActor let speaker = Speaker()

// main stays synchronous: NSApplication.run() inside an async main blocked the main actor for good, so no
// hotkey handler and no control reply ever ran (dima's first F4, 2026-09-29)
@main
struct XSpeak {
    @MainActor
    static func main() {
        var only: Engine?
        if let name = launch.engine {
            guard let engine = Engine(rawValue: name) else { usageExit("unknown engine «\(name)»") }
            only = engine
        }
        configFile.refresh()
        if launch.keysRunPath == nil { log("keys: no --keys-run, the cloud engines have no key") }

        if !launch.text.isEmpty {
            Task {
                await speaker.loadKeys()
                if only == nil || only == .kokoro { await speaker.warmKokoro() }
                speaker.speak(chunks(normalize(launch.text.joined(separator: " "))), only: only, pressed: .now)
                while speaker.isSpeaking { try? await Task.sleep(for: .milliseconds(50)) }
                exit(0)
            }
            // the app loop, like the daemon: the pill is a window, and under dispatchMain its first show landed off the
            // main thread and crashed every one-shot run
            NSApplication.shared.setActivationPolicy(.prohibited)
            NSApplication.shared.run()
        }

        Task {
            await speaker.loadKeys()
            await speaker.probeQuota()
            await speaker.warmKokoro()
        }
        let control = Control()
        control.start()
        heartbeat.start()
        var hotKey: EventHotKeyRef?
        var spec = EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed))
        // one handler for every key; the hotkey id says which fired: 1 is F4, 2 is F5, 3 is ⇧F4
        InstallEventHandler(GetEventDispatcherTarget(), { _, event, _ in
            var fired = EventHotKeyID()
            GetEventParameter(event, EventParamName(kEventParamDirectObject), EventParamType(typeEventHotKeyID), nil, MemoryLayout<EventHotKeyID>.size, nil, &fired)
            let id = fired.id
            log("hotkey: \(id == 2 ? "F5" : id == 3 ? "⇧F4" : "F4")")
            Task { @MainActor in
                switch id {
                case 2: speaker.stopPressed()
                case 3: speaker.pausePressed()
                default: await speaker.readPressed()
                }
            }
            return noErr
        }, 1, &spec, nil, nil)
        var stopKey: EventHotKeyRef?
        var pauseKey: EventHotKeyRef?
        let status = RegisterEventHotKey(UInt32(kVK_F4), 0, EventHotKeyID(signature: 0x5350_4B31, id: 1), GetEventDispatcherTarget(), 0, &hotKey)
        let stopStatus = RegisterEventHotKey(UInt32(kVK_F5), 0, EventHotKeyID(signature: 0x5350_4B31, id: 2), GetEventDispatcherTarget(), 0, &stopKey)
        let pauseStatus = RegisterEventHotKey(UInt32(kVK_F4), UInt32(shiftKey), EventHotKeyID(signature: 0x5350_4B31, id: 3), GetEventDispatcherTarget(), 0, &pauseKey)
        // with the prompt option macos itself asks for the grant, naming this exact process — no guessing which entry
        let isTrusted = AXIsProcessTrustedWithOptions(["AXTrustedCheckOptionPrompt": true] as CFDictionary)
        log("daemon: F4 \(status == noErr ? "registered" : "refused (\(status))"), F5 \(stopStatus == noErr ? "registered" : "refused (\(stopStatus))"), ⇧F4 \(pauseStatus == noErr ? "registered" : "refused (\(pauseStatus))"), accessibility \(isTrusted ? "granted" : "missing — macos shows its grant prompt")")
        NSApplication.shared.setActivationPolicy(.prohibited)
        NSApplication.shared.run()
    }
}
