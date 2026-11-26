// the cleaner's named rules, each on unless the settings' `cleaner` section turns it off; normalize.swift runs them in
// this order. a rule off keeps what it would cut or rewrite
import Foundation

enum CleanerRule: String, CaseIterable {
    case lists, codeBlocks, markdown, emoji, lineEnds
    case fileLinks, urls, ids, dates, addresses, ticketIds, versions, units, paths, codeNames, words
    case symbols
}

struct Cleaner: Decodable, Equatable {
    var off: Set<CleanerRule> = []

    func on(_ rule: CleanerRule) -> Bool { !off.contains(rule) }

    init(off: Set<CleanerRule> = []) { self.off = off }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        for (name, isOn) in try container.decodeIfPresent([String: Bool].self, forKey: .rules) ?? [:] {
            let rule = try Config.parse(name, CleanerRule.init)
            if !isOn { off.insert(rule) }
        }
    }

    enum CodingKeys: String, CodingKey, CaseIterable { case rules }
}
