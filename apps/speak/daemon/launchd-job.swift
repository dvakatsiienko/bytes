// the launchd job this daemon is, and the binary it runs
import CryptoKit
import Foundation

struct LaunchdJob {
    // launchd names the job to its process
    let label = ProcessInfo.processInfo.environment["XPC_SERVICE_NAME"]
    // read at the start: a build replaces the file later
    let build = installedBuild()

    static func installedBuild() -> String? {
        guard let binary = Bundle.main.executableURL, let bytes = try? Data(contentsOf: binary) else { return nil }
        return SHA256.hash(data: bytes).map { String(format: "%02x", $0) }.joined()
    }

    // asked by a child: launchd ends this process, and the child has the time for the answer to leave first
    func restart() -> String? {
        guard let label else { return "launchd does not run this daemon" }
        let child = Process()
        child.executableURL = URL(fileURLWithPath: "/bin/sh")
        child.arguments = ["-c", "sleep 0.3; exec launchctl kickstart -k \"gui/$(id -u)/$1\"", "sh", label]
        do { try child.run() } catch { return "not restarted — \(error.localizedDescription)" }
        log("restart: asked of launchd")
        return nil
    }
}
