// every place on this mac the daemon reads or writes, from one home folder
import Foundation

struct Paths {
    private let home: String

    init(home: String = NSHomeDirectory()) { self.home = home }

    // dima's knobs; the folder is this mac's own, outside every repo
    var settings: String { support + "/config.json" }
    // dima's words and apps over what ships
    var wordLists: String { support + "/word-lists.json" }
    var controlSocket: String { state + "/control.sock" }
    // the relaunch waits for this line (script/daemon-relaunch.sh)
    var startMark: String { state + "/start-mark" }
    var kokoroServer: String { home + "/.local/bin/mlx_audio.server" }
    // kokoro makes a logs/ folder in the one it starts in
    var kokoroFolder: String { state }
    var kokoroLog: String { state + "/kokoro.log" }

    private var support: String { home + "/Library/Application Support/speak" }
    private var state: String { home + "/.local/share/x-speak" }
}
