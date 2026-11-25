// the control socket's ops, as commands it is handed
import Foundation

@MainActor
protocol DaemonCommands: AnyObject {
    func status() -> Status
    func voices(of engine: Engine) -> [Voice]
    // the reason the file on disk is not the one in use, if it is not
    func reload() -> String?
    func savedSettings() throws -> SavedSettings
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings
    func togglePause()
    func stop()
    // why it does not; the answer leaves before the daemon does
    func restart() -> String?
    func demoPill()
    // why it does not run. «on» with nothing to tune renews the one that runs
    func wave(on: Bool, glide: Double?, flow: Double?) -> String?
    func hidePill()
    func blockMain(for seconds: Double)
    func chunks(of text: String) -> [Chunk]
    func read(_ parts: [Chunk])
    // the read's number
    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) -> Int
}

@MainActor
func run(_ request: Request, with commands: any DaemonCommands) -> Reply {
    switch request {
    case .status: return .status(commands.status())
    case .voices: return .voices(Engine.allCases.map { entry($0, commands.voices(of: $0)) })
    case .reload: return commands.reload().map(Reply.error) ?? .ok
    case .config: return settingsReply { try commands.savedSettings() }
    case .save(let patch, let version): return settingsReply { try commands.save(patch, over: version) }
    case .heart(let engine, let voice, let isOn): return settingsReply { try commands.heart(engine: engine, voice: voice, isOn: isOn) }
    // pause and resume, the pill's ⏸ from the admin
    case .pause: commands.togglePause()
    case .stop: commands.stop()
    case .restart: return commands.restart().map(Reply.error) ?? .ok
    case .panelDemo: commands.demoPill()
    case .panelHide: commands.hidePill()
    case .wave(let isOn, let glide, let flow):
        if let refusal = commands.wave(on: isOn, glide: glide, flow: flow) { return .error(refusal) }
    case .blockMain(let seconds): commands.blockMain(for: seconds)
    // a text read as F4 reads a selection: the per-language chain, cutting off whatever plays (a mod's 🔊, FRM-381)
    case .read(let text):
        let parts = commands.chunks(of: text)
        guard !parts.isEmpty else { return .error("read: nothing to say") }
        commands.read(parts)
    case .preview(let text, let engine, let settings): return .began(read: commands.preview(text, with: engine, settings: settings))
    }
    return .ok
}

private func entry(_ engine: Engine, _ voices: [Voice]) -> CatalogueEntry {
    CatalogueEntry(id: engine.rawValue, label: engine.facts.label, languages: engine.facts.languages, voices: voices)
}

private func settingsReply(_ ask: () throws -> SavedSettings) -> Reply {
    do {
        return .settings(try ask())
    } catch SaveError.stale {
        return .refused(Refusal(error: "\(SaveError.stale)", stale: true))
    } catch {
        return .error("\(error)")
    }
}

// a restart right after a swap died on its signature and sat out launchd's 30 s, so a build that never ran is the
// relaunch script's. `runs` and `installed` are the hashes of the binary that runs and of the one launchd would start
// a second one would kill the daemon the first one starts, and that one's next start waits 30 s
func restartRefusal(isSpeaking: Bool, sinceAsked: TimeInterval?, job: String?, runs: String?, installed: String?) -> String? {
    if let sinceAsked, sinceAsked < 30 { return "a restart is on its way" }
    if isSpeaking { return "x-speak is reading aloud" }
    guard let job, job != "0" else { return "launchd does not run this daemon" }
    guard let runs, runs == installed else { return "another build is installed and has not run yet: daemon:relaunch starts it" }
    return nil
}
