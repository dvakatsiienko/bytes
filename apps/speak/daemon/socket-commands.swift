// the control socket's commands, over the live read, pill and settings
import ApplicationServices
import Foundation

final class SocketCommands: DaemonCommands {
    private let speaker: Speaker
    private let voices: Voices
    private let panel: Panel
    private let configStore: ConfigStore
    private let toChunks: (String) -> [Chunk]
    private let job: LaunchdJob
    private var restartAskedAt: Date?

    init(speaker: Speaker, voices: Voices, panel: Panel, configStore: ConfigStore, toChunks: @escaping (String) -> [Chunk], job: LaunchdJob) {
        self.speaker = speaker
        self.voices = voices
        self.panel = panel
        self.configStore = configStore
        self.toChunks = toChunks
        self.job = job
    }

    func status() -> Status {
        Status(
            engines: speaker.health(), isTrusted: AXIsProcessTrusted(), isSpeaking: speaker.isSpeaking, isPaused: speaker.isPaused, read: speaker.playback.read,
            settings: configStore.path
        )
    }

    func voices(of engine: Engine) -> [Voice] { voices.voices(of: engine) }
    func reload() -> String? { configStore.refresh() }
    func savedSettings() throws -> SavedSettings { try configStore.saved() }
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings { try configStore.save(patch, over: version) }
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings {
        try configStore.heart(engine: engine, voice: voice, isOn: isOn)
    }

    func togglePause() { speaker.togglePause() }
    func stop() { speaker.silence() }
    func restart() -> String? {
        let sinceAsked = restartAskedAt.map { Date().timeIntervalSince($0) }
        if let refusal = restartRefusal(isSpeaking: speaker.isSpeaking, sinceAsked: sinceAsked, job: job.label, runs: job.build, installed: LaunchdJob.installedBuild()) { return refusal }
        let failure = job.restart()
        if failure == nil { restartAskedAt = Date() }
        return failure
    }
    func demoPill() { panel.demo() }
    func wave(on: Bool, glide: Double?, flow: Double?) -> String? { panel.wave(on: on, glide: glide, flow: flow) }
    func hidePill() { panel.hide() }
    func blockMain(for seconds: Double) { DispatchQueue.main.async { Thread.sleep(forTimeInterval: seconds) } }

    func chunks(of text: String) -> [Chunk] { toChunks(text) }

    func read(_ parts: [Chunk]) {
        configStore.refresh()
        speaker.readGiven(parts)
    }

    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) -> Int {
        speaker.preview(text, with: engine, settings: settings ?? configStore.current[engine])
    }
}
