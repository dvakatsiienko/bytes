// the cloud engines' keys, from the script that runs a command with them in its environment
import Foundation

@MainActor
final class Keys {
    // a shell line's output, with the keys in its environment; none: no cloud keys
    private let run: (@Sendable (String) async throws -> String)?
    private let now: () -> Date
    private let write: (String) -> Void
    private var values: [Engine: String] = [:]
    private var loadedAt: Date?
    private var isLoading = false
    private let names = Engine.allCases.compactMap { engine in engine.facts.keyName.map { (engine, $0) } }

    init(run: (@Sendable (String) async throws -> String)?, now: @escaping () -> Date = { Date() }, log write: @escaping (String) -> Void) {
        self.run = run
        self.now = now
        self.write = write
    }

    subscript(engine: Engine) -> String? { values[engine] }

    // one op-run per daemon start (~0.8 s), never on the hot path; a key pasted later is picked up within a minute
    func load() async {
        guard let run, !isLoading else { return }
        isLoading = true
        defer {
            isLoading = false
            loadedAt = now()
        }
        let output: String
        do {
            output = try await run("printf '%s\\0' " + names.map { "\"${\($0.1)}\"" }.joined(separator: " "))
        } catch {
            return write("keys: not loaded — \(error)")
        }
        for (value, (engine, _)) in zip(output.split(separator: "\0", omittingEmptySubsequences: false), names) where !value.isEmpty {
            values[engine] = String(value)
        }
        write("keys: " + names.map { "\($0.0.rawValue) \(values[$0.0] == nil ? "missing" : "ok")" }.joined(separator: ", "))
    }

    func reloadIfMissing() {
        guard values.count < names.count, let loadedAt, now().timeIntervalSince(loadedAt) > 60 else { return }
        Task { await load() }
    }
}
