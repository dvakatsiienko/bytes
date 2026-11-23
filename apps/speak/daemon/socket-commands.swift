// the control socket's commands, over the live read, pill and settings
import ApplicationServices
import Foundation

final class SocketCommands: DaemonCommands {
    private let speaker: Speaker
    private let panel: Panel
    private let configStore: ConfigStore

    init(speaker: Speaker, panel: Panel, configStore: ConfigStore) {
        self.speaker = speaker
        self.panel = panel
        self.configStore = configStore
    }

    func status() -> Status {
        Status(engines: speaker.health(), isTrusted: AXIsProcessTrusted(), isSpeaking: speaker.isSpeaking, isPaused: speaker.isPaused)
    }

    func voices() -> [[String: String]] { installedVoices() }
    func reload() -> String? { configStore.refresh() }
    func savedSettings() throws -> SavedSettings { try configStore.saved() }
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings { try configStore.save(patch, over: version) }
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings {
        try configStore.heart(engine: engine, voice: voice, isOn: isOn)
    }

    func togglePause() { speaker.togglePause() }
    func stop() { speaker.silence() }
    func demoPill() { panel.demo() }
    func wave(on: Bool, glide: Double?, flow: Double?) { panel.wave(on: on, glide: glide, flow: flow) }
    func hidePill() { panel.hide() }
    func blockMain(for seconds: Double) { DispatchQueue.main.async { Thread.sleep(forTimeInterval: seconds) } }

    func read(_ parts: [Chunk]) {
        configStore.refresh()
        speaker.stop()
        speaker.speak(parts, only: nil, pressed: .now)
    }

    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) {
        speaker.preview(text, with: engine, settings: settings ?? configStore.current[engine])
    }
}
