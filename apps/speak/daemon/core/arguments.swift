// the daemon's argv. its launchd job hands it every path it needs, so no source file names a repo:
//   --config <path>     required. the settings a one-shot speaks with; the daemon's are at their one place (paths.swift),
//                       and it only says so when this names another
//   --keys-run <path>   the script that runs a command with the api keys in its environment; none: no cloud keys
//   --engine <name>     a one-shot run through that engine only
//   --pill <state>      one of the pill's fixed states, shown with no sound, no key and no socket; with --print-model
//                       printed as json, and nothing is shown
// whatever is left is the text of a one-shot run; with none left, the process is the daemon.
// an unknown -word is refused, never spoken: a typo in the launchd job must not turn the daemon into a one-shot
struct Arguments: Equatable {
    var configPath: String
    var keysRunPath: String?
    var engine: String?
    var text: [String] = []
    var pill: PillFixture?
    var printsModel = false

    func settings(_ paths: Paths) -> String { text.isEmpty ? paths.settings : configPath }

    // a one-shot leaves when it has spoken, so a server it started would be nobody's
    var mayStartKokoro: Bool { text.isEmpty && pill == nil }

    static let usage = "usage: x-speak --config <config.json> [--keys-run <script>] [--engine <name>] [text …]\n       x-speak --pill <state> [--print-model]"

    static func parse(_ argv: [String]) throws -> Arguments {
        var values: [String: String] = [:]
        var text: [String] = []
        var printsModel = false
        var rest = argv[...]
        while let word = rest.popFirst() {
            if word == "--print-model" {
                printsModel = true
                continue
            }
            guard ["--config", "--keys-run", "--engine", "--pill"].contains(word) else {
                guard !word.hasPrefix("-") else { throw ArgumentsError.unknownFlag(word) }
                text.append(word)
                continue
            }
            guard let value = rest.popFirst(), !value.isEmpty, !value.hasPrefix("-") else { throw ArgumentsError.missingValue(word) }
            values[word] = value
        }
        if let name = values["--pill"] {
            guard let pill = PillFixture(rawValue: name) else { throw ArgumentsError.unknownPill(name) }
            guard values.count == 1, text.isEmpty else { throw ArgumentsError.pillWithMore }
            return Arguments(configPath: "", pill: pill, printsModel: printsModel)
        }
        guard !printsModel else { throw ArgumentsError.modelWithoutPill }
        guard let configPath = values["--config"] else { throw ArgumentsError.missingConfig }
        guard values["--engine"] == nil || !text.isEmpty else { throw ArgumentsError.engineWithoutText }
        return Arguments(configPath: configPath, keysRunPath: values["--keys-run"], engine: values["--engine"], text: text)
    }
}

enum ArgumentsError: Error, Equatable, CustomStringConvertible {
    case missingConfig, missingValue(String), unknownFlag(String), engineWithoutText
    case unknownPill(String), pillWithMore, modelWithoutPill

    var description: String {
        switch self {
        case .missingConfig: "no --config: the daemon has no built-in config path"
        case .missingValue(let flag): "\(flag) needs a value"
        case .unknownFlag(let flag): "unknown flag \(flag)"
        case .engineWithoutText: "--engine is for a one-shot run: it needs text to speak"
        case .unknownPill(let name): "unknown pill «\(name)» — one of: \(PillFixture.allCases.map(\.rawValue).joined(separator: ", "))"
        case .pillWithMore: "--pill takes no text and no other flag but --print-model"
        case .modelWithoutPill: "--print-model is for --pill <state>"
        }
    }
}
