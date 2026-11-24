import Foundation

@MainActor
final class KokoroServer {
    // :7385, clear of chords' worktree daemon on :7383
    nonisolated private static let url = URL(string: "http://127.0.0.1:7385")!
    private let paths: Paths
    private let mayStart: Bool
    private let voice: () -> String?
    // a finished warm-up
    var onWarm: () -> Void = {}
    private var process: Process?
    private var isWarming = false

    init(paths: Paths, mayStart: Bool, voice: @escaping () -> String?) {
        self.paths = paths
        self.mayStart = mayStart
        self.voice = voice
    }

    // one warm-up at a time
    func warm() async {
        guard !isWarming else { return }
        isWarming = true
        defer { isWarming = false }
        if await isReady() { return }
        guard mayStart else { return }
        let server = Process()
        server.executableURL = URL(fileURLWithPath: paths.kokoroServer)
        server.arguments = ["--host", "127.0.0.1", "--port", String(Self.url.port ?? 7385)]
        // launchd starts us in /, read-only, and the server makes a logs/ dir in its working directory
        server.currentDirectoryURL = URL(fileURLWithPath: paths.kokoroFolder)
        // its own log, beside the daemon's: a server that dies at start says why here
        FileManager.default.createFile(atPath: paths.kokoroLog, contents: nil)
        let logFile = FileHandle(forWritingAtPath: paths.kokoroLog)
        server.standardOutput = logFile ?? FileHandle.nullDevice
        server.standardError = logFile ?? FileHandle.nullDevice
        server.terminationHandler = { process in log("kokoro: server exited, status \(process.terminationStatus)") }
        do {
            try server.run()
        } catch {
            log("kokoro: server did not start — \(error)")
            return
        }
        process = server
        for _ in 0..<240 where !(await isReady()) { try? await Task.sleep(for: .milliseconds(250)) }
        guard await isReady() else {
            log("kokoro: server not answering after 60 s")
            return
        }
        _ = try? await URLSession.shared.data(for: request("Ready.", voice: voice()))
        onWarm()
        log("kokoro: warm")
    }

    nonisolated private func request(_ text: String, voice: String?) -> URLRequest {
        var request = URLRequest(url: Self.url.appending(path: "v1/audio/speech"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: [
            "input": text, "model": "mlx-community/Kokoro-82M-bf16", "response_format": "pcm", "voice": voice ?? "af_heart",
        ])
        return request
    }

    nonisolated private func isReady() async -> Bool {
        var request = URLRequest(url: Self.url.appending(path: "docs"))
        request.timeoutInterval = 1
        return ((try? await URLSession.shared.data(for: request))?.1 as? HTTPURLResponse)?.statusCode == 200
    }

    nonisolated func pcm(_ text: String, voice: String?) async throws -> Data {
        let (data, response) = try await URLSession.shared.data(for: request(text, voice: voice))
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else { throw EngineError.status(status) }
        return data
    }
}
