// the cloud engines' keys: the keychain's first, then those of the script that runs a command with them in its environment
import Foundation

@MainActor
final class Keys {
    // a shell line's output, with the keys in its environment; none: no cloud keys
    private let run: (@Sendable (String) async throws -> String)?
    private let keychain: (@Sendable (Engine) -> String?)?
    private let now: () -> Date
    private let write: (String) -> Void
    private var values: [Engine: String] = [:]
    private var loadedAt: Date?
    private var isLoading = false
    private let names: [(Engine, String)]

    init(
        run: (@Sendable (String) async throws -> String)?, keychain: (@Sendable (Engine) -> String?)? = nil,
        names: [(Engine, String)] = Engine.allCases.compactMap { engine in engine.facts.keyName.map { (engine, $0) } },
        now: @escaping () -> Date = { Date() }, log write: @escaping (String) -> Void
    ) {
        self.run = run
        self.keychain = keychain
        self.names = names
        self.now = now
        self.write = write
    }

    subscript(engine: Engine) -> String? { values[engine] }

    // one op-run per daemon start (~0.8 s), never on the hot path; a key pasted later is picked up within a minute
    func load() async {
        guard run != nil || keychain != nil, !isLoading else { return }
        isLoading = true
        defer {
            isLoading = false
            loadedAt = now()
        }
        let engines = names.map(\.0)
        // the keychain may wait on a lock, so never on main
        let own = await Task.detached { [keychain] in engines.map { keychain?($0) } }.value
        var inKeychain: Set<Engine> = []
        for case (let engine, let value?) in zip(engines, own) {
            values[engine] = value
            inKeychain.insert(engine)
        }
        if let run, inKeychain.count < engines.count {
            do {
                let output = try await run("printf '%s\\0' " + names.map { "\"${\($0.1)}\"" }.joined(separator: " "))
                for (value, engine) in zip(output.split(separator: "\0", omittingEmptySubsequences: false), engines) where !value.isEmpty && !inKeychain.contains(engine) {
                    values[engine] = String(value)
                }
            } catch {
                write("keys: not loaded — \(error)")
                if inKeychain.isEmpty { return }
            }
        }
        write("keys: " + engines.map { "\($0.rawValue) \(values[$0] == nil ? "missing" : inKeychain.contains($0) ? "keychain" : "ok")" }.joined(separator: ", "))
    }

    func reloadIfMissing() {
        guard values.count < names.count, let loadedAt, now().timeIntervalSince(loadedAt) > 60 else { return }
        Task { await load() }
    }
}
