// dima's words and apps over what ships: the file, read again after an edit
import Foundation

enum WordListsTest {
    @MainActor
    static func failures() throws -> Int {
        let file = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-words-\(ProcessInfo.processInfo.processIdentifier).json")
        defer { try? FileManager.default.removeItem(at: file) }
        var logged: [String] = []
        let store = WordListStore(file, log: { logged.append($0.replacingOccurrences(of: file.path, with: "FILE")) })
        var edits = 0
        // what a text says once the file holds these, and what was logged
        let after = { (json: String?) throws -> (String) -> String in
            logged = []
            edits += 1
            if let json {
                try Data(json.utf8).write(to: file)
                try FileManager.default.setAttributes([.modificationDate: Date(timeIntervalSince1970: Double(edits))], ofItemAtPath: file.path)
            } else {
                try? FileManager.default.removeItem(at: file)
            }
            return { text in normalize(text, store.current).map(\.text).joined(separator: " ") }
        }
        var rows: [(name: String, got: String, want: String)] = []
        let shipped = try after(nil)
        rows.append(("no file", shipped("the API took 5ms in Speechify"), "the A P I took 5 milliseconds in Speechify"))
        rows.append(("no file is no news", logged.joined(), ""))
        let named = try after(#"{"words":{"Speechify":"speech if I","api":"appy","GitHub":"git hub one","json":"jay son"},"letters":["RTK","sql","GraphQL"],"units":{"TB":"terabytes","ms":"millis","%":"percent","kb/s":"kilobytes a second"},"fileKinds":{"py":"python"},"copyOnlyApps":["com.x"]}"#)
        rows.append(("a word, one over the letters that ship", named("speechify and the API"), "speech if I and the appy"))
        rows.append(("a word and a unit over what ships", named("json in 5ms"), "jay son in 5 millis"))
        rows.append(("letters, beside what ships", named("rtk ux GraphQL"), "R T K U X G R A P H Q L"))
        rows.append(("letters over a word that ships", named("sql"), "S Q L"))
        rows.append(("a word with a capital inside", named("GitHub, GitLab"), "git hub one, Git Lab"))
        rows.append(("a unit that goes on past another", named("5 kb/s, 5 kb"), "5 kilobytes a second, 5 kilobytes"))
        rows.append(("a unit that is a sign", named("50% off, 5 %"), "50 percent off, 5 percent"))
        rows.append(("a unit, beside what ships", named("2 tb, 5s"), "2 terabytes, 5 seconds"))
        rows.append(("a file's kind", named("file:///a/b.py"), "a python file link"))
        rows.append(("an app, beside what ships", store.current.copyOnlyApps.sorted().joined(separator: " "), "com.tinyspeck.slackmacgap com.x"))
        rows.append(("it is read once", logged.joined(separator: " | "), "word lists: loaded FILE"))
        let broken = try after(#"{"words":["a"]}"#)
        rows.append(("a bad edit keeps the last good lists", broken("rtk") + broken("api"), "R T Kappy"))
        rows.append(("a bad edit says so once", logged.joined(separator: " | "), "word lists: kept the last good ones — FILE: «words» has the wrong type"))
        rows.append(("a word that can never match is a bad edit", try { _ = try after(#"{"words":{"k8s":"kates"}}"#)(""); return logged.joined() }(), "word lists: kept the last good ones — FILE: a word is letters a–z alone, «k8s» is not"))
        rows.append(("letters that can never match too", try { _ = try after(#"{"letters":["c++"]}"#)(""); return logged.joined() }(), "word lists: kept the last good ones — FILE: a word is letters a–z alone, «c++» is not"))
        rows.append(("the file taken out: what ships", try after(nil)("rtk API"), "rtk A P I"))
        return check("word list", rows)
    }
}
