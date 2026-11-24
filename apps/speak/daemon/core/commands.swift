// the control socket's ops, as commands it is handed: one json line in, one object out
import Foundation

struct Request: Decodable {
    let op: String
    let engine: String?
    let text: String?
    let settings: EngineConfig?
    let on: Bool?
    let glide: Double?
    let flow: Double?
    let seconds: Double?
    // a save's changed keys and the version it edits; a heart's voice
    let patch: Json?
    let version: String?
    let voice: String?
}

struct Status {
    let engines: [String: [String: String]]
    let isTrusted: Bool
    let isSpeaking: Bool
    let isPaused: Bool
    // the read that plays
    let read: Int?
    // where the settings are: a rollback reads it to know whether an older daemon looks elsewhere
    let settings: String

    var reply: [String: Any] {
        var reply: [String: Any] = ["engines": engines, "accessibility": isTrusted, "speaking": isSpeaking, "paused": isPaused, "settings": settings]
        reply["read"] = read
        return reply
    }
}

@MainActor
protocol DaemonCommands: AnyObject {
    func status() -> Status
    func voices() -> [[String: String]]
    // the reason the file on disk is not the one in use, if it is not
    func reload() -> String?
    func savedSettings() throws -> SavedSettings
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings
    func togglePause()
    func stop()
    func demoPill()
    // false while a read plays: the pill is its own
    func wave(on: Bool, glide: Double?, flow: Double?) -> Bool
    func hidePill()
    func blockMain(for seconds: Double)
    func read(_ parts: [Chunk])
    // the read's number
    func preview(_ text: String, with engine: Engine, settings: EngineConfig?) -> Int
}

@MainActor
func runOp(_ request: Request, with commands: any DaemonCommands) -> [String: Any] {
    switch request.op {
    case "status":
        return commands.status().reply
    case "voices":
        return ["system": commands.voices()]
    case "reload":
        return commands.reload().map { ["error": $0] } ?? ["ok": true]
    case "config":
        return settingsReply { try commands.savedSettings() }
    case "save":
        return settingsReply { try commands.save(request.patch, over: request.version) }
    case "heart":
        return settingsReply { try commands.heart(engine: request.engine, voice: request.voice, isOn: request.on) }
    // pause and resume, the pill's ⏸ from the admin
    case "pause":
        commands.togglePause()
    case "stop":
        commands.stop()
    // shows the pill with sample levels, for screenshots of a design take
    case "panel-demo":
        commands.demoPill()
    case "wave":
        guard commands.wave(on: request.on ?? false, glide: request.glide, flow: request.flow) else {
            return ["error": "the waveform waits: x-speak is reading aloud"]
        }
    case "panel-hide":
        commands.hidePill()
    // a test hook: holds main for `seconds`, so the socket's answer under a blocked main can be measured
    case "block-main":
        commands.blockMain(for: request.seconds ?? 5)
    // a text read as F4 reads a selection: the per-language chain, cutting off whatever plays (a mod's 🔊, FRM-381)
    case "read":
        guard let text = request.text else { return ["error": "read needs text"] }
        let parts = chunks(normalize(text))
        guard !parts.isEmpty else { return ["error": "read: nothing to say"] }
        commands.read(parts)
    case "preview":
        guard let engine = request.engine.flatMap(Engine.init), let text = request.text else { return ["error": "preview needs engine and text"] }
        return ["ok": true, "read": commands.preview(text, with: engine, settings: request.settings)]
    default:
        return ["error": "unknown op \(request.op)"]
    }
    return ["ok": true]
}

private func settingsReply(_ ask: () throws -> SavedSettings) -> [String: Any] {
    do {
        let saved = try ask()
        return ["ok": true, "config": saved.config.any, "version": saved.version, "was": saved.was]
    } catch SaveError.stale {
        return ["error": "\(SaveError.stale)", "stale": true]
    } catch {
        return ["error": "\(error)"]
    }
}
