// the settings file's one writer, over a scratch file in the shape of dima's own: what lands, what is refused, and that
// a refusal leaves every byte
import Foundation

@MainActor
enum StoreTest {
    static func failures() -> Int { patchFailures() + layoutFailures() + saveFailures() + heartFailures() }

    static func json(_ text: String) -> Json { (try? JSONDecoder().decode(Json.self, from: Data(text.utf8))) ?? .string("not json") }

    static func patchFailures() -> Int {
        let patched = { (of: String, by: String) in json(of).patched(by: json(by)).text().split(whereSeparator: \.isWhitespace).joined() }
        let changes = { (from: String, to: String) in json(from).changes(to: json(to)).joined(separator: " ") }
        return check("patch", [
            ("a key changes alone", patched(#"{"a":1,"b":2}"#, #"{"a":3}"#), #"{"a":3,"b":2}"#),
            ("a key inside changes alone", patched(#"{"a":{"b":1,"c":2}}"#, #"{"a":{"b":3}}"#), #"{"a":{"b":3,"c":2}}"#),
            ("a list is replaced whole", patched(#"{"a":["x","y"]}"#, #"{"a":["y"]}"#), #"{"a":["y"]}"#),
            ("null takes a key out", patched(#"{"a":1,"b":2}"#, #"{"a":null}"#), #"{"b":2}"#),
            ("null inside a new object adds nothing", patched("{}", #"{"a":{"b":null}}"#), #"{"a":{}}"#),
            ("a key that is not there is added", patched("{}", #"{"a":{"b":true}}"#), #"{"a":{"b":true}}"#),
            ("an object takes a word's place", patched(#"{"a":"x"}"#, #"{"a":{"b":1}}"#), #"{"a":{"b":1}}"#),
            ("true is not one", patched(#"{"a":1}"#, #"{"a":true}"#), #"{"a":true}"#),
            ("the changes are named by path", changes(#"{"a":{"b":1,"c":2},"d":[1]}"#, #"{"a":{"b":3},"d":[1]}"#), "a.b a.c"),
            ("a change of a list is the list's", changes(#"{"a":[1]}"#, #"{"a":[1,2]}"#), "a"),
        ])
    }

    static func layoutFailures() -> Int {
        let fits = { (count: Int, more: String) in json(#"{"a":["\#(String(repeating: "x", count: count))"]\#(more)}"#).text().contains("[\n") ? "open" : "one line" }
        return check("layout", [
            ("the file's own shape prints as it was", json(shape).text() + "\n", shape),
            ("a list that fills the line", fits(69, ""), "one line"),
            ("a list one over it", fits(70, ""), "open"),
            ("a list and its comma that fill the line", fits(68, #","b":1"#), "one line"),
            ("a comma over it", fits(69, #","b":1"#), "open"),
            ("an empty object and list", json(#"{"a":{},"b":[]}"#).text(), "{\n  \"a\": {},\n  \"b\": []\n}"),
            ("words keep their letters", json(#"{"a":"її / \"q\" \\ \n"}"#).text(), "{\n  \"a\": \"її / \\\"q\\\" \\\\ \\n\"\n}"),
            ("numbers keep their form", json(#"{"a":1,"b":1.2,"c":2.7,"d":0.05,"e":-3}"#).text(), "{\n  \"a\": 1,\n  \"b\": 1.2,\n  \"c\": 2.7,\n  \"d\": 0.05,\n  \"e\": -3\n}"),
        ])
    }

    static func saveFailures() -> Int {
        let file = Scratch()
        defer { file.remove() }
        let store = file.store
        // each row starts from the same bytes; the answer is the reason, or the lines the file gained and lost
        let save = { (patch: String?, version: String?) -> String in
            file.put(shape)
            _ = try? store.saved()
            do { _ = try store.save(patch.map(json), over: version) } catch { return "\(error)" + (file.text == shape ? "" : ", and the file moved") }
            return file.diff(from: shape)
        }
        file.put(shape)
        store.refresh()
        let at = (try? store.saved().version) ?? "?"
        let refused = "SETTINGS: "
        var rows: [(name: String, got: String, want: String)] = [
            ("one number", save(#"{"firstAudioMs":700}"#, at), "-  \"firstAudioMs\": 900, +  \"firstAudioMs\": 700,"),
            ("the daemon runs on it at once", "\(store.current.firstAudioMs)", "700"),
            ("one engine's number, its hearts kept", save(#"{"engines":{"kokoro":{"gain":2.5}}}"#, at), "-      \"gain\": 2, +      \"gain\": 2.5,"),
            ("a chain's new order", save(#"{"chain":{"ru":["system","elevenlabs"]}}"#, at), "-    \"ru\": [\"elevenlabs\", \"system\"], +    \"ru\": [\"system\", \"elevenlabs\"],"),
            ("a voice taken out", save(#"{"engines":{"elevenlabs":{"voice":{"en":null}}}}"#, at), "-        \"*\": \"EXAVITQu4vr4xnSDxMaL\", -        \"en\": \"cgSgspJ2msm6clMCkdW9\" +        \"*\": \"EXAVITQu4vr4xnSDxMaL\""),
            ("the value it has", save(#"{"firstAudioMs":900}"#, at), ""),
            ("out of range", save(#"{"firstAudioMs":0}"#, at), refused + "firstAudioMs 0 is out of range (100–3000)"),
            ("an unknown engine", save(#"{"chain":{"en":["koko"]}}"#, at), refused + "unknown name «koko» — engines: elevenlabs, fish, kokoro, system, gemini; languages: en, uk, ru"),
            ("a wrong type", save(#"{"engines":{"fish":{"gain":"loud"}}}"#, at), refused + "«engines.fish.gain» has the wrong type"),
            ("a required key taken out", save(#"{"chain":null}"#, at), refused + "missing «chain»"),
            ("no patch", save(nil, at), "the save names no change"),
            ("an empty patch", save("{}", at), "the save names no change"),
            ("a patch that is a list", save("[]", at), "the save names no change"),
            ("no version", save(#"{"firstAudioMs":700}"#, nil), "a save needs the version it edits"),
            ("a version of another file", save(#"{"firstAudioMs":700}"#, "0"), "the settings changed since this page read them"),
        ]
        file.put(shape)
        let older = (try? store.saved().version) ?? "?"
        let newer = try? store.save(json(#"{"firstAudioMs":700}"#), over: older).version
        let after = file.text
        rows.append(("the reply's version is the file's", newer ?? "?", (try? store.saved().version) ?? "-"))
        rows.append(("a page opened before that save", (try? store.save(json(#"{"meterFlowMs":1}"#), over: older)) == nil && file.text == after ? "refused" : "written", "refused"))
        file.put(after + "\n")
        rows.append(("a hand edit since", (try? store.save(json(#"{"meterFlowMs":1}"#), over: newer)) == nil ? "refused" : "written", "refused"))
        file.put("{")
        rows.append(("a file that is not json: the page reads why", String(reason { try store.saved() }.prefix(27)), refused + "not valid json — "))
        rows.append(("a file that is not json is not written over", reason { try store.save(json(#"{"meterFlowMs":1}"#), over: newer) } + " " + file.text, "the settings changed since this page read them {"))
        file.put(shape.replacingOccurrences(of: "900", with: "9"))
        rows.append(("a file out of range: the page reads why", reason { try store.saved() }, refused + "firstAudioMs 9 is out of range (100–3000)"))
        file.remove()
        rows.append(("no file: the page reads why", reason { try store.saved() }, refused + "not readable"))
        rows.append(("no file: a save makes none", reason { try store.save(json(#"{"meterFlowMs":1}"#), over: at) } + " \(file.text)", refused + "not readable "))
        file.put(shape)
        chmod(file.folder.path, 0o500)
        rows.append(("a folder it cannot write", reason { try store.save(json(#"{"meterFlowMs":1}"#), over: at) }.hasPrefix("not written — ") && file.text == shape ? "said, and whole" : "?", "said, and whole"))
        chmod(file.folder.path, 0o700)
        file.lines = []
        _ = try? store.save(json(#"{"meterFlowMs":70}"#), over: at)
        rows.append(("a save of the value it has is no write", file.lines.joined(), ""))
        _ = try? store.save(json(#"{"engines":{"system":{"voice":{"en":"Samantha"}}},"meterFlowMs":1}"#), over: at)
        rows.append(("the log names the keys a save changed", file.lines.first ?? "-", "config: saved engines.system.voice, meterFlowMs"))
        rows.append(("a save is a load", String(file.lines.dropFirst().joined().prefix(26)), "config: loaded SETTINGS — "))
        let edited = file.text.replacingOccurrences(of: "\"meterFlowMs\": 1", with: "\"meterFlowMs\": 2")
        rows.append(("the next press reads the file once more", "\(store.refresh() ?? "ok") \(file.lines.count) \(store.refresh() ?? "ok") \(file.lines.count)", "ok 3 ok 3"))
        _ = try? store.save(json(#"{"meterFlowMs":1.5}"#), over: store.saved().version)
        file.putInTheSameMoment(edited)
        store.refresh()
        rows.append(("a hand edit in the moment of a save is seen", "\(store.current.meterFlowMs)", "2.0"))
        file.link()
        _ = try? store.save(json(#"{"meterFlowMs":3}"#), over: store.saved().version)
        rows.append(("a linked file stays a link, and its target is written", "\(file.isLink) \(file.text.contains("\"meterFlowMs\": 3"))", "true true"))
        store.refresh()
        file.editTarget(file.text.replacingOccurrences(of: "\"meterFlowMs\": 3", with: "\"meterFlowMs\": 4"))
        store.refresh()
        rows.append(("a hand edit of the target is seen", "\(store.current.meterFlowMs)", "4.0"))
        file.unlink()
        file.put(shape.replacingOccurrences(of: "900", with: "800"))
        rows.append(("a hand edit in the same turn is seen", "\(store.refresh() ?? "ok") \(store.current.firstAudioMs)", "ok 800"))
        return check("save", rows)
    }

    static func heartFailures() -> Int {
        let file = Scratch()
        defer { file.remove() }
        let store = file.store
        let heart = { (engine: String?, voice: String?, isOn: Bool?) -> String in
            file.put(shape)
            let why = reason { try store.heart(engine: engine, voice: voice, isOn: isOn) }
            return why.isEmpty ? file.diff(from: shape) : why + (file.text == shape ? "" : ", and the file moved")
        }
        let heartless = "a heart needs an engine it knows, a voice, and on or off"
        var rows: [(name: String, got: String, want: String)] = [
            ("on", heart("fish", "x", true), #"-      "favourites": ["933563129e564b19a115bedd57b7406a"], +      "favourites": ["933563129e564b19a115bedd57b7406a", "x"],"#),
            ("off", heart("kokoro", "af_bella", false), #"-      "favourites": [ -        "af_heart", -        "af_bella", -        "af_jessica", -        "af_nova", -        "af_alloy" -      ], +      "favourites": ["af_heart", "af_jessica", "af_nova", "af_alloy"],"#),
            ("on again changes nothing", heart("kokoro", "af_bella", true), ""),
            ("the first of an engine", heart("gemini", "Kore", true), #"+      "favourites": ["Kore"],"#),
            ("an unknown engine", heart("koko", "x", true), heartless),
            ("no engine", heart(nil, "x", true), heartless),
            ("no voice", heart("fish", nil, true), heartless),
            ("an empty voice", heart("fish", "", true), heartless),
            ("neither on nor off", heart("fish", "x", nil), heartless),
        ]
        file.put(shape)
        let older = (try? store.saved().version) ?? "?"
        let first = try? store.heart(engine: "elevenlabs", voice: "Lily", isOn: true)
        let second = try? store.heart(engine: "elevenlabs", voice: "Laura", isOn: true)
        rows.append(("two in a row both land", store.current[.elevenlabs].favourites.suffix(2).joined(separator: " "), "Lily Laura"))
        rows.append(("the reply names the file it went over", "\(first?.was == older) \(second?.was == first?.version)", "true true"))
        file.put("{")
        rows.append(("a file that is not json is left", reason { try store.heart(engine: "fish", voice: "x", isOn: true) }.hasPrefix("SETTINGS: not valid json") ? file.text : "?", "{"))
        return check("heart", rows)
    }

    static func reason(_ ask: () throws -> SavedSettings) -> String {
        do { _ = try ask() } catch { return "\(error)" }
        return ""
    }

    // dima's own file at slice 2: its hearts, its keys only the page reads, its layout
    static let shape = """
    {
      "chain": {
        "en": ["kokoro", "fish", "system", "elevenlabs"],
        "ru": ["elevenlabs", "system"],
        "uk": ["elevenlabs", "system"]
      },
      "engines": {
        "elevenlabs": {
          "favourites": [
            "cgSgspJ2msm6clMCkdW9",
            "EXAVITQu4vr4xnSDxMaL",
            "FGY2WhTYpPnrIDTdsKH5"
          ],
          "gain": 1.2,
          "model": "eleven_v4_turbo",
          "speed": 1,
          "voice": {
            "*": "EXAVITQu4vr4xnSDxMaL",
            "en": "cgSgspJ2msm6clMCkdW9"
          }
        },
        "fish": {
          "favourites": ["933563129e564b19a115bedd57b7406a"],
          "gain": 2.7,
          "model": "s2.1-pro-free",
          "speed": 1,
          "voice": {
            "*": "933563129e564b19a115bedd57b7406a"
          }
        },
        "gemini": {
          "gain": 1,
          "model": "gemini-3.8-flash-tts",
          "voice": {
            "*": "Kore"
          }
        },
        "kokoro": {
          "favourites": [
            "af_heart",
            "af_bella",
            "af_jessica",
            "af_nova",
            "af_alloy"
          ],
          "gain": 2,
          "speed": 1,
          "voice": {
            "*": "af_heart",
            "en": "af_heart"
          }
        },
        "system": {
          "speed": 1
        }
      },
      "firstAudioMs": 900,
      "meterFlowMs": 70,
      "meterGlideMs": 27
    }
    """ + "\n"
}

@MainActor
private final class Scratch {
    let folder = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-store-\(UUID().uuidString)")
    var lines: [String] = []
    private var stamp = Date(timeIntervalSince1970: 1_000_000)
    private var url: URL { folder.appendingPathComponent("SETTINGS") }
    private(set) lazy var store = ConfigStore(url, log: { [unowned self] in lines.append($0.replacingOccurrences(of: url.path, with: "SETTINGS")) })
    var text: String { (try? String(contentsOf: url, encoding: .utf8)) ?? "" }

    // each edit by hand has a moment of its own
    func put(_ text: String) {
        stamp += 10
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        try? Data(text.utf8).write(to: url)
        try? FileManager.default.setAttributes([.modificationDate: stamp], ofItemAtPath: url.path)
    }

    func putInTheSameMoment(_ text: String) {
        let moment = (try? FileManager.default.attributesOfItem(atPath: url.path))?[.modificationDate] as? Date
        try? Data(text.utf8).write(to: url)
        if let moment { try? FileManager.default.setAttributes([.modificationDate: moment], ofItemAtPath: url.path) }
    }

    private var target: URL { folder.appendingPathComponent("TARGET") }
    var isLink: Bool { (try? FileManager.default.destinationOfSymbolicLink(atPath: url.path)) != nil }
    func link() {
        try? FileManager.default.moveItem(at: url, to: target)
        try? FileManager.default.createSymbolicLink(at: url, withDestinationURL: target)
    }
    func editTarget(_ text: String) {
        stamp += 10
        try? Data(text.utf8).write(to: target)
        try? FileManager.default.setAttributes([.modificationDate: stamp], ofItemAtPath: target.path)
    }
    func unlink() {
        try? FileManager.default.removeItem(at: url)
        try? FileManager.default.moveItem(at: target, to: url)
    }

    func diff(from before: String) -> String {
        let old = before.components(separatedBy: "\n"), new = text.components(separatedBy: "\n")
        let change = new.difference(from: old)
        let gone = change.removals.map { if case .remove(_, let line, _) = $0 { "-" + line } else { "" } }
        let come = change.insertions.map { if case .insert(_, let line, _) = $0 { "+" + line } else { "" } }
        return (gone + come).joined(separator: " ")
    }

    func remove() { try? FileManager.default.removeItem(at: folder) }
}
