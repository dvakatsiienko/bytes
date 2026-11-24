// what travels on the control socket: one json line in, one out, as contract/wire.schema.json names them
import Foundation

enum Op: String, Decodable, CaseIterable {
    case status, voices, reload, config, save, heart, pause, stop, read, preview, wave
    // shows the pill with sample levels, for screenshots of a design take
    case panelDemo = "panel-demo"
    case panelHide = "panel-hide"
    // a test hook: holds main for `seconds`, so the socket's answer under a blocked main can be measured
    case blockMain = "block-main"
}

// an op with what it takes
enum Request: Equatable {
    case status, voices, reload, config, pause, stop, panelDemo, panelHide
    // the changed keys and the version they were made on
    case save(patch: Json?, version: String?)
    case heart(engine: String?, voice: String?, isOn: Bool?)
    case read(text: String)
    case preview(text: String, engine: Engine, settings: EngineConfig?)
    case wave(isOn: Bool, glide: Double?, flow: Double?)
    case blockMain(seconds: Double)

    var op: Op {
        switch self {
        case .status: .status
        case .voices: .voices
        case .reload: .reload
        case .config: .config
        case .pause: .pause
        case .stop: .stop
        case .panelDemo: .panelDemo
        case .panelHide: .panelHide
        case .save: .save
        case .heart: .heart
        case .read: .read
        case .preview: .preview
        case .wave: .wave
        case .blockMain: .blockMain
        }
    }
}

extension Request: Decodable {
    private enum Field: String, CodingKey { case op, patch, version, engine, voice, on, text, settings, glide, flow, seconds }

    init(from decoder: Decoder) throws {
        let fields = try decoder.container(keyedBy: Field.self)
        let name = try fields.decode(String.self, forKey: .op)
        guard let op = Op(rawValue: name) else { throw RequestError.unknownOp(name) }
        func field<T: Decodable>(_ key: Field) throws -> T? { try fields.decodeIfPresent(T.self, forKey: key) }
        switch op {
        case .status: self = .status
        case .voices: self = .voices
        case .reload: self = .reload
        case .config: self = .config
        case .pause: self = .pause
        case .stop: self = .stop
        case .panelDemo: self = .panelDemo
        case .panelHide: self = .panelHide
        case .save: self = .save(patch: try field(.patch), version: try field(.version))
        case .heart: self = .heart(engine: try field(.engine), voice: try field(.voice), isOn: try field(.on))
        case .read:
            guard let text: String = try field(.text) else { throw RequestError.needs("read needs text") }
            self = .read(text: text)
        case .preview:
            let name: String? = try field(.engine)
            guard let engine = name.flatMap(Engine.init), let text: String = try field(.text) else { throw RequestError.needs("preview needs engine and text") }
            self = .preview(text: text, engine: engine, settings: try field(.settings))
        case .wave: self = .wave(isOn: try field(.on) ?? false, glide: try field(.glide), flow: try field(.flow))
        case .blockMain: self = .blockMain(seconds: try field(.seconds) ?? 5)
        }
    }
}

enum RequestError: Error, CustomStringConvertible {
    case unknownOp(String), needs(String)

    var description: String {
        switch self {
        case .unknownOp(let name): "unknown op \(name)"
        case .needs(let what): what
        }
    }
}

enum Reply: Encodable {
    case ok
    case refused(Refusal)
    case status(Status)
    case voices([CatalogueEntry])
    case settings(SavedSettings)
    // the read it began
    case began(read: Int)

    static func error(_ reason: String) -> Reply { .refused(Refusal(error: reason)) }

    private enum Field: String, CodingKey { case ok, read, engines, config, version, was }

    func encode(to encoder: Encoder) throws {
        var fields = encoder.container(keyedBy: Field.self)
        switch self {
        case .refused(let refusal): return try refusal.encode(to: encoder)
        case .status(let status): return try status.encode(to: encoder)
        case .voices(let engines): return try fields.encode(engines, forKey: .engines)
        case .ok: break
        case .began(let read): try fields.encode(read, forKey: .read)
        case .settings(let saved):
            try fields.encode(saved.config, forKey: .config)
            try fields.encode(saved.version, forKey: .version)
            try fields.encode(saved.was, forKey: .was)
        }
        try fields.encode(true, forKey: .ok)
    }
}

struct Refusal: Encodable {
    let error: String
    // the settings file moved on since the page read it
    var stale: Bool?
    // main could not answer
    var main: String?
}

struct Status: Encodable {
    let engines: [String: Health]
    let isTrusted: Bool
    var isSpeaking: Bool
    var isPaused: Bool
    // the read that plays
    var read: Int?
    // where the settings are: a rollback reads it to know whether an older daemon looks elsewhere
    let settings: String
    // main could not answer: this is its last status
    var main: String?

    private enum CodingKeys: String, CodingKey {
        case engines, isTrusted = "accessibility", isSpeaking = "speaking", isPaused = "paused", read, settings, main
    }
}

// how an engine stands
struct Health: Encodable, Equatable {
    enum State: String, Encodable, CaseIterable { case live, benched, noKey = "no key", noQuota = "no quota" }

    let state: State
    var until: String?
    // the provider's own words
    var note: String?
}

// an engine as the page draws it
struct CatalogueEntry: Encodable {
    let id: String
    let label: String
    let languages: [Lang]
    let voices: [Voice]
}
