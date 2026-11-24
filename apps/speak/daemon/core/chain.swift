// the read path's rules, as functions over values: which engine speaks a chunk, how long it may take, what a failure
// costs it, and how a text is cut. the clock and «is anything playing» are handed in
import Foundation

struct Chunk {
    let lang: Lang
    let text: String
}

enum EngineError: Error {
    case noKey, noVoice, status(Int), timeout
    // the provider's own words, e.g. «you have 14 credits remaining, while 203 are required»
    case quota(String)
}

// sentences, and a long first sentence cut at its first comma past 40 chars, so audio starts early
func chunks(_ runs: [Run]) -> [Chunk] {
    var result: [Chunk] = []
    for run in runs {
        let marked = run.text.replacingOccurrences(of: "([.!?…;])\\s+", with: "$1\0", options: .regularExpression)
        for sentence in marked.split(separator: "\0") {
            var text = String(sentence)
            if result.isEmpty, text.count > 100, let comma = text.dropFirst(40).firstIndex(of: ",") {
                result.append(Chunk(lang: run.lang, text: String(text[...comma])))
                text = String(text[text.index(after: comma)...]).trimmingCharacters(in: .whitespaces)
            }
            result.append(Chunk(lang: run.lang, text: text))
        }
    }
    return result
}

// `only` is --engine: one engine, no chain. the engine that played the read's first chunk leads every later one, so one
// read keeps one voice
func candidates(chain: [Lang: [Engine]], lang: Lang, only: Engine?, benched: [Engine: Date], lead: Engine?, now: Date) -> [Engine] {
    var result = (only.map { [$0] } ?? chain[lang] ?? []).filter { $0.speaks(lang) && (benched[$0] ?? .distantPast) < now }
    if let lead, let at = result.firstIndex(of: lead) { result.insert(result.remove(at: at), at: 0) }
    return result
}

// a cloud engine racing its deadline: kokoro renders the same chunk meanwhile, so a miss costs nothing
func rendersKokoroAhead(_ candidates: [Engine], lead: Engine?, isPlaying: Bool) -> Bool {
    lead == nil && candidates.first?.isCloud == true && candidates.contains(.kokoro) && !isPlaying
}

// one first-audio budget per chunk, shared by every cloud engine: misses never stack
func firstAudioBudgetEnds(isPlaying: Bool, firstAudioMs: Int, now: ContinuousClock.Instant) -> ContinuousClock.Instant? {
    isPlaying ? nil : now + .milliseconds(firstAudioMs)
}

enum FirstAudioWait: Equatable { case asLongAsItTakes, atMost(Duration), skip }

// kokoro answers a chunk whole, and a server that hangs never does: 3 s, far over its 0.8 s for 300 characters
// (24 Nov), and 10 ms for each one past them. it runs from the moment nothing plays
func kokoroWait(_ characters: Int) -> Duration { .milliseconds(3000 + 10 * max(0, characters - 300)) }

// the last candidate has nothing to yield to, so it waits as long as it takes; neither does a cloud lead — a gap
// between chunks must not hand its voice to the next engine
func firstAudioWait(for engine: Engine, among candidates: [Engine], lead: Engine?, characters: Int, budgetEnds: ContinuousClock.Instant?, now: ContinuousClock.Instant) -> FirstAudioWait {
    guard engine != candidates.last else { return .asLongAsItTakes }
    if engine == .kokoro { return .atMost(kokoroWait(characters)) }
    guard engine.isCloud, engine != lead, let budgetEnds else { return .asLongAsItTakes }
    return budgetEnds > now ? .atMost(budgetEnds - now) : .skip
}

struct BenchDecision: Equatable {
    // how long the engine sits out; nil costs only this chunk
    var seconds: TimeInterval?
    // the provider's words for an empty balance
    var quota: String?
    var restartsKokoro = false
    var mayEndFishFreeTier = false
}

// quota or auth → an hour off; 5xx or offline → a minute off. a slow start and a missing key cost only this
// press: benching on a slow start turned one miss into a minute of kokoro (dima, 2026-09-29)
func bench(for error: Error, from engine: Engine) -> BenchDecision {
    var decision = BenchDecision()
    decision.seconds = switch error {
    case EngineError.noKey, EngineError.noVoice, EngineError.timeout: nil
    case EngineError.status(let code) where [401, 402, 403, 429].contains(code): 3600
    case EngineError.quota: 3600
    default: 60
    }
    if case EngineError.quota(let message) = error { decision.quota = message }
    // the kokoro server is ours to keep alive: one that stops answering is started again
    decision.restartsKokoro = engine == .kokoro && (error as? URLError)?.code == .cannotConnectToHost
    // fish's free model ends on a date its blog names twice (11-30, 08-31): its refusal reads as the tier's end
    if engine == .fish, case EngineError.status(let code) = error { decision.mayEndFishFreeTier = [402, 429].contains(code) }
    return decision
}

// a quota answer (elevenlabs says `quota_exceeded` in its json) is told apart from a plain status
func engineError(status: Int, body: Data) -> EngineError {
    let detail = (try? JSONSerialization.jsonObject(with: body) as? [String: Any])?["detail"] as? [String: Any]
    guard detail?["status"] as? String == "quota_exceeded" || detail?["code"] as? String == "quota_exceeded" else { return .status(status) }
    return .quota(detail?["message"] as? String ?? "out of quota")
}
