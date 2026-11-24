// the cloud engines' keys, from the script that runs a command with them in its environment
import Foundation

@MainActor
final class Keys {
    // a shell line's output, with the keys in its environment; none: no cloud keys
    private let run: (@Sendable (String) async -> String)?
    private let now: () -> Date
    private let write: (String) -> Void
    private var values: [Engine: String] = [:]
    private var loadedAt: Date?

    init(run: (@Sendable (String) async -> String)?, now: @escaping () -> Date = { Date() }, log write: @escaping (String) -> Void) {
        self.run = run
        self.now = now
        self.write = write
    }

    subscript(engine: Engine) -> String? { values[engine] }

    // one op-run per daemon start (~0.8 s), never on the hot path; a key pasted later is picked up within a minute
    func load() async {
        guard let run else { return }
        loadedAt = now()
        let names: [(Engine, String)] = [(.elevenlabs, "ELEVENLABS_API_KEY"), (.fish, "FISH_API_KEY"), (.gemini, "GEMINI_API_KEY")]
        let output = await run("printf '%s\\0%s\\0%s' " + names.map { "\"$\($0.1)\"" }.joined(separator: " "))
        for (value, (engine, _)) in zip(output.split(separator: "\0", omittingEmptySubsequences: false), names) where !value.isEmpty {
            values[engine] = String(value)
        }
        write("keys: " + names.map { "\($0.0.rawValue) \(values[$0.0] == nil ? "missing" : "ok")" }.joined(separator: ", "))
    }

    func reloadIfMissing() {
        guard values.count < 3, let loadedAt, now().timeIntervalSince(loadedAt) > 60 else { return }
        Task { await load() }
    }
}
