import Foundation

// a shell line's output, run by the script that puts the keys in its environment
@Sendable
func runWithKeys(_ script: String, _ line: String) async -> String {
    await Task.detached {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/sh")
        process.arguments = [script, "/bin/sh", "-c", line]
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
}
