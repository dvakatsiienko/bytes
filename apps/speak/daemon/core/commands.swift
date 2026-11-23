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
}

@MainActor
protocol DaemonCommands: AnyObject {
    func status() -> [String: Any]
    func voices() -> [[String: String]]
    // the reason the file on disk is not the one in use, if it is not
    func reload() -> String?
    func togglePause()
    func stop()
    func demoPill()
    func wave(on: Bool, glide: Double?, flow: Double?)
    func hidePill()
    func blockMain(for seconds: Double)
    func read(_ parts: [Chunk])
    func preview(_ text: String, with engine: Engine, settings: EngineConfig?)
}

@MainActor
func runOp(_ request: Request, with commands: any DaemonCommands) -> [String: Any] {
    switch request.op {
    case "status":
        return commands.status()
    case "voices":
        return ["system": commands.voices()]
    case "reload":
        return commands.reload().map { ["error": $0] } ?? ["ok": true]
    // pause and resume, the pill's ⏸ from the admin
    case "pause":
        commands.togglePause()
    case "stop":
        commands.stop()
    // shows the pill with sample levels, for screenshots of a design take
    case "panel-demo":
        commands.demoPill()
    case "wave":
        commands.wave(on: request.on ?? false, glide: request.glide, flow: request.flow)
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
        commands.preview(text, with: engine, settings: request.settings)
    default:
        return ["error": "unknown op \(request.op)"]
    }
    return ["ok": true]
}
