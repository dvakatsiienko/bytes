import Foundation

@MainActor
final class KokoroProcess: LocalServer {
    private let paths: Paths
    private var process: Process?
    var isRunning: Bool { process?.isRunning == true }

    init(paths: Paths) { self.paths = paths }

    func start(with environment: [String: String]) throws {
        let server = Process()
        server.executableURL = URL(fileURLWithPath: paths.kokoroServer)
        server.arguments = ["--host", "127.0.0.1", "--port", String(Kokoro.port)]
        server.environment = ProcessInfo.processInfo.environment.merging(environment) { $1 }
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
}
