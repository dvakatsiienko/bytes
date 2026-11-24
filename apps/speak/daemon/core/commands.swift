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
    func voices(of engine: Engine) -> [Voice]
    // the reason the file on disk is not the one in use, if it is not
    func reload() -> String?
    func savedSettings() throws -> SavedSettings
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings
    func togglePause()
    func stop()
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
func runOp(_ request: Request, with commands: any DaemonCommands) -> [String: Any] {
    switch request.op {
    case "status":
        return commands.status().reply
    case "voices":
        return ["engines": Engine.allCases.map { entry($0, commands.voices(of: $0)) }]
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
        if let refusal = commands.wave(on: request.on ?? false, glide: request.glide, flow: request.flow) { return ["error": refusal] }
    case "panel-hide":
        commands.hidePill()
    // a test hook: holds main for `seconds`, so the socket's answer under a blocked main can be measured
    case "block-main":
        commands.blockMain(for: request.seconds ?? 5)
    // a text read as F4 reads a selection: the per-language chain, cutting off whatever plays (a mod's 🔊, FRM-381)
    case "read":
        guard let text = request.text else { return ["error": "read needs text"] }
        let parts = commands.chunks(of: text)
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

// an engine as the page draws it
private func entry(_ engine: Engine, _ voices: [Voice]) -> [String: Any] {
    let facts = engine.facts
    return [
        "id": engine.rawValue, "label": facts.label, "languages": facts.languages.map(\.rawValue),
        "voices": voices.map { ["id": $0.id, "name": $0.name].merging($0.lang.map { ["lang": $0.rawValue] } ?? [:]) { one, _ in one } },
    ]
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
