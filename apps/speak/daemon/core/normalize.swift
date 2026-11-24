// voices read prose well and tech text badly: ids, versions, paths, code and symbols come out as
// «vee zero three eighty-five» or a spelled url. no engine fixes this for us (FRM-269 research),
// so every engine is fed text rewritten here first. golden.json is the contract.
import Foundation

enum Lang: String, Codable, CaseIterable { case en, uk, ru }

struct Run: Equatable {
    var lang: Lang
    var spoken: SourcedText
    var text: String { spoken.text }

    init(lang: Lang, spoken: SourcedText) {
        self.lang = lang
        self.spoken = spoken
    }

    init(lang: Lang, text: String) { self.init(lang: lang, spoken: SourcedText(text)) }
}

private let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

private func spell(_ letters: String) -> String { letters.uppercased().map(String.init).joined(separator: " ") }

private func stripMarkdown(_ text: SourcedText) -> SourcedText {
    var t = text
    t = t.replacing("```[\\s\\S]*?```", " code block. ")
    t = t.replacing("!\\[[^\\]]*\\]\\([^)]*\\)", "")
    t = t.replacing("\\[([^\\]]+)\\]\\([^)]*\\)", "$1")
    t = t.replacing("^\\s{0,3}#{1,6}\\s+", "", .anchorsMatchLines)
    t = t.replacing("^\\s*[-*+]\\s+", "", .anchorsMatchLines)
    // a numbered line says its number, then a short pause: «1. merge» → «1: merge», read «one: merge»
    t = t.replacing("^\\s*(\\d{1,2})\\.\\s+", "$1: ", .anchorsMatchLines)
    t = t.replacing("^\\s*>\\s?", "", .anchorsMatchLines)
    t = t.replacing("(\\*\\*|__|~~|`)", "")
    t = t.replacing("(^|\\s)[*_]([^*_\\n]+)[*_](?=\\s|[.,!?]|$)", "$1$2")
    // ➡️ is an arrow before it is a pictograph: it pauses like «→» instead of vanishing
    t = t.replacing("\\x{27A1}\\x{FE0F}?", " → ")
    // pictographs, skin tones, flags, keycaps, tag sequences and the joiners that glue them
    t = t.replacing("[\\p{Extended_Pictographic}\\p{Emoji_Modifier}\\p{Regional_Indicator}\\x{FE0E}\\x{FE0F}\\x{200D}\\x{20E3}\\x{E0020}-\\x{E007F}]", "")
    // bullets and geometric shapes: the Claude app hands nested list markers over as «■», read as «black square»
    t = t.replacing("[\\x{2022}\\x{2023}\\x{2043}\\x{25A0}-\\x{25FF}\\x{2605}\\x{2606}]", "")
    // a line that ends bare ends a sentence: several lines read as one run-on otherwise (dima: «it sounds like a single sentence»)
    // a mark that already pauses, an opener or a joining sign ends none, and a line of signs alone is none
    return t.replacing("(?<!\\s)(?=\\h*\\R)(?<=[\\p{L}\\p{N}][^\\p{L}\\p{N}\\v]{0,40})(?<![.!?…;:,]|[.!?…][»”\"'’)*\\]]{1,2})(?<![({\\[«“‘„<→⇒·|&=\\\\\\-–—]|[-=]>)\\h*\\R", ".\n")
}

