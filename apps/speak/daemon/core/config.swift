// config.json: dima's knobs, as the daemon reads them. its one reader and writer is config-store.swift
import Foundation

enum Engine: String, CaseIterable {
    case elevenlabs, fish, kokoro, system, gemini

    var isCloud: Bool { self != .kokoro && self != .system }
    var streams: Bool { self == .elevenlabs || self == .fish }
    func speaks(_ lang: Lang) -> Bool { self != .kokoro || lang == .en }
}

struct Config: Decodable {
    // per language, tried in order; an engine that fails or runs out of quota is skipped silently
    let chain: [Lang: [Engine]]
    // a cloud engine with no audio by then yields to the next one, while nothing is playing yet
    let firstAudioMs: Int
    // the pill's bars: how long each takes to glide most of the way to a new reading; 0 steps straight to it
    let meterGlideMs: Double
    // the pill's wave: how long each reading holds the centre before it moves one bar outward
    let meterFlowMs: Double
    let engines: [Engine: EngineConfig]

    subscript(engine: Engine) -> EngineConfig { engines[engine] ?? EngineConfig() }

    // the load line's proof that the file in use is the one meant: each engine's voices, speed and gain
    var summary: String {
        engines.sorted { $0.key.rawValue < $1.key.rawValue }
            .map { "\($0.key.rawValue): voice \($0.value.voices), speed \($0.value.speed), gain \($0.value.gain)" }
            .joined(separator: "; ")
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        chain = try Self.keyed(container.decode([String: [String]].self, forKey: .chain), Lang.init) { names in
            try names.map { try Self.parse($0, Engine.init) }
        }
        // asked for as an Int, a half is reported as broken json and names no key
        guard let budget = Int(exactly: try container.decode(Double.self, forKey: .firstAudioMs)) else {
            throw DecodingError.dataCorruptedError(forKey: .firstAudioMs, in: container, debugDescription: "not whole")
        }
        firstAudioMs = budget
        meterGlideMs = try container.decodeIfPresent(Double.self, forKey: .meterGlideMs) ?? 30
        meterFlowMs = try container.decodeIfPresent(Double.self, forKey: .meterFlowMs) ?? 40
        try inRange("firstAudioMs", Double(firstAudioMs), 100...3000)
        try inRange("meterGlideMs", meterGlideMs, 0...200)
        try inRange("meterFlowMs", meterFlowMs, 0...200)
        engines = try Self.keyed(container.decode([String: EngineConfig].self, forKey: .engines), Engine.init) { $0 }
    }

    private init(chain: [Lang: [Engine]], firstAudioMs: Int, engines: [Engine: EngineConfig]) {
        self.chain = chain
        self.firstAudioMs = firstAudioMs
        meterGlideMs = 30
        meterFlowMs = 40
        self.engines = engines
    }

    // an unknown engine or language name fails the whole load, so a typo is reported instead of ignored
    fileprivate static func parse<T>(_ name: String, _ make: (String) -> T?) throws -> T {
        guard let value = make(name) else { throw ConfigError.unknownName(name) }
        return value
    }

    private static func keyed<K: Hashable, V, W>(_ raw: [String: V], _ make: (String) -> K?, _ map: (V) throws -> W) throws -> [K: W] {
        try Dictionary(uniqueKeysWithValues: raw.map { (try parse($0.key, make), try map($0.value)) })
    }

    // used only when config.json is unreadable at start
    static let fallback = Config(
        chain: [.en: [.kokoro, .system], .uk: [.system], .ru: [.system]],
        firstAudioMs: 500,
        engines: [.kokoro: EngineConfig(voice: ["en": "af_heart"], gain: 1.9)],
    )

    enum CodingKeys: String, CodingKey, CaseIterable { case chain, firstAudioMs, meterGlideMs, meterFlowMs, engines }
}

// the bounds and defaults here are contract/config.schema.json's; its test drives each one through this decoder
private func inRange(_ field: String, _ value: Double, _ range: ClosedRange<Double>) throws {
    guard range.contains(value) else { throw ConfigError.outOfRange(field, value, range) }
}

struct EngineConfig: Decodable {
    // the page's alone: the voices dima hearted
    var favourites: [String] = []
    var model: String?
    // per language; for kokoro and gemini one voice serves every language they speak
    var voice: [String: String] = [:]
    // playback rate, pitch kept; 1 is the engine's own pace
    var speed: Double = 1
    var gain: Double = 1

    func voice(for lang: Lang) -> String? { voice[lang.rawValue] ?? voice["*"] }

    // every language's voice, for the load line: «*=Sarah,en=Jessica»
    var voices: String { voice.isEmpty ? "-" : voice.sorted { $0.key < $1.key }.map { "\($0.key)=\($0.value)" }.joined(separator: ",") }

    init(voice: [String: String] = [:], gain: Double = 1) {
        self.voice = voice
        self.gain = gain
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        favourites = try container.decodeIfPresent([String].self, forKey: .favourites) ?? []
        model = try container.decodeIfPresent(String.self, forKey: .model)
        voice = try container.decodeIfPresent([String: String].self, forKey: .voice) ?? [:]
        for name in voice.keys where name != "*" { _ = try Config.parse(name, Lang.init) }
        speed = try container.decodeIfPresent(Double.self, forKey: .speed) ?? 1
        gain = try container.decodeIfPresent(Double.self, forKey: .gain) ?? 1
        try inRange("speed", speed, 0.5...3)
        try inRange("gain", gain, 0...4)
    }

    enum CodingKeys: String, CodingKey, CaseIterable { case favourites, model, voice, speed, gain }
}

enum ConfigError: Error, CustomStringConvertible {
    case unknownName(String), outOfRange(String, Double, ClosedRange<Double>)

    var description: String {
        switch self {
        case .unknownName(let name): "unknown name «\(name)» — engines: \(Engine.allCases.map(\.rawValue).joined(separator: ", ")); languages: en, uk, ru"
        case .outOfRange(let field, let value, let range): "\(field) \(plain(value)) is out of range (\(plain(range.lowerBound))–\(plain(range.upperBound)))"
        }
    }
}

// a number as the settings file prints it: 1, not 1.0
func plain(_ value: Double) -> String { value == value.rounded() ? String(format: "%.0f", value) : "\(value)" }

// why a settings file did not load, in words the page can show
func configReason(_ error: Error) -> String {
    let path = { (context: DecodingError.Context) in context.codingPath.map(\.stringValue).joined(separator: ".") }
    return switch error {
    // a number that does not fit its type: json is fine, the value is not
    case DecodingError.dataCorrupted(let context) where !context.codingPath.isEmpty: "«\(path(context))» has the wrong type"
    case DecodingError.dataCorrupted(let context):
        "not valid json — \((context.underlyingError as NSError?)?.userInfo[NSDebugDescriptionErrorKey] ?? context.debugDescription)"
    case DecodingError.keyNotFound(let key, let context): "missing «\((path(context).isEmpty ? "" : path(context) + ".") + key.stringValue)»"
    case DecodingError.typeMismatch(_, let context), DecodingError.valueNotFound(_, let context): "«\(path(context))» has the wrong type"
    default: "\(error)"
    }
}
