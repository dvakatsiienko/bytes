// x-speak — F4 reads the selection aloud, cutting off what plays, and with none pauses / resumes; ⇧F4 pauses / resumes; F5 stops. one resident process so the hot path
// pays no boot, no key fetch and no player spawn (the node version paid ~1.2 s, measured 2026-09-29).
// usage: x-speak --config <path> [--keys-run <script>]         the daemon (launchd)
//        x-speak --config <path> [--keys-run <script>] [--engine <name>] text   one-shot, for listening tests; it never starts the kokoro server
import AppKit

// the one value that hands each part what it needs. chain, voices, speed, gain and the first-audio budget live in
// the settings file (core/config-store.swift), read again on the next F4 after a hand edit
@MainActor
final class App {
    let arguments: Arguments
    let paths: Paths
    let configStore: ConfigStore
    let keys: Keys
    let kokoro: KokoroServer
    // the audio engine and the pill are made once the app runs, so a slow audio device holds up neither the socket nor the keys
    private(set) lazy var panel = Panel(settings: { [configStore] in configStore.current })
    private(set) lazy var speaker = makeSpeaker()
    private lazy var presses = PressSequencer(
        grab: Grab(), target: speaker, refreshSettings: { [configStore] in configStore.refresh() }, log: log
    )
    private lazy var commands = SocketCommands(speaker: speaker, panel: panel, configStore: configStore)
    private lazy var hotkeys = Hotkeys(presses: { [unowned self] in presses })
    private let heartbeat = Heartbeat()
    private lazy var control = Control(
        socket: paths.controlSocket,
        answers: Answers(commands: { [unowned self] in commands }, mainAge: { [heartbeat] in heartbeat.age })
    )

    init(_ arguments: Arguments) {
        self.arguments = arguments
        let paths = Paths()
        self.paths = paths
        let configStore = ConfigStore(URL(fileURLWithPath: arguments.settings(paths)))
        self.configStore = configStore
        keys = Keys(run: arguments.keysRunPath)
        kokoro = KokoroServer(paths: paths, mayStart: arguments.mayStartKokoro, voice: { configStore.current[.kokoro].voice(for: .en) })
    }

    func start(only: Engine?) {
        configStore.refresh()
        if arguments.keysRunPath == nil { log("keys: no --keys-run, the cloud engines have no key") }
        arguments.text.isEmpty ? startDaemon() : startOneShot(only: only)
        // the app loop, for a one-shot too: the pill is a window, and under dispatchMain its first show landed off the
        // main thread and crashed every one-shot run
        NSApplication.shared.setActivationPolicy(.prohibited)
        NSApplication.shared.run()
    }

    private func makeSpeaker() -> Speaker {
        let audio = MacAudio(), macVoice = MacVoice(), panel = panel
        let player = Player(device: audio, log: log)
        let speaker = Speaker(
            player: player, macVoice: macVoice,
            voices: LiveVoices(player: player, macVoice: macVoice, keys: keys, kokoro: kokoro),
            pill: panel, settings: { [configStore] in configStore.current }, log: log
        )
        kokoro.onWarm = { [weak speaker] in speaker?.kokoroIsWarm() }
        audio.onLevels = { [panel] levels, spacing in panel.model.push(levels, spacing: spacing) }
        panel.model.onClose = { [panel] in panel.hide() }
        panel.model.onPause = { [weak speaker] in speaker?.togglePause() }
        panel.model.onStop = { [weak speaker] in speaker?.silence() }
        panel.model.onUnstick = { [weak speaker, panel] in
            if speaker?.isSpeaking == false { panel.leave() }
        }
        return speaker
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
        if arguments.configPath != paths.settings { log("config: --config names \(arguments.configPath), the settings are at \(paths.settings)") }
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
