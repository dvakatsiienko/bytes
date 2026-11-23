// where the daemon looks, on a home that is nobody's
import Foundation

enum PathsTest {
    static func failures() -> Int {
        let paths = Paths(home: "/h")
        let settings = { (text: [String]) in Arguments(configPath: "/c.json", text: text).settings(paths) }
        return check("paths", [
            ("the settings", paths.settings, "/h/Library/Application Support/speak/config.json"),
            ("the daemon's settings, whatever --config names", settings([]), "/h/Library/Application Support/speak/config.json"),
            ("a one-shot's settings", settings(["hello"]), "/c.json"),
            ("the word lists", paths.wordLists, "/h/Library/Application Support/speak/word-lists"),
            ("the control socket", paths.controlSocket, "/h/.local/share/x-speak/control.sock"),
            ("kokoro's server", paths.kokoroServer, "/h/.local/bin/mlx_audio.server"),
            ("kokoro's folder", paths.kokoroFolder, "/h/.local/share/x-speak"),
            ("kokoro's log", paths.kokoroLog, "/h/.local/share/x-speak/kokoro.log"),
        ])
    }
}
