// a text on its way to a voice that still knows where in the grabbed text each of its characters came from
import Foundation

struct SourcedText: Equatable {
    private(set) var text: String
    // one offset into the grabbed text for each utf-16 unit, never falling
    private var offsets: [Int]

    init(_ text: String) {
        self.text = text
        offsets = Array(0..<text.utf16.count)
    }

    private init(_ text: String, _ offsets: [Int]) {
        self.text = text
        self.offsets = offsets
    }

    // the part of the grabbed text it came from, in utf-16 units; empty for a text with nothing in it
    var source: Range<Int> {
        guard let first = offsets.first, let last = offsets.last else { return 0..<0 }
        return first..<last + 1
    }

    subscript(range: some RangeExpression<String.Index>) -> SourcedText {
        let bounds = range.relative(to: text)
        let units = NSRange(bounds, in: text)
        return SourcedText(String(text[bounds]), Array(offsets[units.location..<units.upperBound]))
    }

    static func + (one: SourcedText, other: SourcedText) -> SourcedText { SourcedText(one.text + other.text, one.offsets + other.offsets) }

    func trimmed(_ set: CharacterSet) -> SourcedText {
        let kept = text.unicodeScalars
        guard let from = kept.firstIndex(where: { !set.contains($0) }), let last = kept.lastIndex(where: { !set.contains($0) }) else { return SourcedText("") }
        return self[from...last]
    }

    func split(at mark: Character) -> [SourcedText] { text.split(separator: mark).map { self[$0.startIndex..<$0.endIndex] } }

    func inserting(_ string: String, at index: String.Index) -> SourcedText {
        var result = self
        result.offsets.insert(contentsOf: spread(string, over: NSRange(index..<index, in: text)), at: NSRange(index..<index, in: text).location)
        result.text.insert(contentsOf: string, at: index)
        return result
    }

    // every match is handed to `replace` as [whole, group1, group2, …]; an unmatched group is ""
    func replacing(_ pattern: String, _ options: NSRegularExpression.Options = [], _ replace: ([String]) -> String) -> SourcedText {
        replacing(pattern, options) { _, match in
            replace((0..<match.numberOfRanges).map { i in Range(match.range(at: i), in: text).map { String(text[$0]) } ?? "" })
        }
    }

    func replacing(_ pattern: String, _ template: String, _ options: NSRegularExpression.Options = []) -> SourcedText {
        replacing(pattern, options) { regex, match in regex.replacementString(for: match, in: text, offset: 0, template: template) }
    }

    private func replacing(_ pattern: String, _ options: NSRegularExpression.Options, _ replacement: (NSRegularExpression, NSTextCheckingResult) -> String) -> SourcedText {
        let regex = try! NSRegularExpression(pattern: pattern, options: options)
        let matches = regex.matches(in: text, range: NSRange(text.startIndex..., in: text))
        guard !matches.isEmpty else { return self }
        let units = text as NSString
        var result = "", kept: [Int] = [], from = 0
        for match in matches {
            let string = replacement(regex, match)
            result += units.substring(with: NSRange(location: from, length: match.range.location - from)) + string
            kept += offsets[from..<match.range.location] + spread(string, over: match.range)
            from = match.range.upperBound
        }
        return SourcedText(result + units.substring(from: from), kept + offsets[from...])
    }

    // a replacement's first unit comes from the match's first, its last from the last; an insertion from what stands before it
    private func spread(_ string: String, over match: NSRange) -> [Int] {
        let count = string.utf16.count
        guard match.length > 0 else { return Array(repeating: offsets[..<match.location].last ?? offsets.first ?? 0, count: count) }
        return (0..<count).map { offsets[match.location + (count == 1 ? 0 : $0 * (match.length - 1) / (count - 1))] }
    }
}
