// the settings file as it stands, the keys the daemon does not decode included, and the layout it is printed in
import Foundation

enum Json: Equatable, Decodable {
    case null, bool(Bool), number(Double), string(String), array([Json]), object([String: Json])

    init(from decoder: Decoder) throws {
        let value = try decoder.singleValueContainer()
        if value.decodeNil() {
            self = .null
        } else if let bool = try? value.decode(Bool.self) {
            self = .bool(bool)
        } else if let number = try? value.decode(Double.self) {
            self = .number(number)
        } else if let string = try? value.decode(String.self) {
            self = .string(string)
        } else if let array = try? value.decode([Json].self) {
            self = .array(array)
        } else {
            self = .object(try value.decode([String: Json].self))
        }
    }

    subscript(key: String) -> Json? {
        guard case .object(let pairs) = self else { return nil }
        return pairs[key]
    }

    // a patch names only what changes: an object goes in key by key, null takes a key out, anything else replaces
    func patched(by patch: Json) -> Json {
        guard case .object(let changes) = patch else { return patch }
        var pairs: [String: Json] = [:]
        if case .object(let own) = self { pairs = own }
        for (key, change) in changes { pairs[key] = change == .null ? nil : (pairs[key] ?? .null).patched(by: change) }
        return .object(pairs)
    }

    // the keys two values differ in, as dotted paths
    func changes(to other: Json) -> [String] {
        guard self != other else { return [] }
        guard case .object(let before) = self, case .object(let after) = other else { return [""] }
        return Set(before.keys).union(after.keys).sorted().flatMap { key in
            (before[key] ?? .null).changes(to: after[key] ?? .null).map { $0.isEmpty ? key : "\(key).\($0)" }
        }
    }

    // as bytes' formatter prints it: sorted keys, an object open, a list on one line while it fits in 80
    func text(indent: String = "", lead: Int = 0, tail: Int = 0) -> String {
        let inner = indent + "  "
        switch self {
        case .null: return "null"
        case .bool(let bool): return "\(bool)"
        case .number(let number): return plain(number)
        case .string(let string): return Self.quoted(string)
        case .array(let items):
            let line = "[" + items.map { $0.text() }.joined(separator: ", ") + "]"
            if lead + line.count + tail <= 80, !line.contains("\n") { return line }
            return "[\n" + items.map { inner + $0.text(indent: inner, lead: inner.count) }.joined(separator: ",\n") + "\n\(indent)]"
        case .object(let pairs):
            if pairs.isEmpty { return "{}" }
            let last = pairs.keys.max()
            let lines = pairs.sorted { $0.key < $1.key }.map { key, value in
                let name = "\(inner)\(Self.quoted(key)): "
                return name + value.text(indent: inner, lead: name.count, tail: key == last ? 0 : 1)
            }
            return "{\n" + lines.joined(separator: ",\n") + "\n\(indent)}"
        }
    }

    // what JSONSerialization sends down the socket
    var any: Any {
        switch self {
        case .null: NSNull()
        case .bool(let bool): bool
        case .number(let number): number
        case .string(let string): string
        case .array(let items): items.map(\.any)
        case .object(let pairs): pairs.mapValues(\.any)
        }
    }

    private static func quoted(_ string: String) -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .withoutEscapingSlashes
        return (try? encoder.encode(string)).map { String(decoding: $0, as: UTF8.self) } ?? "\"\""
    }
}
