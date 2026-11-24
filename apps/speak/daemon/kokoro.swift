import Foundation

@MainActor
final class LiveKokoro: LocalServer {
    // :7385, clear of chords' worktree daemon on :7383
    nonisolated private static let url = URL(string: "http://127.0.0.1:7385")!
    private let paths: Paths
    private let voice: () -> String?
    private var process: Process?

    init(paths: Paths, voice: @escaping () -> String?) {
        self.paths = paths
        self.voice = voice
    }

    func start() throws {
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
        try server.run()
        process = server
    }

    func speakFirst() async { _ = try? await URLSession.shared.data(for: request("Ready.", voice: voice())) }

    nonisolated private func request(_ text: String, voice: String?) -> URLRequest {
        var request = URLRequest(url: Self.url.appending(path: "v1/audio/speech"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: [
            "input": text, "model": "mlx-community/Kokoro-82M-bf16", "response_format": "pcm", "voice": voice ?? "af_heart",
        ])
        return request
    }

    nonisolated func isReady() async -> Bool {
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
