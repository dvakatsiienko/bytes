// dima's dictionary: whole words, after the cuts, never inside a cut or a link, never read again by a later rule
import Foundation

enum DictionaryTest {
    static func failures(_ golden: [Case]) -> Int {
        let say = { (text: String, entries: [Cleaner.Entry]) in normalize(text, .shipped, Cleaner(dictionary: entries)).map(\.text).joined(separator: " | ") }
        let cc = [Cleaner.Entry(word: "cc", say: "Claude Code")]
        var rows: [(name: String, got: String, want: String)] = [
            ("a word is said as its entry", say("ask cc now", cc), "ask Claude Code now"),
            ("a word inside a word is not", say("my account", cc), "my account"),
            ("case as written", say("CC and cc", cc), "CC and Claude Code"),
            ("any case when the entry says so", say("CC and cc", [Cleaner.Entry(word: "cc", say: "Claude Code", anyCase: true)]), "Claude Code and Claude Code"),
            ("never inside a file link", say("open file:///tmp/cc.md now", cc), "open a markdown file link now"),
            ("never inside a file link its rule left", normalize("open file:///tmp/cc.md now", .shipped, Cleaner(off: [.fileLinks], dictionary: cc)).map(\.text).joined(), "open file:///tmp/cc dot md now"),
            ("never inside a path", say("see ~/cc/notes.md", cc), "see notes dot md"),
            ("an entry that looks like an id is said as written", say("ship it", [Cleaner.Entry(word: "ship", say: "a1b2c3d4e5f6")]), "a1b2c3d4e5f6 it"),
            ("an entry is not spelled by the word lists", say("the api", [Cleaner.Entry(word: "api", say: "app eye")]), "the app eye"),
            ("an entry's own words are not read again", say("the gizmo and myGizmo", [Cleaner.Entry(word: "gizmo", say: "api")]), "the api and my Gizmo"),
            ("never inside the words a file link became", say("open file:///tmp/a.md now", [Cleaner.Entry(word: "file", say: "FILE")]), "open a markdown file link now"),
            ("never inside the leaf a path became", say("see ~/cc/notes.md", [Cleaner.Entry(word: "notes", say: "NOTES")]), "see notes dot md"),
            ("the longest word wins", say("claude code is code", [Cleaner.Entry(word: "code", say: "kode"), Cleaner.Entry(word: "claude code", say: "cc")]), "cc is kode"),
            ("a ukrainian word too", say("скажи кек", [Cleaner.Entry(word: "кек", say: "сміх")]), "скажи сміх"),
            ("a grabbed private-use unit is dropped", say("a\u{E000}b", cc), "ab"),
        ]
        // with the entry cc, every golden case without the word reads as it did
        for item in golden where item.off == nil && item.dictionary == nil && item.in.range(of: "(?<![\\p{L}\\p{N}_])cc(?![\\p{L}\\p{N}_])", options: .regularExpression) == nil {
            let got = normalize(item.in, .shipped, Cleaner(dictionary: cc), nextMarker: item.next).map { [$0.lang.rawValue, $0.text] }
            if got != item.out { rows.append(("golden with cc: \(item.in.prefix(40))", "\(got)", "\(item.out)")) }
        }
        rows.append(("never inside a span a rule rewrote", say("open server:8080", [Cleaner.Entry(word: "port", say: "harbour")]), "open server port 8080"))
        rows.append(("never inside a file name", say("see notes.md", [Cleaner.Entry(word: "notes", say: "NOTES")]), "see notes dot md"))
        rows.append(("an entry that says nothing is refused", refusal("x", say: " "), "it says nothing"))
        rows.append(("not at a word's end", say("xcc and ccx", cc), "xcc and ccx"))
        rows.append(("a mark ends no word", say("cafe\u{301} and cafe", [Cleaner.Entry(word: "cafe", say: "coffee")]), "cafe\u{301} and coffee"))
        rows.append(("words of one length in one order", Cleaner(dictionary: [Cleaner.Entry(word: "ab", say: "1"), Cleaner.Entry(word: "aa", say: "2")]).dictionary.map(\.word).joined(separator: " "), "ab aa"))
        for (word, why) in [("notes.md", "a file name"), ("docs/x", "a path"), ("3f9a2b1c4d", "an id"), ("…", "it holds no letter"), ("k8s", "a unit"), ("FRM-694", "a ticket id"),
                            ("5ms", "a unit"), ("v1.2", "a version"), ("https://x.y", "a link"), ("2026-11-26", "a date"), ("pid 42", "an id")] {
            rows.append(("«\(word)» is refused", refusal(word), why))
        }
        rows.append(("a word no rule takes is said", refusal("socket.io"), "loaded"))
        return check("dictionary", rows)
    }

    private static func refusal(_ word: String, say: String = "x") -> String {
        let json = #"{"chain":{},"firstAudioMs":900,"engines":{},"cleaner":{"dictionary":{"\#(word)":"\#(say)"}}}"#
        do {
            _ = try JSONDecoder().decode(Config.self, from: Data(json.utf8))
            return "loaded"
        } catch {
            return configReason(error).range(of: "a file name|a path|a link|an id|a unit|a ticket id|a version|a date|it holds no letter|it says nothing", options: .regularExpression).map { String(configReason(error)[$0]) } ?? configReason(error)
        }
    }
}
