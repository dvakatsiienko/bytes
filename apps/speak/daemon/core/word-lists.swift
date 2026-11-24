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
        let names = try JSONDecoder().decode([String: Json].self, from: file).keys
        if let odd = names.first(where: { File.CodingKeys(rawValue: $0) == nil }) { throw WordListError.notAList(odd) }
        let added = try JSONDecoder().decode(File.self, from: file)
        let lowercased = { (new: [String: String]?) in Dictionary((new ?? [:]).map { ($0.lowercased(), $1) }) { _, last in last }.filter { !$0.key.isEmpty } }
        let newWords = lowercased(added.words), newLetters = (added.letters ?? []).map { $0.lowercased() }
        // a read asks for words of letters alone: any other would be taught and never said
        if let never = (newWords.keys + newLetters).first(where: { $0.contains { !("a"..."z").contains($0) } }) { throw WordListError.notAWord(never) }
        self = shipped
        letters.formUnion(newLetters)
        words = words.filter { !newLetters.contains($0.key) }.merging(newWords) { _, new in new }
        units.merge(lowercased(added.units)) { _, new in new }
        fileKinds.merge(lowercased(added.fileKinds)) { _, new in new }
        copyOnlyApps.formUnion(added.copyOnlyApps ?? [])
    }

    private struct File: Decodable {
        let letters: [String]?, words: [String: String]?, units: [String: String]?, fileKinds: [String: String]?, copyOnlyApps: [String]?

        enum CodingKeys: String, CodingKey { case letters, words, units, fileKinds, copyOnlyApps }
    }
}

enum WordListError: Error, CustomStringConvertible {
    case notAWord(String), notAList(String)

    var description: String {
        switch self {
        case .notAWord(let word): "a word is letters a–z alone, «\(word)» is not"
        case .notAList(let name): "no list is called «\(name)»"
        }
    }
}

@MainActor
final class WordListStore {
    private let url: URL
    private let write: (String) -> Void
    private var loadedStamp: Date?
    // asked again on each read, a change of its rights moves no stamp
    private var isUnread = false
    private var lists = WordLists.shipped

    init(_ url: URL, log write: @escaping (String) -> Void = log) {
        self.url = url
        self.write = write
    }

    // one stat a read, a parse only when the file changed; a bad edit logs one line and the last good lists stay
    var current: WordLists {
        let stamp = (try? FileManager.default.attributesOfItem(atPath: url.resolvingSymlinksInPath().path))?[.modificationDate] as? Date
        guard stamp != loadedStamp || isUnread else { return lists }
        let data = stamp == nil ? nil : try? Data(contentsOf: url)
        // one line for a file that stays as it is
        if stamp == loadedStamp, data == nil { return lists }
        loadedStamp = stamp
        isUnread = stamp != nil && data == nil
        do {
            lists = try data.map { try WordLists(over: .shipped, $0) } ?? (isUnread ? lists : .shipped)
            write(isUnread ? "word lists: kept the last good ones — \(url.path): not readable" : "word lists: \(data == nil ? "what ships" : "loaded \(url.path)")")
        } catch {
            write("word lists: kept the last good ones — \(url.path): \(configReason(error))")
        }
        return lists
    }
}
