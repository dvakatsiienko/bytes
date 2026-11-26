// a text on its way to a voice that still knows where in the grabbed text each of its characters came from
import Foundation

struct SourcedText: Equatable {
    private(set) var text: String
    // the part of the grabbed text each utf-16 unit came from, never falling
    private var places: [Range<Int>]

    init(_ text: String) {
        self.text = text
        places = (0..<text.utf16.count).map { $0..<$0 + 1 }
    }

    private init(_ text: String, _ places: [Range<Int>]) {
        self.text = text
        self.places = places
    }

    // the part of the grabbed text it came from, in utf-16 units; empty for a text with nothing in it
    var source: Range<Int> {
        guard let first = places.first, let last = places.last else { return 0..<0 }
        return first.lowerBound..<last.upperBound
    }

    subscript(range: some RangeExpression<String.Index>) -> SourcedText {
        let bounds = range.relative(to: text)
        let units = NSRange(bounds, in: text)
        return SourcedText(String(text[bounds]), Array(places[units.location..<units.upperBound]))
    }

    static func + (one: SourcedText, other: SourcedText) -> SourcedText { SourcedText(one.text + other.text, one.places + other.places) }

    func trimmed(_ set: CharacterSet) -> SourcedText {
        let kept = text.unicodeScalars
        guard let from = kept.firstIndex(where: { !set.contains($0) }), let last = kept.lastIndex(where: { !set.contains($0) }) else { return SourcedText("") }
        return self[from...last]
    }

    func split(at mark: Character) -> [SourcedText] { text.split(separator: mark).map { self[$0.startIndex..<$0.endIndex] } }

    func inserting(_ string: String, at index: String.Index) -> SourcedText {
        var result = self[..<index]
        result.add(string, over: NSRange(index..<index, in: text), of: self)
        return result + self[index...]
    }

    // every match is handed to `replace` as [whole, group1, group2, …]; an unmatched group is ""
    func replacing(_ pattern: String, _ options: NSRegularExpression.Options = [], _ replace: ([String]) -> String) -> SourcedText {
        replacing(pattern, options) { match, units, result in
            let groups = (0..<match.numberOfRanges).map { match.range(at: $0).location == NSNotFound ? "" : units.substring(with: match.range(at: $0)) }
            result.add(replace(groups), over: match.range, of: self)
        }
    }

    // «$1 dot $2»: a group keeps its own places, the words between come from what stands before them, and one that ends
    // it takes what the match drops after it
    func replacing(_ pattern: String, _ template: String, _ options: NSRegularExpression.Options = []) -> SourcedText {
        let parts = template.split(separator: "$", omittingEmptySubsequences: false).map(String.init)
        let groups = parts.dropFirst().map { (number: $0.first!.wholeNumberValue!, rest: String($0.dropFirst())) }
        return replacing(pattern, options) { match, units, result in
            let before = groups.first.map { match.range(at: $0.number).location } ?? match.range.upperBound
            result.add(parts[0], over: NSRange(location: match.range.location, length: before == NSNotFound ? 0 : before - match.range.location), of: self)
            for group in groups {
                let range = match.range(at: group.number)
                let kept = range.location == NSNotFound ? NSRange(location: match.range.upperBound, length: 0) : range
                result.add(kept, of: self, units)
                result.add(group.rest, over: NSRange(location: kept.upperBound, length: 0), of: self)
            }
            if groups.last?.rest.isEmpty == true, let last = result.places.last {
                result.places[result.places.count - 1] = last.lowerBound..<places[match.range.upperBound - 1].upperBound
            }
        }
    }

    // each run of letters and marks between spaces: where it stands here and the part of the grabbed text it came from
    var words: [(said: Range<Int>, source: Range<Int>)] {
        let units = Array(text.utf16)
        var result: [(said: Range<Int>, source: Range<Int>)] = [], start: Int?
        for index in 0...units.count {
            let isSpace = index == units.count || Unicode.Scalar(units[index]).map(CharacterSet.whitespacesAndNewlines.contains) == true
            if !isSpace, start == nil { start = index }
            guard isSpace, let from = start else { continue }
            result.append((from..<index, source(of: NSRange(location: from, length: index - from))))
            start = nil
        }
        return result
    }

    // the parts of the grabbed text a pattern's matches came from
    func sources(of pattern: String, _ options: NSRegularExpression.Options = []) -> [Range<Int>] {
        let units = text as NSString
        return try! NSRegularExpression(pattern: pattern, options: options).matches(in: text, range: NSRange(location: 0, length: units.length)).map { source(of: $0.range) }
    }

    // a match `make` answers for becomes that string, every unit of it from the whole match; nil leaves the match
    func replacingWhole(_ pattern: String, _ options: NSRegularExpression.Options = [], _ make: (_ match: String, _ source: Range<Int>) -> String?) -> SourcedText {
        replacing(pattern, options) { match, units, result in
            let from = source(of: match.range)
            guard let string = make(units.substring(with: match.range), from) else { return result.add(match.range, of: self, units) }
            result.text += string
            result.places += repeatElement(from, count: string.utf16.count)
        }
    }

    private func source(of range: NSRange) -> Range<Int> {
        let part = places[range.location..<range.upperBound]
        guard let first = part.first, let last = part.last else { return 0..<0 }
        return first.lowerBound..<last.upperBound
    }

    private func replacing(_ pattern: String, _ options: NSRegularExpression.Options, _ replacement: (NSTextCheckingResult, NSString, inout SourcedText) -> Void) -> SourcedText {
        let matches = try! NSRegularExpression(pattern: pattern, options: options).matches(in: text, range: NSRange(text.startIndex..., in: text))
        guard !matches.isEmpty else { return self }
        let units = text as NSString
        var result = SourcedText(""), from = 0
        for match in matches {
            result.add(NSRange(location: from, length: match.range.location - from), of: self, units)
            replacement(match, units, &result)
            from = match.range.upperBound
        }
        result.add(NSRange(location: from, length: places.count - from), of: self, units)
        return result
    }

    private mutating func add(_ range: NSRange, of other: SourcedText, _ units: NSString) {
        text += units.substring(with: range)
        places += other.places[range.location..<range.upperBound]
    }

    // a replacement's first unit comes from the match's first, its last from the last; an insertion from what stands before it
    private mutating func add(_ string: String, over match: NSRange, of other: SourcedText) {
        let count = string.utf16.count
        if count == 0 { return }
        text += string
        guard match.length > 0 else {
            places += repeatElement(other.places[..<match.location].last ?? other.places.first ?? 0..<0, count: count)
            return
        }
        // the spaces around it take none of it
        let before = string.utf16.prefix { $0 == 32 }.count, words = count - before - string.utf16.reversed().prefix { $0 == 32 }.count
        places += (0..<count).map { other.places[match.location + (words < 2 ? 0 : min(max($0 - before, 0), words - 1) * (match.length - 1) / (words - 1))] }
    }
}
