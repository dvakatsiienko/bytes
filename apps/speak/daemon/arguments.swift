// the daemon's argv. its launchd job hands it every path it needs, so no source file names a repo:
//   --config <path>     config.json, required
//   --keys-run <path>   the script that runs a command with the api keys in its environment; none: no cloud keys
//   --engine <name>     a one-shot run through that engine only
// whatever is left is the text of a one-shot run; with none left, the process is the daemon.
// an unknown --word is refused, never spoken: a typo in the launchd job must not turn the daemon into a one-shot
struct Arguments: Equatable {
    var configPath: String
    var keysRunPath: String?
    var engine: String?
    var text: [String] = []

    static let usage = "usage: x-speak --config <config.json> [--keys-run <script>] [--engine <name>] [text …]"

    static func parse(_ argv: [String]) throws -> Arguments {
        var values: [String: String] = [:]
        var text: [String] = []
        var rest = argv[...]
        while let word = rest.popFirst() {
            guard ["--config", "--keys-run", "--engine"].contains(word) else {
                guard !word.hasPrefix("--") else { throw ArgumentsError.unknownFlag(word) }
                text.append(word)
                continue
            }
            guard let value = rest.popFirst(), !value.hasPrefix("--") else { throw ArgumentsError.missingValue(word) }
            values[word] = value
        }
        guard let configPath = values["--config"] else { throw ArgumentsError.missingConfig }
        guard values["--engine"] == nil || !text.isEmpty else { throw ArgumentsError.engineWithoutText }
        return Arguments(configPath: configPath, keysRunPath: values["--keys-run"], engine: values["--engine"], text: text)
    }
}

enum ArgumentsError: Error, Equatable, CustomStringConvertible {
    case missingConfig, missingValue(String), unknownFlag(String), engineWithoutText

    var description: String {
        switch self {
        case .missingConfig: "no --config: the daemon has no built-in config path"
        case .missingValue(let flag): "\(flag) needs a value"
        case .unknownFlag(let flag): "unknown flag \(flag)"
        case .engineWithoutText: "--engine is for a one-shot run: it needs text to speak"
        }
    }
}