private func rewriteLatin(_ text: SourcedText, _ lists: WordLists) -> SourcedText {
    var t = text
    // ids carry nothing a listener can use: a file link names its kind, a hash, a uuid, a long token or a pid number is cut
    t = t.replacing("\\bfile://\\S*?(?:\\.(\\w+))?(?=[.,;:!?)]*(?:\\s|$))", .caseInsensitive) { g in
        let kind = lists.fileKinds[g[1].lowercased()] ?? g[1].lowercased()
        guard let first = kind.first else { return "a file link" }
        // «an html», «a pdf», «a markdown»: a kind read letter by letter takes its article from the letter's name
        let isSpelled = lists.letters.contains(kind) || !kind.contains(where: "aeiou".contains)
        return ((isSpelled ? "aefhilmnorsx" : "aeiou").contains(first) ? "an " : "a ") + kind + " file link"
    }
    t = t.replacing("\\bhttps?://(?:www\\.)?([^/\\s),;]+)\\S*?(?=[.,;:!?)]*(?:\\s|$))", "$1", .caseInsensitive)
    t = t.replacing("\\b[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}\\b", "an id")
    t = t.replacing("\\b(pid)\\b\\s*[:=]?\\s*\\d+", "pid", .caseInsensitive)
    // two letters and two digits at least, so «1e10000» and «deadbeef» stay words; a «#» in front is a colour
    t = t.replacing("(?<![#\\w])(?=(?:[0-9a-f]*\\d){2})(?=(?:[0-9a-f]*[a-f]){2})(?:[0-9a-f]{7,12}|[0-9a-f]{40})\\b", "a commit")
    // six digits at least, so a type name like «ISO8601DateFormatter» stays a name
    t = t.replacing("\\b(?=(?:[A-Za-z]*\\d){6})(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{16,}\\b", "an id")
    t = t.replacing("\\b(\\d{4})-(\\d{2})-(\\d{2})\\b") { g in
        guard let month = Int(g[2]), (1...12).contains(month), let day = Int(g[3]) else { return g[0] }
        return "\(months[month - 1]) \(day), \(g[1])"
    }
    t = t.replacing("\\b127\\.0\\.0\\.1\\b", "localhost")
    t = t.replacing("\\b(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\b", "$1 dot $2 dot $3 dot $4")
    t = t.replacing("\\b([A-Za-z0-9][\\w.-]*):(\\d{2,5})\\b", "$1 port $2")
    t = t.replacing("\\b([A-Z]{2,6})-(\\d+)\\b") { g in "\(spell(g[1])) \(g[2])" }
    t = t.replacing("\\bv?(\\d+(?:\\.\\d+){1,3})\\b") { g in
        let parts = g[1].split(separator: ".")
        if g[0].hasPrefix("v") { return "version " + parts.joined(separator: " point ") }
        return parts.count > 2 ? parts.joined(separator: " point ") : g[0]
    }
    let units = lists.units.keys.sorted { $0.count > $1.count }.map(NSRegularExpression.escapedPattern).joined(separator: "|")
    t = t.replacing("(\\d)\\s?(\(units))(?!\\w)", .caseInsensitive) { g in "\(g[1]) \(lists.units[g[2].lowercased()] ?? g[2])" }
    // a path says only its last part; a bare «audio/video» is two words, not a path
    t = t.replacing("(?:~|\\.{1,2})?/?(?:[\\w.-]+/)+[\\w.-]*") { g in
        // the dot a line end put after a folder is not a part of its path
        let stop = g[0].last == "." && g[0].dropLast().last == "/" ? "." : "", path = g[0].dropLast(stop.count)
        let parts = path.split(separator: "/").filter { !["~", ".", ".."].contains($0) }
        // a file name has a word before its extension («exa.md»), a version has digits («24.x»); a sentence end the
        // line-break rule put on the leaf is not an extension either
        let hasExtension = parts.last?.range(of: "[A-Za-z][\\w-]*\\.[A-Za-z]\\w*\\.?$", options: .regularExpression) != nil
        let isPath = path.first.map { "~./".contains($0) } == true || path.hasSuffix("/") || hasExtension
        return (isPath ? parts.last.map(String.init) ?? "" : parts.joined(separator: " ")) + stop
    }
    t = t.replacing("\\b(\\w+)\\.(ts|tsx|js|md|json|sh|py|swift|go|yaml|toml)\\b", "$1 dot $2")
    t = t.replacing("\\b(\\w+)\\.([a-z]+[A-Z]\\w*)\\b", "$1 dot $2")
    t = t.replacing("([A-Za-z]):([A-Za-z])", "$1 $2")
    // «GitHub» taught as a word is one
    t = t.replacing("(?<![A-Za-z])[A-Za-z]*[a-z][A-Z][A-Za-z]*") { g in
        let lower = g[0].lowercased()
        return lists.words[lower] != nil || lists.letters.contains(lower) ? g[0] : g[0].replacingOccurrences(of: "([a-z])([A-Z])", with: "$1 $2", options: .regularExpression)
    }
    t = t.replacing("\\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\\b") { g in g[0].lowercased() }
    t = t.replacing("(\\w)_(?=\\w)", "$1 ")
    t = t.replacing("#(\\d+)", "number $1")
    return t.replacing("\\b[A-Za-z]+\\b") { g in
        let lower = g[0].lowercased()
        return lists.words[lower] ?? (lists.letters.contains(lower) ? spell(lower) : g[0])
    }
}

