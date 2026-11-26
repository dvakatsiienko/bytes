// the settings file as contract/config.schema.json names it: every name, bound and default there is driven through the
// decoder, so the two cannot drift. the page reads the same file
import Foundation

enum SchemaTest {
    static func failures(_ path: String) throws -> Int {
        let schema = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: path))) as? [String: Any] ?? [:]
        let defs = schema["$defs"] as? [String: [String: Any]] ?? [:]
        let top = schema["properties"] as? [String: [String: Any]] ?? [:]
        let engine = defs["settings"]?["properties"] as? [String: [String: Any]] ?? [:]
        let names = { (of: [String: Any]?) in ((of?["propertyNames"] as? [String: Any] ?? of)?["enum"] as? [String] ?? []).sorted().joined(separator: " ") }
        var rows: [(name: String, got: String, want: String)] = [
            ("the settings' names", top.keys.sorted().joined(separator: " "), Config.CodingKeys.allCases.map(\.rawValue).sorted().joined(separator: " ")),
            ("an engine's names", engine.keys.sorted().joined(separator: " "), EngineConfig.CodingKeys.allCases.map(\.rawValue).sorted().joined(separator: " ")),
            ("the languages", names(top["chain"]), Lang.allCases.map(\.rawValue).sorted().joined(separator: " ")),
            ("a voice's languages", names(engine["voice"]), "* " + names(top["chain"])),
            ("the cleaner's names", (top["cleaner"]?["properties"] as? [String: Any] ?? [:]).keys.sorted().joined(separator: " "), Cleaner.CodingKeys.allCases.map(\.rawValue).joined(separator: " ")),
            ("the cleaner's rules", (((top["cleaner"]?["properties"] as? [String: Any])?["rules"] as? [String: Any])?["properties"] as? [String: Any] ?? [:]).keys.sorted().joined(separator: " "), CleanerRule.allCases.map(\.rawValue).sorted().joined(separator: " ")),
            ("a rule off is off", cleaner(#"{"rules":{"paths":false,"ids":true}}"#), "paths"),
            ("no cleaner section: every rule on", cleaner(nil), ""),
            ("a rule's name is one it knows", answer(#"{"chain":{},"firstAudioMs":900,"engines":{},"cleaner":{"rules":{"emojis":false}}}"#), "unknown name «emojis» — engines: elevenlabs, kokoro, system, fish, gemini; languages: en, uk, ru"),
        ]
        for key in schema["required"] as? [String] ?? [] {
            rows.append(("\(key) is required", answer(without: key), "missing «\(key)»"))
        }
        for (key, rule) in top.merging(engine, uniquingKeysWith: { one, _ in one }) {
            guard let low = rule["minimum"] as? Double, let high = rule["maximum"] as? Double else { continue }
            let step = rule["type"] as? String == "integer" ? 1 : 0.01
            let place: (Double) -> String = { engine[key] == nil ? json(top: key, $0) : json(engine: key, $0) }
            let range = "(\(plain(low))–\(plain(high)))"
            rows.append(("\(key) at its lowest", value(key, place(low)), plain(low)))
            rows.append(("\(key) at its highest", value(key, place(high)), plain(high)))
            rows.append(("\(key) under its lowest", value(key, place(low - step)), "\(key) \(plain(low - step)) is out of range \(range)"))
            rows.append(("\(key) over its highest", value(key, place(high + step)), "\(key) \(plain(high + step)) is out of range \(range)"))
            if let preset = rule["default"] as? Double { rows.append(("\(key) not named", value(key, json()), plain(preset))) }
        }
        rows.append(("an integer is not a half", value("firstAudioMs", json(top: "firstAudioMs", 900.5)), "«firstAudioMs» has the wrong type"))
        rows.append(("favourites are words", answer(#"{"chain":{},"firstAudioMs":900,"engines":{"fish":{"favourites":[1]}}}"#), "«engines.fish.favourites.Index 0» has the wrong type"))
        rows.append(("a voice's language is one it knows", answer(#"{"chain":{},"firstAudioMs":900,"engines":{"fish":{"voice":{"de":"x"}}}}"#), "unknown name «de» — engines: elevenlabs, kokoro, system, fish, gemini; languages: en, uk, ru"))
        return check("schema", rows)
    }

    private static func json(top key: String, _ value: Double) -> String { json([key: value], engine: [:]) }
    private static func json(engine key: String, _ value: Double) -> String { json([:], engine: [key: value]) }
    private static func json(_ top: [String: Double] = [:], engine: [String: Double] = [:]) -> String {
        let named = top.merging(["firstAudioMs": 900]) { one, _ in one }
        let pairs = { (of: [String: Double]) in of.map { "\"\($0.key)\":\(plain($0.value))" }.joined(separator: ",") }
        return "{\"chain\":{},\(pairs(named)),\"engines\":{\"fish\":{\(pairs(engine))}}}"
    }

    private static func answer(without key: String) -> String {
        answer("{" + [("chain", "{}"), ("engines", "{}"), ("firstAudioMs", "900")].filter { $0.0 != key }.map { "\"\($0.0)\":\($0.1)" }.joined(separator: ",") + "}")
    }

    private static func answer(_ json: String) -> String { value("chain", json) }

    // the rules a settings file turns off, by name
    private static func cleaner(_ section: String?) -> String {
        let json = #"{"chain":{},"firstAudioMs":900,"engines":{}"# + (section.map { #","cleaner":"# + $0 } ?? "") + "}"
        do { return try JSONDecoder().decode(Config.self, from: Data(json.utf8)).cleaner.off.map(\.rawValue).sorted().joined(separator: " ") } catch { return configReason(error) }
    }

    private static func value(_ key: String, _ json: String) -> String {
        do {
            let config = try JSONDecoder().decode(Config.self, from: Data(json.utf8))
            let known = [
                "firstAudioMs": Double(config.firstAudioMs), "meterGlideMs": config.meterGlideMs, "meterFlowMs": config.meterFlowMs, "volume": config.volume,
                "speed": config[.fish].speed, "gain": config[.fish].gain,
            ]
            return known[key].map(plain) ?? "ok"
        } catch {
            return configReason(error)
        }
    }
}
