import Foundation

@MainActor
final class Keys {
    private let run: String?
    private var values: [Engine: String] = [:]
    private var loadedAt: Date?

    // `run` is the script that runs a command with the keys in its environment; none: no cloud keys
    init(run: String?) { self.run = run }

    subscript(engine: Engine) -> String? { values[engine] }

    // one op-run per daemon start (~0.8 s), never on the hot path; a key pasted later is picked up within a minute
    func load() async {
        guard let keysRun = run else { return }
        loadedAt = Date()
        let names: [(Engine, String)] = [(.elevenlabs, "ELEVENLABS_API_KEY"), (.fish, "FISH_API_KEY"), (.gemini, "GEMINI_API_KEY")]
        let printf = "printf '%s\\0%s\\0%s' " + names.map { "\"$\($0.1)\"" }.joined(separator: " ")
        let output: String = await Task.detached {
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/bin/sh")
            process.arguments = [keysRun, "/bin/sh", "-c", printf]
            // op run masks secrets in its child's stdout; the keys go straight into this process, never a log
            process.environment = ProcessInfo.processInfo.environment.merging(["OP_RUN_NO_MASKING": "true"]) { $1 }
            let pipe = Pipe()
            process.standardOutput = pipe
            process.standardError = FileHandle.nullDevice
            try? process.run()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            process.waitUntilExit()
            return String(decoding: data, as: UTF8.self)
        }.value
        for (value, (engine, _)) in zip(output.split(separator: "\0", omittingEmptySubsequences: false), names) where !value.isEmpty {
            values[engine] = String(value)
        }
        log("keys: " + names.map { "\($0.0.rawValue) \(values[$0.0] == nil ? "missing" : "ok")" }.joined(separator: ", "))
    }

    func reloadIfMissing() {
        guard values.count < 3, let loadedAt, Date().timeIntervalSince(loadedAt) > 60 else { return }
        Task { await load() }
    }
}
