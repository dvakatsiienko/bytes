// the settings file as the daemon reads it: the ranges, the names, the defaults, the engine table, and what a bad file says
import Foundation

@MainActor
enum ConfigTest {
    static func failures() -> Int { decodeFailures() + engineFailures() + fileFailures() + fallbackFailures() }

    static func file(chain: String = #"{"en":["kokoro"]}"#, engines: String = "{}", more: String = "") -> String {
        #"{"chain":\#(chain),"firstAudioMs":900,"engines":\#(engines)\#(more)}"#
    }

    static func answer(_ json: String, _ read: (Config) -> String) -> String {
        do { return read(try JSONDecoder().decode(Config.self, from: Data(json.utf8))) } catch { return "\(error)" }
    }

    static func decodeFailures() -> Int {
        let knobs = { (engine: String) in answer(file(engines: #"{"fish":\#(engine)}"#)) { config in
            let fish = config[.fish]
            return "\(fish.model ?? "-") \(fish.speed) \(fish.gain)"
        } }
        let voice = { (voices: String, lang: Lang) in answer(file(engines: #"{"fish":{"voice":\#(voices)}}"#)) { $0[.fish].voice(for: lang) ?? "-" } }
        let range = { (field: String, value: String) in "\(field) \(value) is out of range (\(field == "speed" ? "0.5–3" : "0–4"))" }
        let unknown = { (name: String) in "unknown name «\(name)» — engines: elevenlabs, kokoro, system, fish, gemini; languages: en, uk, ru" }
        return check("config decode", [
            ("an engine with nothing named", knobs("{}"), "- 1.0 1.0"),
            ("an engine with everything named", knobs(#"{"model":"s2","speed":1.5,"gain":2}"#), "s2 1.5 2.0"),
            ("a name an older daemon kept", knobs(#"{"oneOutput":true,"speed":1.5}"#), "- 1.5 1.0"),
            ("an engine that is not there", answer(file()) { "\($0[.gemini].speed) \($0[.gemini].gain) \($0[.gemini].voices)" }, "1.0 1.0 -"),
            ("the lowest speed", knobs(#"{"speed":0.5}"#), "- 0.5 1.0"),
            ("a speed under it", knobs(#"{"speed":0.49}"#), range("speed", "0.49")),
            ("the highest speed", knobs(#"{"speed":3}"#), "- 3.0 1.0"),
            ("a speed over it", knobs(#"{"speed":3.01}"#), range("speed", "3.01")),
            ("the lowest gain", knobs(#"{"gain":0}"#), "- 1.0 0.0"),
            ("a gain under it", knobs(#"{"gain":-0.01}"#), range("gain", "-0.01")),
            ("the highest gain", knobs(#"{"gain":4}"#), "- 1.0 4.0"),
            ("a gain over it", knobs(#"{"gain":4.01}"#), range("gain", "4.01")),
            ("a language's own voice", voice(#"{"en":"Jessica","*":"Sarah"}"#, .en), "Jessica"),
            ("a language with no voice of its own", voice(#"{"en":"Jessica","*":"Sarah"}"#, .uk), "Sarah"),
            ("a language no voice serves", voice(#"{"en":"Jessica"}"#, .uk), "-"),
            ("an unknown engine in a chain", answer(file(chain: #"{"en":["kokoro","koko"]}"#)) { "\($0.chain)" }, unknown("koko")),
            ("an unknown language", answer(file(chain: #"{"de":["kokoro"]}"#)) { "\($0.chain)" }, unknown("de")),
            ("an unknown engine in the engines", answer(file(engines: #"{"koko":{}}"#)) { $0.summary }, unknown("koko")),
            ("a chain keeps its order", answer(file(chain: #"{"uk":["fish","system","gemini"]}"#)) { $0.chain[.uk, default: []].map(\.rawValue).joined(separator: " ") }, "fish system gemini"),
            ("the pill's knobs, not named", answer(file()) { "\($0.meterGlideMs) \($0.meterFlowMs) \($0.firstAudioMs)" }, "30.0 40.0 900"),
            ("the pill's knobs, named", answer(file(more: #","meterGlideMs":0,"meterFlowMs":55"#)) { "\($0.meterGlideMs) \($0.meterFlowMs)" }, "0.0 55.0"),
        ])
    }

    static func engineFailures() -> Int {
        let names = { (holds: (Engine) -> Bool) in Engine.allCases.filter(holds).map(\.rawValue).joined(separator: " ") }
        return check("engine table", [
            ("cloud", names { $0.isCloud }, "elevenlabs fish gemini"),
            ("streams", names { $0.facts.streams }, "elevenlabs fish"),
            ("speaks english", names { $0.speaks(.en) }, "elevenlabs kokoro system fish gemini"),
            ("speaks ukrainian", names { $0.speaks(.uk) }, "elevenlabs system fish gemini"),
            ("speaks russian", names { $0.speaks(.ru) }, "elevenlabs system fish gemini"),
        ])
    }

    static func fileFailures() -> Int {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-config-\(ProcessInfo.processInfo.processIdentifier).json")
        defer { try? FileManager.default.removeItem(at: url) }
        var lines: [String] = []
        let settings = ConfigStore(url, log: { lines.append($0.replacingOccurrences(of: url.path, with: "PATH")) })
        let turn = {
            RunLoop.main.add(Timer(timeInterval: 0.001, repeats: false) { _ in }, forMode: .default)
            RunLoop.main.run(until: Date().addingTimeInterval(0.005))
        }
        var stamp = Date(timeIntervalSince1970: 1_000_000)
        // each save has a moment of its own, so the one stat sees it; a url keeps its stat until the run loop turns, as
        // it does between two presses
        let saved = { (json: String) -> String in
            stamp += 10
            try? Data(json.utf8).write(to: url)
            try? FileManager.default.setAttributes([.modificationDate: stamp], ofItemAtPath: url.path)
            turn()
            return (settings.refresh() ?? "ok") + " \(settings.current.firstAudioMs)"
        }
        let error = { (reason: String, inUse: Int) in "\(url.lastPathComponent): \(reason) \(inUse)" }
        var rows: [(name: String, got: String, want: String)] = []
        rows.append(("a bad file at start runs on the defaults", saved(#"{"firstAudioMs":900}"#), error("missing «chain»", 500)))
        rows.append(("its log line", lines.last ?? "-", "config: running on the built-in defaults — PATH: missing «chain»"))
        rows.append(("a good file", saved(file(engines: #"{"fish":{"gain":2}}"#)), "ok 900"))
        rows.append(("its log line", lines.last ?? "-", "config: loaded PATH — fish: voice -, speed 1.0, gain 2.0"))
        rows.append(("not json keeps the last good one", saved("{").hasPrefix("\(url.lastPathComponent): not valid json — ") ? "kept \(settings.current.firstAudioMs)" : "?", "kept 900"))
        rows.append(("the reason stays while the file does", settings.refresh()?.contains("not valid json") == true ? "stays" : "?", "stays"))
        rows.append(("a wrong type", saved(file(engines: #"{"fish":{"gain":"loud"}}"#)), error("«engines.fish.gain» has the wrong type", 900)))
        rows.append(("its log line", lines.last ?? "-", "config: kept the last good one — PATH: «engines.fish.gain» has the wrong type"))
        rows.append(("a null", saved(file(chain: "null")), error("«chain» has the wrong type", 900)))
        rows.append(("a missing key inside", saved(#"{"chain":{},"engines":{}}"#), error("missing «firstAudioMs»", 900)))
        rows.append(("out of range", saved(file(engines: #"{"fish":{"gain":9}}"#)), error("gain 9 is out of range (0–4)", 900)))
        rows.append(("a good one again clears the reason", saved(#"{"chain":{},"firstAudioMs":700,"engines":{}}"#), "ok 700"))
        try? Data(file().utf8).write(to: url)
        try? FileManager.default.setAttributes([.modificationDate: stamp], ofItemAtPath: url.path)
        turn()
        rows.append(("a file with the same moment is not read again", "\(settings.refresh() ?? "ok") \(settings.current.firstAudioMs)", "ok 700"))
        return check("config file", rows)
    }

    static func fallbackFailures() -> Int {
        let fallback = Config.fallback
        let chain = { (lang: Lang) in fallback.chain[lang, default: []].map(\.rawValue).joined(separator: " ") }
        return check("fallback", [
            ("english", chain(.en), "kokoro system"),
            ("ukrainian", chain(.uk), "system"),
            ("russian", chain(.ru), "system"),
            ("the engines", fallback.summary, "kokoro: voice -, speed 1.0, gain 1.9"),
            ("the knobs", "\(fallback.firstAudioMs) \(fallback.meterGlideMs) \(fallback.meterFlowMs)", "500 30.0 40.0"),
        ])
    }
}
