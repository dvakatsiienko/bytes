// whose settings a process reads, on a home that is nobody's
import Foundation

enum PathsTest {
    static func failures() -> Int {
        let paths = Paths(home: "/h")
        let settings = { (text: [String]) in Arguments(configPath: "/c.json", text: text).settings(paths) }
        return check("paths", [
            ("the daemon's settings, whatever --config names", settings([]), "/h/Library/Application Support/speak/config.json"),
            ("a one-shot's settings", settings(["hello"]), "/c.json"),
        ])
    }
}
