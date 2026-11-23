// config.json, at the path the launchd job hands in as --config: dima's knobs, re-read on the next F4 after a save. a bad edit logs one
// line and the last good config stays; the daemon never dies on a typo.
import Foundation

enum Engine: String, CaseIterable {
    case elevenlabs, fish, kokoro, system, gemini

    var isCloud: Bool { self != .kokoro && self != .system }
    var streams: Bool { self == .elevenlabs || self == .fish }
    func speaks(_ lang: Lang) -> Bool { self != .kokoro || lang == .en }
}

func log(_ line: String) {
    let stamp = ISO8601DateFormatter.string(from: Date(), timeZone: .current, formatOptions: [.withFullDate, .withDashSeparatorInDate, .withSpaceBetweenDateAndTime, .withTime, .withColonSeparatorInTime, .withFractionalSeconds])
    FileHandle.standardError.write(Data("\(stamp) \(line)\n".utf8))
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
        firstAudioMs = try container.decode(Int.self, forKey: .firstAudioMs)
        meterGlideMs = try container.decodeIfPresent(Double.self, forKey: .meterGlideMs) ?? 30
        meterFlowMs = try container.decodeIfPresent(Double.self, forKey: .meterFlowMs) ?? 40
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
    private static func parse<T>(_ name: String, _ make: (String) -> T?) throws -> T {
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

    private enum CodingKeys: String, CodingKey { case chain, firstAudioMs, meterGlideMs, meterFlowMs, engines }
}

struct EngineConfig: Decodable {
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
        model = try container.decodeIfPresent(String.self, forKey: .model)
        voice = try container.decodeIfPresent([String: String].self, forKey: .voice) ?? [:]
        speed = try container.decodeIfPresent(Double.self, forKey: .speed) ?? 1
        gain = try container.decodeIfPresent(Double.self, forKey: .gain) ?? 1
        guard (0.5...3).contains(speed) else { throw ConfigError.outOfRange("speed", speed) }
        guard (0...4).contains(gain) else { throw ConfigError.outOfRange("gain", gain) }
    }

    private enum CodingKeys: String, CodingKey { case model, voice, speed, gain }
}

enum ConfigError: Error, CustomStringConvertible {
    case unknownName(String), outOfRange(String, Double)

    var description: String {
        switch self {
        case .unknownName(let name): "unknown name «\(name)» — engines: \(Engine.allCases.map(\.rawValue).joined(separator: ", ")); languages: en, uk, ru"
        case .outOfRange(let field, let value): "\(field) \(value) is out of range (speed 0.5–3, gain 0–4)"
        }
    }
}

@MainActor
final class ConfigFile {
    private let url: URL
    private var loadedStamp: Date?
    private var lastError: String?
    private var hasLoaded = false
    private(set) var current = Config.fallback

    init(_ url: URL) { self.url = url }

    private static func describe(_ error: Error) -> String {
        let path = { (context: DecodingError.Context) in context.codingPath.map(\.stringValue).joined(separator: ".") }
        return switch error {
        case DecodingError.dataCorrupted(let context):
            "not valid json — \((context.underlyingError as NSError?)?.userInfo[NSDebugDescriptionErrorKey] ?? context.debugDescription)"
        case DecodingError.keyNotFound(let key, let context): "missing «\((path(context).isEmpty ? "" : path(context) + ".") + key.stringValue)»"
        case DecodingError.typeMismatch(_, let context), DecodingError.valueNotFound(_, let context): "«\(path(context))» has the wrong type"
        default: "\(error)"
        }
    }

    // cheap enough for every press: one stat, and a parse only when the file changed. returns the reason the
    // file on disk is not the one in use, if it is not
    @discardableResult
    func refresh() -> String? {
        let stamp = try? url.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate
        // a file that is not there has no stamp: it still gets its one «kept» line, or a wrong --config runs silent
        guard stamp != loadedStamp || (stamp == nil && lastError == nil) else { return lastError }
        loadedStamp = stamp
        do {
            current = try JSONDecoder().decode(Config.self, from: Data(contentsOf: url))
            lastError = nil
            hasLoaded = true
            log("config: loaded \(url.path) — \(current.summary)")
        } catch {
            // the admin's status line gets the short name, the log the full path
            let reason = stamp == nil ? "not readable" : Self.describe(error)
            lastError = "\(url.lastPathComponent): \(reason)"
            log("config: \(hasLoaded ? "kept the last good one" : "running on the built-in defaults") — \(url.path): \(reason)")
        }
        return lastError
    }
}
