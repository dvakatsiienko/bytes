import Foundation

// a shell line's output, run by the script that puts the keys in its environment. 15 s: a run takes 0.9 s, and one on a
// dead network hangs for as long as it is dead
@Sendable
func runWithKeys(_ script: String, _ line: String) async throws -> String {
    // op run masks secrets in its child's stdout; the keys go straight into this process, never a log
    let environment = ProcessInfo.processInfo.environment.merging(["OP_RUN_NO_MASKING": "true"]) { $1 }
    return try await output(of: "/bin/sh", [script, "/bin/sh", "-c", line], environment: environment, within: .seconds(15))
}
