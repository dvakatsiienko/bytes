// the cleaner's named rules, each on unless the settings' `cleaner` section turns it off; normalize.swift runs them in
// this order. a rule off keeps what it would cut or rewrite. the dictionary is dima's words, said his way on every engine
import Foundation

enum CleanerRule: String, CaseIterable {
    case lists, codeBlocks, markdown, emoji, lineEnds
    case fileLinks, urls, ids, dates, addresses, ticketIds, versions, units, paths, codeNames, words
    case symbols
}

struct Cleaner: Decodable, Equatable {
    var off: Set<CleanerRule> = []
    // the longest word first, so «claude code» wins over «code»
    var dictionary: [Entry] = []

    struct Entry: Equatable {
        let word: String
        let say: String
        var anyCase = false
    }

    func on(_ rule: CleanerRule) -> Bool { !off.contains(rule) }

    init(off: Set<CleanerRule> = [], dictionary: [Entry] = []) {
        self.off = off
        self.dictionary = dictionary.sorted { ($0.word.count, $0.word) > ($1.word.count, $1.word) }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        var off = Set<CleanerRule>()
        for (name, isOn) in try container.decodeIfPresent([String: Bool].self, forKey: .rules) ?? [:] {
            guard let rule = CleanerRule(rawValue: name) else { throw ConfigError.unknownRule(name) }
            if !isOn { off.insert(rule) }
        }
        let words = try container.decodeIfPresent([String: Said].self, forKey: .dictionary) ?? [:]
        self.init(off: off, dictionary: try words.map { word, said in
            if let why = refusal(word) ?? (said.say.allSatisfy(\.isWhitespace) ? "it says nothing" : nil) { throw ConfigError.refusedWord(word, why) }
            return Entry(word: word, say: said.say, anyCase: said.anyCase)
        })
    }

    enum CodingKeys: String, CodingKey, CaseIterable { case rules, dictionary }

    // an entry is its spoken text, or {"say": …, "anyCase": true} to match the word in any case
    private struct Said: Decodable {
        var say: String
        var anyCase = false

        init(from decoder: Decoder) throws {
            if let say = try? decoder.singleValueContainer().decode(String.self) {
                self.say = say
                return
            }
            let container = try decoder.container(keyedBy: CodingKeys.self)
            say = try container.decode(String.self, forKey: .say)
            anyCase = try container.decodeIfPresent(Bool.self, forKey: .anyCase) ?? false
        }

        enum CodingKeys: String, CodingKey { case say, anyCase }
    }
}

// a rule before the dictionary rewrites a link, an id, a path, a unit and their kin, and the dictionary never reads
// inside what one takes, so an entry holding one would never be said: the same patterns refuse it
private func refusal(_ word: String) -> String? {
    if !word.contains(where: { $0.isLetter || $0.isNumber }) { return "it holds no letter" }
    let kind = Cut.all(.shipped).first { SourcedText(word).sources(of: $0.0, $0.1).isEmpty == false }?.kind
    return kind.map { "\($0) is cut before the dictionary reads" }
}
