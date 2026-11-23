// the control socket's commands, over the live read, pill and settings
import ApplicationServices
import Foundation

final class SocketCommands: DaemonCommands {
    private let speaker: Speaker
    private let panel: Panel
    private let configFile: ConfigFile

    init(speaker: Speaker, panel: Panel, configFile: ConfigFile) {
        self.speaker = speaker
        self.panel = panel
        self.configFile = configFile
    }

    func status() -> [String: Any] {
        [
            "engines": speaker.health(), "accessibility": AXIsProcessTrusted(),
            "speaking": speaker.isSpeaking, "paused": speaker.isPaused,
        ]
    }

    func voices() -> [[String: String]] { installedVoices() }
    func reload() -> String? { configFile.refresh() }
    func togglePause() { speaker.togglePause() }
    func stop() { speaker.silence() }
    func demoPill() { panel.demo() }
    func wave(on: Bool, glide: Double?, flow: Double?) { panel.wave(on: on, glide: glide, flow: flow) }
    func hidePill() { panel.hide() }
    func blockMain(for seconds: Double) { DispatchQueue.main.async { Thread.sleep(forTimeInterval: seconds) } }

    func read(_ parts: [Chunk]) {
        configFile.refresh()
        speaker.stop()
        speaker.speak(parts, only: nil, pressed: .now)
    }

    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) {
        speaker.preview(text, with: engine, settings: settings ?? configFile.current[engine])
    }
}
