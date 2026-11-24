// the words and the apps a read treats their own way: what ships here, and dima's file over it
import Foundation

struct WordLists: Equatable {
    // said letter by letter
    var letters: Set<String> = ["api", "cli", "css", "html", "mcp", "npm", "pnpm", "pr", "sdk", "ssh", "tts", "ui", "url", "ux"]
    // said as another word; one that is in both is a word
    var words = ["json": "jason", "sql": "sequel", "yaml": "yammel"]
    // said in full after a number
    var units = ["gb": "gigabytes", "s": "seconds", "hz": "hertz", "kb": "kilobytes", "khz": "kilohertz", "mb": "megabytes", "ms": "milliseconds", "px": "pixels"]
    // what a file link's extension is called
    var fileKinds = ["htm": "html", "md": "markdown", "txt": "text"]
    // apps whose accessibility focus is a different element from the selection: Slack reports its message box, empty,
    // while the selected text sits in the message list (36 «nothing selected» presses, 2026-10-01)
    var copyOnlyApps: Set<String> = ["com.tinyspeck.slackmacgap"]

    static let shipped = WordLists()
}

extension WordLists {
    // a file names what it adds or says another way; the rest is what ships
    init(over shipped: WordLists, _ file: Data) throws {
        let added = try JSONDecoder().decode(File.self, from: file)
        let over = { (old: [String: String], new: [String: String]?) in
            old.merging((new ?? [:]).map { ($0.lowercased(), $1) }) { _, new in new }.filter { !$0.key.isEmpty }
        }
        self = shipped
        letters.formUnion((added.letters ?? []).map { $0.lowercased() })
        words = over(words, added.words)
        units = over(units, added.units)
        fileKinds = over(fileKinds, added.fileKinds)
        copyOnlyApps.formUnion(added.copyOnlyApps ?? [])
    }

    private struct File: Decodable {
        let letters: [String]?, words: [String: String]?, units: [String: String]?, fileKinds: [String: String]?, copyOnlyApps: [String]?
    }
}

@MainActor
final class WordListStore {
    private let url: URL
    private let write: (String) -> Void
    private var loadedStamp: Date?
    private var lists = WordLists.shipped

    init(_ url: URL, log write: @escaping (String) -> Void = log) {
        self.url = url
        self.write = write
    }

    // one stat a read, a parse only when the file changed; a bad edit logs one line and the last good lists stay
    var current: WordLists {
        let stamp = (try? FileManager.default.attributesOfItem(atPath: url.resolvingSymlinksInPath().path))?[.modificationDate] as? Date
        guard stamp != loadedStamp else { return lists }
        loadedStamp = stamp
        do {
            lists = try stamp == nil ? .shipped : WordLists(over: .shipped, Data(contentsOf: url))
            write("word lists: \(stamp == nil ? "what ships" : "loaded \(url.path)")")
        } catch {
            write("word lists: kept the last good ones — \(url.path): \(configReason(error))")
        }
        return lists
    }
}
