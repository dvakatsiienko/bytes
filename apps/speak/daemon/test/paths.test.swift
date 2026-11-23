// where the daemon looks, on a home that is nobody's
import Foundation

enum PathsTest {
    static func failures() -> Int {
        let paths = Paths(home: "/h")
        return check("paths", [
            ("the settings", paths.settings, "/h/Library/Application Support/speak/config.json"),
            ("the word lists", paths.wordLists, "/h/Library/Application Support/speak/word-lists"),
            ("the control socket", paths.controlSocket, "/h/.local/share/x-speak/control.sock"),
            ("kokoro's server", paths.kokoroServer, "/h/.local/bin/mlx_audio.server"),
            ("kokoro's folder", paths.kokoroFolder, "/h/.local/share/x-speak"),
            ("kokoro's log", paths.kokoroLog, "/h/.local/share/x-speak/kokoro.log"),
        ])
    }
}
