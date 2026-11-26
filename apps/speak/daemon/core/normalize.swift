// voices read prose well and tech text badly: ids, versions, paths, code and symbols come out as
// «vee zero three eighty-five» or a spelled url. no engine fixes this for us (FRM-269 research),
// so every engine is fed text rewritten here first. golden.json is the contract.
import Foundation

enum Lang: String, Codable, CaseIterable { case en, uk, ru }

struct Run: Equatable {
    var lang: Lang
    var spoken: SourcedText
    // a code block cut from the text: where it stood, and nothing to say
    var block: Range<Int>?
    var text: String { spoken.text }

    static func codeBlock(_ source: Range<Int>) -> Run {
        var run = Run(lang: .en, text: "")
        run.block = source
        return run
    }

    init(lang: Lang, spoken: SourcedText) {
        self.lang = lang
        self.spoken = spoken
    }

    init(lang: Lang, text: String) { self.init(lang: lang, spoken: SourcedText(text)) }
}

private let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

private func spell(_ letters: String) -> String { letters.uppercased().map(String.init).joined(separator: " ") }

private func stripMarkdown(_ text: SourcedText, _ cleaner: Cleaner) -> SourcedText {
    var t = text
    if cleaner.on(.markdown) { t = markdown(t) }
    if cleaner.on(.emoji) { t = emoji(t) }
    return cleaner.on(.lineEnds) ? lineEnds(t) : t
}

private func markdown(_ text: SourcedText) -> SourcedText {
    var t = text
    t = t.replacing("!\\[[^\\]]*\\]\\([^)]*\\)", "")
    t = t.replacing("\\[([^\\]]+)\\]\\([^)]*\\)", "$1")
    t = t.replacing("^\\s{0,3}#{1,6}\\s+", "", .anchorsMatchLines)
    t = t.replacing("^\\h*[-*+]\\s+", "", .anchorsMatchLines)
    // a numbered line says its number, then a short pause: «1. merge» → «1: merge», read «one: merge»
    t = t.replacing("^\\h*(\\d{1,2})\\.\\s+", "$1: ", .anchorsMatchLines)
    t = t.replacing("^\\h*>\\s?", "", .anchorsMatchLines)
    t = t.replacing("(\\*\\*|__|~~|`)", "")
    t = t.replacing("(^|\\s)[*_]([^*_\\n]+)[*_](?=\\s|[.,!?]|$)", "$1$2")
    // bullets and geometric shapes: the Claude app hands nested list markers over as «■», read as «black square»
    return t.replacing("[\\x{2022}\\x{2023}\\x{2043}\\x{25A0}-\\x{25FF}\\x{2605}\\x{2606}]", "")
}

private func emoji(_ text: SourcedText) -> SourcedText {
    var t = text
    // ➡️ is an arrow before it is a pictograph: it pauses like «→» instead of vanishing
    t = t.replacing("\\x{27A1}\\x{FE0F}?", " → ")
    // pictographs, skin tones, flags, keycaps, tag sequences and the joiners that glue them
    return t.replacing("[\\p{Extended_Pictographic}\\p{Emoji_Modifier}\\p{Regional_Indicator}\\x{FE0E}\\x{FE0F}\\x{200D}\\x{20E3}\\x{E0020}-\\x{E007F}]", "")
}

private func lineEnds(_ t: SourcedText) -> SourcedText {
    // a line that ends bare ends a sentence: several lines read as one run-on otherwise (dima: «it sounds like a single sentence»)
    // a mark that already pauses, an opener or a joining sign ends none, and a line of signs alone is none
    return t.replacing("(?<!\\s)(?=\\h*\\R)(?<=[\\p{L}\\p{N}][^\\p{L}\\p{N}\\v]{0,40})(?<![.!?…;:,]|[.!?…][»”\"'’)*\\]]{1,2})(?<![({\\[«“‘„<→⇒·|&=\\\\\\-–—]|[-=]>)\\h*\\R", ".\n")
}

