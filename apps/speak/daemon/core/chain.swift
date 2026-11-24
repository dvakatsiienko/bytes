// the read path's rules, as functions over values: which engine speaks a chunk, how long it may take, what a failure
// costs it, and how a text is cut. the clock and «is anything playing» are handed in
import Foundation

struct Chunk {
    let lang: Lang
    let text: String
    // where in the grabbed text it came from, in utf-16 units
    var source = 0..<0
}

enum EngineError: Error {
    case noKey, noVoice, noSound, status(Int), timeout
    // the provider's own words, e.g. «you have 14 credits remaining, while 203 are required»
    case quota(String)
}

func spokenChunks(of text: String, _ lists: WordLists = .shipped) -> [Chunk] { chunks(normalize(text, lists)) }

// a local server renders a chunk whole before its first sound, and a cloud engine may refuse a long one
private let longestChunk = 300

// sentences, and a long first sentence cut at its first comma past 40 chars, so audio starts early
func chunks(_ runs: [Run]) -> [Chunk] {
    var result: [Chunk] = []
    for run in runs {
        // a rewritten end of one and start of the next may come from the same character: it is the first one's
        let add = { (piece: SourcedText) in
            let from = max(piece.source.lowerBound, result.last?.source.upperBound ?? 0)
            result.append(Chunk(lang: run.lang, text: piece.text, source: from..<max(from, piece.source.upperBound)))
        }
        for sentence in run.spoken.replacing("([.!?…;])\\s+", "$1\0").split(at: "\0") {
            var rest = sentence
            if result.isEmpty, rest.text.count > 100, let comma = rest.text.prefix(longestChunk).dropFirst(40).indices.first(where: { pauses(rest.text, at: $0) }) {
                add(rest[...comma])
                rest = rest[rest.text.index(after: comma)...].trimmed(.whitespaces)
            }
            while rest.text.count > longestChunk {
                let end = endOfOpening(rest.text)
                add(rest[..<end])
                rest = rest[end...].trimmed(.whitespaces)
            }
            add(rest)
        }
    }
    return result
}

// a comma, one inside a number aside
private func pauses(_ text: String, at: String.Index) -> Bool {
    let after = text.index(after: at)
    return text[at] == "," && !(after < text.endIndex && text[text.index(before: at)].isNumber && text[after].isNumber)
}

// up to its last comma past the half, else its last space
private func endOfOpening(_ text: String) -> String.Index {
    let half = text.index(text.startIndex, offsetBy: longestChunk / 2), end = text.index(text.startIndex, offsetBy: longestChunk)
    return text[half..<end].indices.last { pauses(text, at: $0) }.map(text.index(after:)) ?? text[...end].lastIndex(of: " ") ?? end
}

// `only` is --engine: one engine, no chain. the engine that played the read's first chunk leads every later one, so one
// read keeps one voice
func candidates(chain: [Lang: [Engine]], lang: Lang, only: Engine?, benched: [Engine: Date], lead: Engine?, now: Date) -> [Engine] {
    var result = (only.map { [$0] } ?? chain[lang] ?? []).filter { $0.speaks(lang) && (benched[$0] ?? .distantPast) < now }
    if let lead, let at = result.firstIndex(of: lead) { result.insert(result.remove(at: at), at: 0) }
    return result
}

// a cloud engine racing its deadline: a local server renders the same chunk meanwhile, so a miss costs nothing
func rendersAhead(_ candidates: [Engine], lead: Engine?, isPlaying: Bool) -> Engine? {
    guard lead == nil, candidates.first?.isCloud == true, !isPlaying else { return nil }
    return candidates.first { $0.facts.isLocalServer }
}

// one first-audio budget per chunk, shared by every cloud engine: misses never stack
func firstAudioBudgetEnds(isPlaying: Bool, firstAudioMs: Int, now: ContinuousClock.Instant) -> ContinuousClock.Instant? {
    isPlaying ? nil : now + .milliseconds(firstAudioMs)
}

func isOnBudget(_ engine: Engine, lead: Engine?) -> Bool { engine.isCloud && engine != lead }

enum FirstAudioWait: Equatable { case asLongAsItTakes, atMost(Duration), skip }

// a local server, and the read's own voice, are not on the budget: only a hang hands their chunk on. far over kokoro's
// 0.8 s for the longest chunk (24 Nov)
private let hangWait = Duration.seconds(3)

// the last candidate has nothing to yield to, so it waits as long as it takes. a local server's and the lead's waits run from the
// moment nothing plays, the budget from its chunk's start or, under sound, from that moment too
func firstAudioWait(for engine: Engine, among candidates: [Engine], lead: Engine?, firstAudioMs: Int, budgetEnds: ContinuousClock.Instant?, now: ContinuousClock.Instant) -> FirstAudioWait {
    guard engine != candidates.last else { return .asLongAsItTakes }
    if engine.facts.isLocalServer { return .atMost(hangWait) }
    guard engine.isCloud else { return .asLongAsItTakes }
    if engine == lead { return .atMost(hangWait) }
    guard let budgetEnds else { return .atMost(.milliseconds(firstAudioMs)) }
    return budgetEnds > now ? .atMost(budgetEnds - now) : .skip
}

struct BenchDecision: Equatable {
    // how long the engine sits out; nil costs only this chunk
    var seconds: TimeInterval?
    // the provider's words for an empty balance
    var quota: String?
    var restartsServer = false
}

// quota or auth → an hour off; 5xx or offline → a minute off. a refused text costs only this chunk; a slow start and
// a missing key only this press: benching on a slow start turned one miss into a minute of kokoro (dima, 2026-09-29)
func bench(for error: Error, from engine: Engine) -> BenchDecision {
    var decision = BenchDecision()
    decision.seconds = switch error {
    case EngineError.noKey, EngineError.noVoice, EngineError.noSound, EngineError.timeout: nil
    case EngineError.status(400), EngineError.status(422): nil
    case EngineError.status(let code) where [401, 402, 403, 429].contains(code): 3600
    case EngineError.quota: 3600
    default: 60
    }
    if case EngineError.quota(let message) = error { decision.quota = message }
    // a local server is ours to keep alive: one that stops answering is started again
    decision.restartsServer = engine.facts.isLocalServer && (error as? URLError)?.code == .cannotConnectToHost
    return decision
}

// a quota answer (elevenlabs says `quota_exceeded` in its json) is told apart from a plain status
func engineError(status: Int, body: Data) -> EngineError {
    let detail = (try? JSONSerialization.jsonObject(with: body) as? [String: Any])?["detail"] as? [String: Any]
    guard detail?["status"] as? String == "quota_exceeded" || detail?["code"] as? String == "quota_exceeded" else { return .status(status) }
    return .quota(detail?["message"] as? String ?? "out of quota")
}
