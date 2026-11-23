// x-speak — F4 reads the selection aloud, cutting off what plays, and with none pauses / resumes; ⇧F4 pauses / resumes; F5 stops. one resident process so the hot path
// pays no boot, no key fetch and no player spawn (the node version paid ~1.2 s, measured 2026-09-29).
// usage: x-speak --config <path> [--keys-run <script>]         the daemon (launchd)
//        x-speak --config <path> [--keys-run <script>] [--engine <name>] text   one-shot, for listening tests; it never starts the kokoro server
import AppKit

// the one value that hands each part what it needs. chain, voices, speed, gain and the first-audio budget live in
// config.json, read again on the next F4 after a save; the paths come in on argv (arguments.swift)
@MainActor
final class App {
    let arguments: Arguments
    let configFile: ConfigFile
    let keys: Keys
    let kokoro: KokoroServer
    // the audio engine and the pill are made once the app runs, so a slow audio device holds up neither the socket nor the keys
    private(set) lazy var panel = Panel(settings: { [configFile] in configFile.current })
    private(set) lazy var speaker = Speaker(
        player: Player(), macVoice: MacVoice(), panel: panel, keys: keys, kokoro: kokoro,
        settings: { [configFile] in configFile.current }
    )
    private lazy var presses = PressSequencer(
        grab: Grab(), target: speaker, refreshSettings: { [configFile] in configFile.refresh() }, log: log
    )
    private lazy var commands = SocketCommands(speaker: speaker, panel: panel, configFile: configFile)
    private lazy var hotkeys = Hotkeys(presses: { [unowned self] in presses })
    private let heartbeat = Heartbeat()
    private lazy var control = Control(
        socket: NSHomeDirectory() + "/.local/share/x-speak/control.sock",
        commands: { [unowned self] in commands },
        mainAge: { [heartbeat] in heartbeat.age }
    )

    init(_ arguments: Arguments) {
        self.arguments = arguments
        let configFile = ConfigFile(URL(fileURLWithPath: arguments.configPath))
        self.configFile = configFile
        keys = Keys(run: arguments.keysRunPath)
        kokoro = KokoroServer(mayStart: arguments.mayStartKokoro, voice: { configFile.current[.kokoro].voice(for: .en) })
    }

    func start(only: Engine?) {
        configFile.refresh()
        if arguments.keysRunPath == nil { log("keys: no --keys-run, the cloud engines have no key") }
        arguments.text.isEmpty ? startDaemon() : startOneShot(only: only)
        // the app loop, for a one-shot too: the pill is a window, and under dispatchMain its first show landed off the
        // main thread and crashed every one-shot run
        NSApplication.shared.setActivationPolicy(.prohibited)
        NSApplication.shared.run()
    }

    private func startOneShot(only: Engine?) {
        Task {
            let speaker = speaker
            await keys.load()
            if only == nil || only == .kokoro { await kokoro.warm() }
            speaker.speak(chunks(normalize(arguments.text.joined(separator: " "))), only: only, pressed: .now)
            while speaker.isSpeaking { try? await Task.sleep(for: .milliseconds(50)) }
            exit(0)
        }
    }

    private func startDaemon() {
        Task {
            let speaker = speaker
            await keys.load()
            await speaker.probeQuota()
            await kokoro.warm()
        }
        control.start()
        heartbeat.start()
        let registered = hotkeys.register()
        // with the prompt option macos itself asks for the grant, naming this exact process — no guessing which entry
        let isTrusted = AXIsProcessTrustedWithOptions(["AXTrustedCheckOptionPrompt": true] as CFDictionary)
        log("daemon: \(registered), accessibility \(isTrusted ? "granted" : "missing — macos shows its grant prompt")")
    }
}

// main stays synchronous: NSApplication.run() inside an async main blocked the main actor for good, so no
// hotkey handler and no control reply ever ran (dima's first F4, 2026-09-29)
@main
struct XSpeak {
    @MainActor
    static func main() {
        do {
            let arguments = try Arguments.parse(Array(CommandLine.arguments.dropFirst()))
            var only: Engine?
            if let name = arguments.engine {
                guard let engine = Engine(rawValue: name) else { usageExit("unknown engine «\(name)»") }
                only = engine
            }
            withExtendedLifetime(App(arguments)) { $0.start(only: only) }
        } catch {
            usageExit("\(error)")
        }
    }

    // a bad argv ends the process with one usage line
    private static func usageExit(_ reason: String) -> Never {
        FileHandle.standardError.write(Data("x-speak: \(reason)\n\(Arguments.usage)\n".utf8))
        exit(2)
    }
}