// what the cut rules match: a dictionary entry never rewrites inside one, whether its rule is on or off
enum Cut {
    static let fileLink = "\\bfile://\\S*?(?:\\.(\\w+))?(?=[.,;:!?)]*(?:\\s|$))"
    static let url = "\\bhttps?://(?:www\\.)?([^/\\s),;]+)\\S*?(?=[.,;:!?)]*(?:\\s|$))"
    static let uuid = "\\b[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}\\b"
    // two letters and two digits at least, so «1e10000» and «deadbeef» stay words; a «#» in front is a colour
    static let commit = "(?<![#\\w])(?=(?:[0-9a-f]*\\d){2})(?=(?:[0-9a-f]*[a-f]){2})(?:[0-9a-f]{7,12}|[0-9a-f]{40})\\b"
    // six digits at least, so a type name like «ISO8601DateFormatter» stays a name
    static let token = "\\b(?=(?:[A-Za-z]*\\d){6})(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{16,}\\b"
    // never from inside a word or a url the url rule left
    static let path = "(?<![:/\\w.-])(?:~|\\.{1,2})?/?(?:[\\w.-]+/)+[\\w.-]*"
    static let date = "\\b(\\d{4})-(\\d{2})-(\\d{2})\\b"
    static let ip = "\\b(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\b"
    static let port = "(?<![\\w.-])([A-Za-z0-9][\\w.-]*):(\\d{2,5})\\b"
    static let ticket = "\\b([A-Z]{2,6})-(\\d+)\\b"
    static let version = "\\bv?(\\d+(?:\\.\\d+){1,3})\\b"
    static let fileName = "\\b\\w+\\.(?:ts|tsx|js|md|json|sh|py|swift|go|yaml|toml)\\b"
    static func unit(_ lists: WordLists) -> String {
        "(\\d)\\s?(\(lists.units.keys.sorted { $0.count > $1.count }.map(NSRegularExpression.escapedPattern).joined(separator: "|")))(?!\\w)"
    }
    static let pid = "\\bpid\\s*[:=]?\\s*\\d+"
    // every span a rule before the dictionary rewrites, and a file name the code names rule reads later, with what it is
    static func all(_ lists: WordLists) -> [(String, NSRegularExpression.Options, kind: String)] {
        [(fileLink, .caseInsensitive, "a link"), (url, .caseInsensitive, "a link"), (uuid, [], "an id"), (commit, [], "an id"), (token, [], "an id"),
         (pid, .caseInsensitive, "an id"), (path, [], "a path"), (date, [], "a date"), (ip, [], "an address"), (port, [], "an address"),
         (ticket, [], "a ticket id"), (version, [], "a version"), (unit(lists), .caseInsensitive, "a unit"), (fileName, [], "a file name")]
    }
}

private func cutLatin(_ text: SourcedText, _ lists: WordLists, _ cleaner: Cleaner) -> SourcedText {
    var t = text
    // ids carry nothing a listener can use: a file link names its kind, a hash, a uuid, a long token or a pid number is cut
    if cleaner.on(.fileLinks) {
        t = t.replacing(Cut.fileLink, .caseInsensitive) { g in
            let kind = lists.fileKinds[g[1].lowercased()] ?? g[1].lowercased()
            guard let first = kind.first else { return "a file link" }
            // «an html», «a pdf», «a markdown»: a kind read letter by letter takes its article from the letter's name
            let isSpelled = lists.letters.contains(kind) || !kind.contains(where: "aeiou".contains)
            return ((isSpelled ? "aefhilmnorsx" : "aeiou").contains(first) ? "an " : "a ") + kind + " file link"
        }
    }
    if cleaner.on(.urls) { t = t.replacing(Cut.url, "$1", .caseInsensitive) }
    if cleaner.on(.ids) { t = t.replacing(Cut.uuid, "an id") }
    // «pid» keeps its own place, so no spoken word comes from the number it drops
    if cleaner.on(.ids) { t = t.replacing("\\bpid(?=\\s*[:=]?\\s*\\d)", .caseInsensitive) { _ in "pid" }.replacing("(?<=\\bpid)\\s*[:=]?\\s*\\d+", "") }
    if cleaner.on(.ids) { t = t.replacing(Cut.commit, "a commit") }
    if cleaner.on(.ids) { t = t.replacing(Cut.token, "an id") }
    if cleaner.on(.dates) {
        t = t.replacing(Cut.date) { g in
            guard let month = Int(g[2]), (1...12).contains(month), let day = Int(g[3]) else { return g[0] }
            return "\(months[month - 1]) \(day), \(g[1])"
        }
    }
    if cleaner.on(.addresses) { t = t.replacing("\\b127\\.0\\.0\\.1\\b", "localhost") }
    if cleaner.on(.addresses) { t = t.replacing(Cut.ip, "$1 dot $2 dot $3 dot $4") }
    if cleaner.on(.addresses) { t = t.replacing(Cut.port, "$1 port $2") }
    if cleaner.on(.ticketIds) { t = t.replacing(Cut.ticket) { g in "\(spell(g[1])) \(g[2])" } }
    if cleaner.on(.versions) {
        t = t.replacing(Cut.version) { g in
            let parts = g[1].split(separator: ".")
            if g[0].hasPrefix("v") { return "version " + parts.joined(separator: " point ") }
            return parts.count > 2 ? parts.joined(separator: " point ") : g[0]
        }
    }
    if cleaner.on(.units) { t = t.replacing(Cut.unit(lists), .caseInsensitive) { g in "\(g[1]) \(lists.units[g[2].lowercased()] ?? g[2])" } }
    // a path says only its last part; a bare «audio/video» is two words, not a path
    if cleaner.on(.paths) {
        t = t.replacing(Cut.path) { g in
            // the dot a line end put after a folder is not a part of its path
            let stop = g[0].last == "." && g[0].dropLast().last == "/" ? "." : "", path = g[0].dropLast(stop.count)
            let parts = path.split(separator: "/").filter { !["~", ".", ".."].contains($0) }
            // a file name has a word before its extension («exa.md»), a version has digits («24.x»); a sentence end the
            // line-break rule put on the leaf is not an extension either
            let hasExtension = parts.last?.range(of: "[A-Za-z][\\w-]*\\.[A-Za-z]\\w*\\.?$", options: .regularExpression) != nil
            let isPath = path.first.map { "~./".contains($0) } == true || path.hasSuffix("/") || hasExtension
            return (isPath ? parts.last.map(String.init) ?? "" : parts.joined(separator: " ")) + stop
        }
    }
    return t
}

