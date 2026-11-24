// the control socket as contract/wire.schema.json names it: every op, field and reply there is driven through the
// daemon's own, so a name that moves on one side alone is red. the page's side is wire.test.ts
import Foundation

@MainActor
enum WireTest {
    static func failures(_ path: String) throws -> Int {
        let schema = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: path))) as? [String: Any] ?? [:]
        let defs = schema["$defs"] as? [String: [String: Any]] ?? [:]
        let requests = defs["request"] as? [String: [String: Any]] ?? [:]
        let replies = defs["reply"] as? [String: [String: Any]] ?? [:]
        let names = { (shape: [String: Any]?) in (shape?["properties"] as? [String: Any] ?? [:]).keys.sorted().joined(separator: " ") }
        let required = { (shape: [String: Any]?) in shape?["required"] as? [String] ?? [] }
        let states = (defs["health"]?["properties"] as? [String: [String: Any]])?["state"]?["enum"] as? [String] ?? []
        var rows: [(name: String, got: String, want: String)] = [
            ("the ops", requests.keys.sorted().joined(separator: " "), Op.allCases.map(\.rawValue).sorted().joined(separator: " ")),
            ("the states", states.sorted().joined(separator: " | "), Health.State.allCases.map(\.rawValue).sorted().joined(separator: " | ")),
        ]
        for (op, shape) in requests {
            let fields = (shape["properties"] as? [String: Any] ?? [:]).keys
            let named = samples.filter { fields.contains($0.key) }
            let whole = decoded(op, named)
            rows.append(("\(op): its name", whole.map { $0.op.rawValue } ?? "-", op))
            for field in fields {
                let without = decoded(op, named.filter { $0.key != field })
                rows.append(("\(op): \(field) is read", without == whole ? "no" : "yes", "yes"))
                rows.append(("\(op): \(field) may be left out", without == nil ? "no" : "yes", required(shape).contains(field) ? "no" : "yes"))
            }
            rows.append(("\(op): no other field is read", decoded(op, samples) == whole ? "none" : "one", "none"))
        }
        let saved = SavedSettings(config: .object([:]), version: "v", was: "v")
        let status = { (read: Int?, main: String?) in Reply.status(Status(engines: [:], isTrusted: true, isSpeaking: true, isPaused: false, read: read, settings: "at", main: main)) }
        let made: [String: (full: Reply, bare: Reply)] = [
            "ok": (.ok, .ok), "began": (.began(read: 1), .began(read: 1)), "settings": (.settings(saved), .settings(saved)), "voices": (.voices([]), .voices([])),
            "refused": (.refused(Refusal(error: "e", stale: true, main: "m")), .error("e")), "status": (status(1, "m"), status(nil, nil)),
        ]
        rows.append(("the replies", replies.keys.sorted().joined(separator: " "), made.keys.sorted().joined(separator: " ")))
        for (reply, sides) in made {
            rows.append(("\(reply): its keys", keys(sides.full), names(replies[reply])))
            rows.append(("\(reply): the keys it always has", keys(sides.bare), required(replies[reply]).sorted().joined(separator: " ")))
        }
        let entry = ((replies["voices"]?["properties"] as? [String: Any])?["engines"] as? [String: Any])?["items"] as? [String: Any]
        let voice = ((entry?["properties"] as? [String: Any])?["voices"] as? [String: Any])?["items"] as? [String: Any]
        let fields = { (shape: [String: Any]?) in shape?["properties"] as? [String: [String: Any]] ?? [:] }
        let known = Lang.allCases.map(\.rawValue).joined(separator: " ")
        rows.append(("an engine's languages", ((fields(entry)["languages"]?["items"] as? [String: Any])?["enum"] as? [String] ?? []).joined(separator: " "), known))
        rows.append(("a voice's languages", (fields(voice)["lang"]?["enum"] as? [String] ?? []).joined(separator: " "), known))
        rows.append(("an engine's keys", keys(CatalogueEntry(id: "i", label: "l", languages: [], voices: [])), names(entry)))
        rows.append(("a voice's keys", keys(Voice(id: "i", name: "n", lang: .en)), names(voice)))
        rows.append(("the keys a voice always has", keys(Voice(id: "i", name: "n")), required(voice).sorted().joined(separator: " ")))
        rows.append(("a health's keys", keys(Health(state: .live, until: "u", note: "n")), names(defs["health"])))
        rows.append(("the keys a health always has", keys(Health(state: .live)), required(defs["health"]).sorted().joined(separator: " ")))
        let any = #"{"a":[null,true,1,1.5,"x",{"b":[]}]}"#
        rows.append(("a setting the daemon does not know goes as it came", (try? JSONEncoder().encode(StoreTest.json(any))).map { String(decoding: $0, as: UTF8.self) } ?? "-", any))
        return check("wire", rows)
    }

    private static let samples: [String: String] = [
        "engine": #""fish""#, "voice": #""x""#, "on": "true", "text": #""Hi.""#, "settings": #"{"speed":2}"#, "patch": #"{"a":1}"#, "version": #""v""#,
        "glide": "30", "flow": "55", "seconds": "2",
    ]

    private static func decoded(_ op: String, _ fields: [String: String]) -> Request? {
        let pairs = fields.merging(["op": "\"\(op)\""]) { one, _ in one }.map { "\"\($0.key)\":\($0.value)" }
        return try? JSONDecoder().decode(Request.self, from: Data("{\(pairs.joined(separator: ","))}".utf8))
    }

    private static func keys(_ value: some Encodable) -> String {
        let object = (try? JSONEncoder().encode(value)).flatMap { try? JSONSerialization.jsonObject(with: $0) } as? [String: Any]
        return (object ?? [:]).keys.sorted().joined(separator: " ")
    }
}