private func rewriteSymbols(_ text: SourcedText) -> SourcedText {
    var t = text
    // a key glyph is a word a voice cannot say: «⌘Enter» reads «command Enter»
    t = t.replacing("[⌘⌥⇧⌃]") { g in " " + ["⌘": "command", "⌥": "option", "⇧": "shift", "⌃": "control"][g[0]]! + " " }
    t = t.replacing("\\s*(?:→|->|=>|⇒|·|\\||—|–)\\s*", ", ")
    t = t.replacing("\\s&\\s", " and ")
    // the dot of a line end stays
    t = t.replacing("\\s/(?:\\s|(?=\\.\\s))", ", ")
    t = t.replacing("\\s@(\\w)", " at $1")
    t = t.replacing("[«»\"“”]", "")
    t = t.replacing("[()\\[\\]]", ", ")
    t = t.replacing("[{}<>*_=+^~\\\\]", " ")
    t = t.replacing("\\s+", " ")
    t = t.replacing("\\s+([.,!?;:])", "$1")
    t = t.replacing(",(\\s*,)+", ",")
    t = t.replacing("([.!?;:]),", "$1")
    t = t.replacing(",([.!?;:])", "$1")
    // a voice never gets a text that opens on punctuation: a grab that starts «. Before» or «… and» sounds like noise
    return t.replacing("^[,.…:;!?\\s]+|[,\\s]+$", "")
}

// a run changes language only on a letter; digits, spaces and punctuation stay with the run they sit in
private func splitRuns(_ spoken: SourcedText) -> [Run] {
    let text = spoken.text
    let cyrillicLang: Lang = text.range(of: "[іїєґ]", options: [.regularExpression, .caseInsensitive]) != nil ? .uk
        : text.range(of: "[ыэъё]", options: [.regularExpression, .caseInsensitive]) != nil ? .ru : .uk
    var runs: [(lang: Lang, from: String.Index, hasLetter: Bool)] = []
    for index in text.indices {
        let char = text[index], scalar = char.unicodeScalars.first!
        let lang: Lang? = char.isLetter ? (scalar.properties.isAlphabetic && (0x0400...0x052F).contains(scalar.value) ? cyrillicLang : .en) : nil
        guard let last = runs.last else {
            runs.append((lang ?? .en, index, lang != nil))
            continue
        }
        guard let lang, !(last.hasLetter && lang == last.lang) else { continue }
        if last.hasLetter { runs.append((lang, index, true)) } else { runs[runs.count - 1] = (lang, last.from, true) }
    }
    return runs.indices
        .map { Run(lang: runs[$0].lang, spoken: spoken[runs[$0].from..<($0 + 1 < runs.count ? runs[$0 + 1].from : text.endIndex)].trimmed(.whitespacesAndNewlines)) }
        .filter { $0.text.contains { $0.isLetter || $0.isNumber } }
}

// chromium's accessibility text (the Claude app, electron) drops a list's line breaks and glues each number to the
// line above: «lane1. merge now2. sleep». numbers that run 1, 2, … right after a non-digit get their lines back; a
// lone glued «3.» (FRM-283.) is never a list, and an id's own digits after «-» or «#» never start one. from 2 on, a
// line that ends in a digit («pr #522. sleep now3.») is tried too, once no cleaner match exists, and kept only when
// the next number follows it: «node to 22. done» keeps its 22. U+FFFC stands in for an inline image or icon
private func unglueLists(_ text: SourcedText) -> SourcedText {
    var t = text.replacing("[\\x{FFFC}\\x{0}]", "")
    // a bulleted item glued to the one above opens on a quote that touches the last word: «… stays open«a gui …»
    t = t.replacing("(?<=[\\p{L}\\p{N}])(?=[«“])", "\n")
    let glued = t.text
    var breaks: [(index: String.Index, afterDigit: Bool)] = []
    var from = glued.startIndex
    for number in 1... {
        let clean = "(?<=[^\\s\\d#-])\(number)\\. ", afterDigit = "(?<=\\d)\(number)\\. "
        let search = { (pattern: String) in glued.range(of: pattern, options: .regularExpression, range: from..<glued.endIndex) }
        let cleanFound = search(clean)
        guard let found = cleanFound ?? (number > 1 ? search(afterDigit) : nil) else { break }
        breaks.append((found.lowerBound, cleanFound == nil))
        from = found.upperBound
    }
    while breaks.last?.afterDigit == true { breaks.removeLast() }
    guard breaks.count >= 2 else { return t }
    // from the end, so each place still points where it did
    return breaks.reversed().reduce(t) { $0.inserting("\n", at: $1.index) }
}

func normalize(_ text: String, _ lists: WordLists = .shipped) -> [Run] {
    splitRuns(stripMarkdown(unglueLists(SourcedText(text))))
        .map { Run(lang: $0.lang, spoken: rewriteSymbols($0.lang == .en ? rewriteLatin($0.spoken, lists) : $0.spoken)) }
        .filter { !$0.text.isEmpty }
}