private func rewriteLatin(_ text: SourcedText, _ lists: WordLists, _ cleaner: Cleaner) -> SourcedText {
    var t = text
    // a number after a file name is its line: «reminders.md:43» reads «reminders dot md, line 43»
    if cleaner.on(.codeNames) { t = t.replacing("\\b(\\w+)\\.(ts|tsx|js|md|json|sh|py|swift|go|yaml|toml):(\\d+)\\b", "$1 dot $2, line $3") }
    if cleaner.on(.codeNames) { t = t.replacing("\\b(\\w+)\\.(ts|tsx|js|md|json|sh|py|swift|go|yaml|toml)\\b", "$1 dot $2") }
    if cleaner.on(.codeNames) { t = t.replacing("\\b(\\w+)\\.([a-z]+[A-Z]\\w*)\\b", "$1 dot $2") }
    if cleaner.on(.codeNames) { t = t.replacing("([A-Za-z]):([A-Za-z])", "$1 $2") }
    // «GitHub» taught as a word is one
    if cleaner.on(.codeNames) {
        t = t.replacing("(?<![A-Za-z])[A-Za-z]*[a-z][A-Z][A-Za-z]*") { g in
            let lower = g[0].lowercased()
            return lists.words[lower] != nil || lists.letters.contains(lower) ? g[0] : g[0].replacingOccurrences(of: "([a-z])([A-Z])", with: "$1 $2", options: .regularExpression)
        }
    }
    if cleaner.on(.codeNames) { t = t.replacing("\\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\\b") { g in g[0].lowercased() } }
    if cleaner.on(.codeNames) { t = t.replacing("(\\w)_(?=\\w)", "$1 ") }
    if cleaner.on(.codeNames) { t = t.replacing("#(\\d+)", "number $1") }
    guard cleaner.on(.words) else { return t }
    return t.replacing("\\b[A-Za-z]+\\b") { g in
        let lower = g[0].lowercased()
        return lists.words[lower] ?? (lists.letters.contains(lower) ? spell(lower) : g[0])
    }
}

private func symbols(_ text: SourcedText) -> SourcedText {
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
    return t.replacing("[{}<>*_=+^~\\\\]", " ")
}

