// where the daemon looks, on a home that is nobody's: the admin, the stash mod and the scripts look there too
import Foundation

enum PathsTest {
    static func failures() -> Int {
        let paths = Paths(home: "/h")
        let settings = { (text: [String]) in Arguments(configPath: "/c.json", text: text).settings(paths) }
        return check("paths", [
            ("the word lists", paths.wordLists, "/h/Library/Application Support/speak/word-lists.json"),
            ("the control socket", paths.controlSocket, "/h/.local/share/x-speak/control.sock"),
            ("the start mark", paths.startMark, "/h/.local/share/x-speak/start-mark"),
            ("the start mark's line", startMark(build: "ab12", at: Date(timeIntervalSince1970: 0)), "ok ab12 1970-01-01T00:00:00Z\n"),
            ("kokoro's server", paths.kokoroServer, "/h/.local/bin/mlx_audio.server"),
            ("kokoro's folder", paths.kokoroFolder, "/h/.local/share/x-speak"),
            ("kokoro's log", paths.kokoroLog, "/h/.local/share/x-speak/kokoro.log"),
            ("the daemon's settings, whatever --config names", settings([]), "/h/Library/Application Support/speak/config.json"),
            ("a one-shot's settings", settings(["hello"]), "/c.json"),
        ]) + logFailures()
    }

    // what a press grabbed is in the log: launchd opens the file for every user to read
    static func logFailures() -> Int {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-log-\(ProcessInfo.processInfo.processIdentifier)").path
        defer { try? FileManager.default.removeItem(atPath: file) }
        let rights = { (made: Int) -> String in
            FileManager.default.createFile(atPath: file, contents: Data("old".utf8), attributes: [.posixPermissions: made])
            let handle = FileHandle(forWritingAtPath: file)!
            ownerOnly(handle.fileDescriptor)
            let now = (try? FileManager.default.attributesOfItem(atPath: file))?[.posixPermissions] as? Int ?? 0
            return String(now, radix: 8) + " " + ((try? String(contentsOfFile: file, encoding: .utf8)) ?? "")
        }
        var terminal: Int32 = -1, screen: Int32 = -1
        openpty(&terminal, &screen, nil, nil, nil)
        defer { close(terminal); close(screen) }
        var before = stat(), after = stat()
        fstat(screen, &before)
        ownerOnly(screen)
        fstat(screen, &after)
        return check("log", [
            ("a log that was there for all to read", rights(0o644), "600 old"),
            ("one that is dima's already", rights(0o600), "600 old"),
            ("a terminal keeps its own", "\(after.st_mode)", "\(before.st_mode)"),
        ])
    }
}
