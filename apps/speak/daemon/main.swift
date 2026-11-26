// x-speak — F4 reads the selection aloud, cutting off what plays, and with none pauses / resumes; ⇧F4 pauses / resumes; F5 stops. one resident process so the hot path
// pays no boot, no key fetch and no player spawn (the node version paid ~1.2 s, measured 2026-09-29).
// usage: x-speak --config <path> [--keys-run <script>]         the daemon (launchd)
//        x-speak --config <path> [--keys-run <script>] [--engine <name>] text   one-shot, for listening tests; it never starts the kokoro server
//        x-speak --pill <state> [--print-model]   one fixed state of the pill, shown or printed
import AppKit

// the one value that hands each part what it needs. chain, voices, speed, gain and the first-audio budget live in
// the settings file (core/config-store.swift), read again on the next F4 after a hand edit
@MainActor
final class App {
    let arguments: Arguments
    let paths: Paths
    let configStore: ConfigStore
    let wordLists: WordListStore
    let keys: Keys
    let net = LiveNet()
    let kokoro: KokoroServer
    // the audio engine and the pill are made once the app runs, so a slow audio device holds up neither the socket nor the keys
    private(set) lazy var panel = Panel(settings: { [configStore] in configStore.current })
    private lazy var audio = MacAudio()
    private lazy var player = Player(device: audio, log: log)
    private lazy var voices = Voices(EngineParts(net: net, mac: MacRender()), player: player, keys: keys, servers: [.kokoro: kokoro])
    private(set) lazy var speaker = makeSpeaker()
    private lazy var toChunks = { [wordLists] in spokenChunks(of: $0, wordLists.current) }
    private lazy var presses = PressSequencer(
        grab: Grab(copyOnlyApps: { [wordLists] in wordLists.current.copyOnlyApps }), target: speaker, refreshSettings: { [configStore] in configStore.refresh() },
        toChunks: { [wordLists] in spokenChunks(of: $0, wordLists.current, nextMarker: $1) }, log: log
    )
    private lazy var commands = SocketCommands(speaker: speaker, voices: voices, panel: panel, configStore: configStore, toChunks: toChunks, job: job)
    private lazy var hotkeys = Hotkeys(presses: { [unowned self] in presses })
    private let heartbeat = Heartbeat()
    private let job = LaunchdJob()
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
        wordLists = WordListStore(URL(fileURLWithPath: paths.wordLists))
        keys = Keys(run: arguments.keysRunPath.map { script in { try await runWithKeys(script, $0) } }, keychain: arguments.text.isEmpty ? keychainKey : nil, log: log)
        kokoro = KokoroServer(KokoroProcess(paths: paths), net: net, settings: { configStore.current[.kokoro] }, mayStart: arguments.mayStartKokoro, log: log)
    }

    func start(only: Engine?) {
        let settingsError = configStore.refresh()
        if arguments.keysRunPath == nil { log("keys: no --keys-run, the cloud engines have the keychain's alone") }
        arguments.text.isEmpty ? startDaemon(hasSettings: settingsError == nil) : startOneShot(only: only)
        // the app loop, for a one-shot too: the pill is a window, and under dispatchMain its first show landed off the
        // main thread and crashed every one-shot run
        NSApplication.shared.setActivationPolicy(.prohibited)
        NSApplication.shared.run()
    }

    private func makeSpeaker() -> Speaker {
        let speaker = Speaker(player: player, voices: voices, pill: panel, settings: { [configStore] in configStore.current }, toChunks: toChunks, onRead: ReadRecords(path: paths.readRecord, log: log).add, log: log)
        kokoro.onWarm = { [weak speaker] in speaker?.serverIsWarm(of: .kokoro) }
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
            speaker.speak(toChunks(arguments.text.joined(separator: " ")), only: only, pressed: .now)
            while speaker.isSpeaking { try? await Task.sleep(for: .milliseconds(50)) }
            exit(0)
        }
    }

    private func startDaemon(hasSettings: Bool) {
        ownerOnly(STDERR_FILENO)
        withNoKeychainWindows()
        Task {
            let speaker = speaker
            // the one voice that needs no net waits for none
            async let warm: Void = kokoro.warm()
            await keys.load()
            await speaker.probeQuota()
            await warm
        }
        let registered = hotkeys.register()
        // written by main's own loop, so a main that never runs leaves none
        control.start { [paths, job] in DispatchQueue.main.async { markStart(of: job.build, hasSettings: hasSettings, hasF4: registered.hasF4, at: paths.startMark) } }
        heartbeat.start()
        // with the prompt option macos itself asks for the grant, naming this exact process — no guessing which entry
        let isTrusted = AXIsProcessTrustedWithOptions(["AXTrustedCheckOptionPrompt": true] as CFDictionary)
        if arguments.configPath != paths.settings { log("config: --config names \(arguments.configPath), the settings are at \(paths.settings)") }
        log("daemon: \(registered.words), accessibility \(isTrusted ? "granted" : "missing — macos shows its grant prompt")")
    }
}

private func markStart(of build: String?, hasSettings: Bool, hasF4: Bool, at path: String) {
    do {
        guard let build else { throw CocoaError(.fileReadUnknown) }
        try startMark(build: build, hasSettings: hasSettings, hasF4: hasF4, at: Date()).write(toFile: path, atomically: true, encoding: .utf8)
    } catch {
        log("start mark: not written — \(error)")
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
            if let pill = arguments.pill { return arguments.printsModel ? print(pill.model.json) : showPill(pill) }
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