// what a voice is left with: one space between words, no mark doubled or opening the text
private func tidy(_ text: SourcedText) -> SourcedText {
    var t = text.replacing("\\s+", " ")
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
// the next number follows it: «node to 22. done» keeps its 22. a selection from inside a list starts at its first
// number past 1, and the marker of the next item that ends the text is the one the selection only touched; both only
// when accessibility named that marker (`touched`): «beats the M2.» ends in prose, not a list
private func unglueLists(_ text: SourcedText, touched: Int?) -> SourcedText {
    // a bulleted item glued to the one above opens on a quote that touches the last word: «… stays open«a gui …»
    let t = text.replacing("(?<=[\\p{L}\\p{N}])(?=[«“])", "\n")
    let glued = t.text
    // the numbers from `first` on, and the glued marker of the next one that ends the text, if one does
    let list = { (first: Int) -> (breaks: [String.Index], end: String.Index?) in
        var breaks: [(index: String.Index, afterDigit: Bool)] = []
        var from = glued.startIndex, number = first
        while true {
            let clean = "(?<=[^\\s\\d#-])\(number)\\. (?=\\s*\\S)", afterDigit = "(?<=\\d)\(number)\\. (?=\\s*\\S)"
            let search = { (pattern: String) in glued.range(of: pattern, options: .regularExpression, range: from..<glued.endIndex) }
            let cleanFound = search(clean)
            guard let found = cleanFound ?? (number > first ? search(afterDigit) : nil) else { break }
            breaks.append((found.lowerBound, cleanFound == nil))
            from = found.upperBound
            number += 1
        }
        let end = breaks.isEmpty || touched != number ? nil : glued.range(of: "(?<=[^\\s\\d#-])\(number)\\.\\s*\\z", options: .regularExpression, range: from..<glued.endIndex)?.lowerBound
        // a line that ends in a digit stays a break only when the next number follows it
        if end == nil { while breaks.last?.afterDigit == true { breaks.removeLast() } }
        return (breaks.map(\.index), end)
    }
    // a list from 1, or the items a selection holds from inside one: «merge2. commit3.» is items 2 and the start of 3
    var (breaks, end) = list(1)
    if breaks.count + (end == nil ? 0 : 1) < 2 {
        guard touched != nil, let part = (2...9).lazy.map(list).first(where: { $0.end != nil && !$0.breaks.isEmpty }) else { return t }
        (breaks, end) = part
    }
    // the next item's marker the selection only touched is not read; then from the end, so each place still points where it did
    return breaks.reversed().reduce(end.map { t[..<$0] } ?? t) { $0.inserting("\n", at: $1) }
}

// accessibility's text runs on past the marker of a list item the selection's end only touches: a triple-click on
// «commit» ends at the start of item 3, and answers «commit3. ». the lines come back first: that marker proves the list
func normalize(_ text: String, _ lists: WordLists = .shipped, _ cleaner: Cleaner = Cleaner(), nextMarker: String? = nil) -> [Run] {
    // U+FFFC stands in for an inline image or icon; the private-use units, apple's icons among them, are the dictionary's
    let grabbed = SourcedText(text).replacing("[\\x{FFFC}\\x{0}\(standIns)]", "")
    let touched = nextMarker.flatMap { Int($0.prefix { $0.isNumber }) }
    let lines = cleaner.on(.lists) ? unglueLists(grabbed, touched: touched) : grabbed
    let selected = nextMarker.map { lines.replacing("\\n?\(NSRegularExpression.escapedPattern(for: $0))\\z", "") } ?? lines
    guard cleaner.on(.codeBlocks) else { return clean(selected, lists, cleaner) }
    // a code block is cut whole and keeps its place between the runs around it
    var runs: [Run] = [], from = selected.text.startIndex
    for block in selected.text.ranges(of: try! Regex("```[\\s\\S]*?```|~~~[\\s\\S]*?~~~")) {
        runs += clean(selected[from..<block.lowerBound], lists, cleaner) + [.codeBlock(selected[block].source)]
        from = block.upperBound
    }
    return runs + clean(selected[from...], lists, cleaner)
}

private func clean(_ text: SourcedText, _ lists: WordLists, _ cleaner: Cleaner) -> [Run] {
    splitRuns(stripMarkdown(text, cleaner))
        .map { run in
            let isLatin = run.lang == .en
            var said: [String] = []
            var t = dictionary(isLatin ? cutLatin(run.spoken, lists, cleaner) : run.spoken, cleaner.dictionary, keeping: Cut.all(lists).flatMap { run.spoken.sources(of: $0.0, $0.1) }, &said)
            if isLatin { t = rewriteLatin(t, lists, cleaner) }
            t = tidy(cleaner.on(.symbols) ? symbols(t) : t)
            return Run(lang: run.lang, spoken: t.replacing("[\(standIns)]") { g in said[Int(g[0].unicodeScalars.first!.value) - 0xE000] })
        }
        .filter { !$0.text.isEmpty }
}

private let standIns = "\\x{E000}-\\x{F8FF}"

// his words, once the cuts ran: whole words only, never inside what a cut rule matches (on or off), each held as one
// stand-in unit until the end so no later rule reads it again
private func dictionary(_ text: SourcedText, _ entries: [Cleaner.Entry], keeping kept: [Range<Int>], _ said: inout [String]) -> SourcedText {
    entries.reduce(text) { t, entry in
        t.replacingWhole("(?<![\\p{L}\\p{M}\\p{N}_])\(NSRegularExpression.escapedPattern(for: entry.word))(?![\\p{L}\\p{M}\\p{N}_])", entry.anyCase ? .caseInsensitive : []) { _, source in
            guard !kept.contains(where: { $0.overlaps(source) }), said.count < 0x18FF else { return nil }
            said.append(entry.say)
            return String(Character(Unicode.Scalar(0xE000 + said.count - 1)!))
        }
    }
}
