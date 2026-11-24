// the read path's rules, one row per hostile order. the answers are the ones the daemon gave before the rules moved here
import Foundation

enum ChainTest {
    static let now = Date(timeIntervalSince1970: 1_000_000)
    static let start = ContinuousClock.now

    static func failures() -> Int {
        candidateFailures() + firstAudioFailures() + kokoroWaitFailures() + kokoroAheadFailures() + benchFailures() + refusalNoteFailures() + quotaBodyFailures() + chunkFailures()
    }

    static func candidateFailures() -> Int {
        let chain: [Lang: [Engine]] = [.en: [.fish, .kokoro, .system], .uk: [.elevenlabs, .kokoro, .system], .ru: []]
        let past = now.addingTimeInterval(-1), later = now.addingTimeInterval(60)
        let row = { (lang: Lang, benched: [Engine: Date], lead: Engine?, only: Engine?) in
            candidates(chain: chain, lang: lang, only: only, benched: benched, lead: lead, now: now)
        }
        return check("candidate", [
            ("the chain's own order", row(.en, [:], nil, nil), [.fish, .kokoro, .system]),
            ("an empty chain", row(.ru, [:], nil, nil), []),
            ("a language with no chain", candidates(chain: [.en: [.fish]], lang: .uk, only: nil, benched: [:], lead: nil, now: now), []),
            ("an engine that does not speak the language", row(.uk, [:], nil, nil), [.elevenlabs, .system]),
            ("every engine benched", row(.en, [.fish: later, .kokoro: later, .system: later], nil, nil), []),
            ("a bench that ended", row(.en, [.fish: past], nil, nil), [.fish, .kokoro, .system]),
            ("a bench that ends this moment still holds", row(.en, [.fish: now], nil, nil), [.kokoro, .system]),
            ("the lead goes first, the rest keep their order", row(.en, [:], .system, nil), [.system, .fish, .kokoro]),
            ("the lead benched mid-read", row(.en, [.kokoro: later], .kokoro, nil), [.fish, .system]),
            ("the lead absent from the chain", row(.en, [:], .gemini, nil), [.fish, .kokoro, .system]),
            ("the lead that does not speak the next language", row(.uk, [:], .kokoro, nil), [.elevenlabs, .system]),
            ("--engine alone", row(.en, [:], nil, .gemini), [.gemini]),
            ("--engine on an empty chain", row(.ru, [:], nil, .system), [.system]),
            ("--engine benched", row(.en, [.gemini: later], nil, .gemini), []),
            ("--engine that does not speak the language", row(.uk, [:], nil, .kokoro), []),
        ])
    }

    static func firstAudioFailures() -> Int {
        let chain: [Engine] = [.fish, .elevenlabs, .kokoro]
        let wait = { (engine: Engine, among: [Engine], lead: Engine?, budget: Int, isPlaying: Bool, passed: Int) in
            firstAudioWait(
                for: engine, among: among, lead: lead, characters: 40,
                budgetEnds: firstAudioBudgetEnds(isPlaying: isPlaying, firstAudioMs: budget, now: start),
                now: start + .milliseconds(passed)
            )
        }
        return check("first audio", [
            ("a cloud engine gets the budget", wait(.fish, chain, nil, 900, false, 0), .atMost(.milliseconds(900))),
            ("the next cloud engine gets what is left", wait(.elevenlabs, chain, nil, 900, false, 700), .atMost(.milliseconds(200))),
            ("the budget spent to the last ms", wait(.elevenlabs, chain, nil, 900, false, 900), .skip),
            ("the budget overspent", wait(.elevenlabs, chain, nil, 900, false, 1500), .skip),
            ("a budget of zero", wait(.fish, chain, nil, 0, false, 0), .skip),
            ("a budget of zero, the last candidate", wait(.fish, [.fish], nil, 0, false, 0), .asLongAsItTakes),
            ("a cloud engine that is last", wait(.elevenlabs, [.kokoro, .elevenlabs], nil, 900, false, 1500), .asLongAsItTakes),
            ("a cloud lead gets 3 s, never the budget", wait(.fish, chain, .fish, 900, false, 1500), .atMost(.seconds(3))),
            ("a cloud lead while audio plays: its 3 s wait for the quiet", wait(.fish, chain, .fish, 900, true, 0), .atMost(.seconds(3))),
            ("a lead that is the mac voice", wait(.system, [.system, .fish], .system, 900, false, 1500), .asLongAsItTakes),
            ("a cloud lead that is last", wait(.fish, [.kokoro, .fish], .fish, 900, false, 1500), .asLongAsItTakes),
            ("a non-cloud lead leaves the cloud its budget", wait(.fish, [.kokoro, .fish, .system], .kokoro, 900, false, 300), .atMost(.milliseconds(600))),
            ("audio already playing", wait(.fish, chain, nil, 900, true, 0), .asLongAsItTakes),
            ("audio already playing, a budget of zero", wait(.fish, chain, nil, 0, true, 0), .asLongAsItTakes),
            ("kokoro first gets 3 s, never the budget", wait(.kokoro, [.kokoro, .fish], nil, 900, false, 0), .atMost(.seconds(3))),
            ("kokoro leading gets 3 s", wait(.kokoro, [.kokoro, .fish], .kokoro, 900, false, 1500), .atMost(.seconds(3))),
            ("kokoro behind a cloud engine gets 3 s", wait(.kokoro, [.fish, .kokoro, .system], nil, 900, false, 1500), .atMost(.seconds(3))),
            ("kokoro, a budget of zero", wait(.kokoro, [.kokoro, .fish], nil, 0, false, 0), .atMost(.seconds(3))),
            ("kokoro last waits as long as it takes", wait(.kokoro, [.fish, .kokoro], nil, 900, false, 1500), .asLongAsItTakes),
            ("kokoro while audio plays: its 3 s wait for the quiet", wait(.kokoro, [.kokoro, .fish], nil, 900, true, 0), .atMost(.seconds(3))),
            ("the mac voice has no budget", wait(.system, [.system, .fish], nil, 0, false, 0), .asLongAsItTakes),
        ])
    }

    static func kokoroWaitFailures() -> Int {
        check("kokoro wait", [
            ("a word", localServerWait(4), .seconds(3)),
            ("300 characters", localServerWait(300), .seconds(3)),
            ("301", localServerWait(301), .milliseconds(3010)),
            ("1200", localServerWait(1200), .seconds(12)),
        ])
    }

    static func kokoroAheadFailures() -> Int {
        check("kokoro ahead", [
            ("a cloud engine first, kokoro behind it", rendersAhead([.fish, .kokoro], lead: nil, isPlaying: false), .kokoro),
            ("kokoro not among the candidates", rendersAhead([.fish, .system], lead: nil, isPlaying: false), nil),
            ("kokoro itself first", rendersAhead([.kokoro, .fish], lead: nil, isPlaying: false), nil),
            ("the mac voice first", rendersAhead([.system, .kokoro], lead: nil, isPlaying: false), nil),
            ("a lead is set", rendersAhead([.fish, .kokoro], lead: .fish, isPlaying: false), nil),
            ("audio already playing", rendersAhead([.fish, .kokoro], lead: nil, isPlaying: true), nil),
            ("no candidate", rendersAhead([], lead: nil, isPlaying: false), nil),
        ])
    }

    static func benchFailures() -> Int {
        let seconds = { (error: Error) in bench(for: error, from: .elevenlabs).seconds }
        let effects = { (error: Error, engine: Engine) in
            let decision = bench(for: error, from: engine)
            return "\(decision.quota ?? "-") \(decision.restartsServer)"
        }
        return check("bench", [
            ("no key", seconds(EngineError.noKey), nil),
            ("no voice", seconds(EngineError.noVoice), nil),
            ("timeout", seconds(EngineError.timeout), nil),
            ("no sound", seconds(EngineError.noSound), nil),
            ("404", seconds(EngineError.status(404)), 60),
            ("401", seconds(EngineError.status(401)), 3600),
            ("402", seconds(EngineError.status(402)), 3600),
            ("403", seconds(EngineError.status(403)), 3600),
            ("429", seconds(EngineError.status(429)), 3600),
            ("400", seconds(EngineError.status(400)), nil),
            ("422", seconds(EngineError.status(422)), nil),
            ("500", seconds(EngineError.status(500)), 60),
            ("no status", seconds(EngineError.status(0)), 60),
            ("offline", seconds(URLError(.notConnectedToInternet)), 60),
            ("a quota refusal", seconds(EngineError.quota("14 left")), 3600),
        ]) + check("bench effect", [
            ("a quota refusal carries the provider's words", effects(EngineError.quota("14 left"), .elevenlabs), "14 left false"),
            ("kokoro's server gone", effects(URLError(.cannotConnectToHost), .kokoro), "- true"),
            ("kokoro slow", effects(URLError(.timedOut), .kokoro), "- false"),
            ("a cloud host gone", effects(URLError(.cannotConnectToHost), .fish), "- false"),
        ])
    }

    static func refusalNoteFailures() -> Int {
        let note = { (engine: Engine, status: Int, model: String?) in engine.type.refusalNote(status: status, model: model) ?? "-" }
        let said = { (words: String) in "⚠️ FISH REFUSED \(words): the free tier may have ended; the chain falls through for an hour; check fish.audio" }
        return check("refusal note", [
            ("fish 402", note(.fish, 402, nil), said("s2.1-pro-free (402)")),
            ("fish 429, another model", note(.fish, 429, "s2.1-pro"), said("s2.1-pro (429)")),
            ("fish 401", note(.fish, 401, nil), "-"),
            ("elevenlabs 429", note(.elevenlabs, 429, nil), "-"),
        ])
    }

    static func quotaBodyFailures() -> Int {
        let read = { (status: Int, body: String) in "\(engineError(status: status, body: Data(body.utf8)))" }
        return check("quota body", [
            ("the status key", read(401, #"{"detail":{"status":"quota_exceeded","message":"14 left"}}"#), #"quota("14 left")"#),
            ("the code key", read(401, #"{"detail":{"code":"quota_exceeded","message":"14 left"}}"#), #"quota("14 left")"#),
            ("no words of its own", read(401, #"{"detail":{"code":"quota_exceeded"}}"#), #"quota("out of quota")"#),
            ("another refusal", read(401, #"{"detail":{"status":"invalid_api_key"}}"#), "status(401)"),
            ("a detail that is a word", read(422, #"{"detail":"quota_exceeded"}"#), "status(422)"),
            ("not json", read(500, "oops"), "status(500)"),
            ("an empty body", read(502, ""), "status(502)"),
        ])
    }

    static func chunkFailures() -> Int {
        let cut = { (runs: [(Lang, String)]) in chunks(runs.map { Run(lang: $0.0, text: $0.1) }).map { "\($0.lang.rawValue): \($0.text)" } }
        let words = String(repeating: "word ", count: 24).trimmingCharacters(in: .whitespaces)
        let late = String(repeating: "word ", count: 12) + "here, " + String(repeating: "more ", count: 12) + "end."
        let hundred = String(repeating: "a", count: 50) + ", " + String(repeating: "b", count: 48)
        return check("chunk", [
            ("one sentence", cut([(.en, "Hello there.")]), ["en: Hello there."]),
            ("two sentences", cut([(.en, "Hello there. And bye!")]), ["en: Hello there.", "en: And bye!"]),
            ("every end mark", cut([(.en, "a. b! c? d… e; f")]), ["en: a.", "en: b!", "en: c?", "en: d…", "en: e;", "en: f"]),
            ("a mark inside a word", cut([(.en, "v1.2 is out")]), ["en: v1.2 is out"]),
            ("a long first sentence with a comma", cut([(.en, late)]), [
                "en: " + String(repeating: "word ", count: 12) + "here,", "en: " + String(repeating: "more ", count: 12) + "end.",
            ]),
            ("a long first sentence, its comma before the 40th character", cut([(.en, "Well, " + words)]), ["en: Well, " + words]),
            ("a comma that is the 41st character", cut([(.en, String(repeating: "a", count: 40) + ", " + words)]), [
                "en: " + String(repeating: "a", count: 40) + ",", "en: " + words,
            ]),
            ("a comma that is the 40th character", cut([(.en, String(repeating: "a", count: 39) + ", " + words)]), [
                "en: " + String(repeating: "a", count: 39) + ", " + words,
            ]),
            ("a long first sentence with no comma", cut([(.en, words)]), ["en: " + words]),
            ("a short first sentence with a comma", cut([(.en, "One, two.")]), ["en: One, two."]),
            ("a first sentence of 100 characters, a comma past the 40th", cut([(.en, hundred)]), ["en: " + hundred]),
            ("a first sentence of 101 characters, a comma past the 40th", cut([(.en, hundred + "!")]), [
                "en: " + String(repeating: "a", count: 50) + ",", "en: " + String(repeating: "b", count: 48) + "!",
            ]),
            ("a long second sentence is whole", cut([(.en, "Hi. " + late)]), ["en: Hi.", "en: " + late]),
            ("several languages", cut([(.en, "Hello."), (.uk, "Привіт. Бувай."), (.ru, "Да")]), ["en: Hello.", "uk: Привіт.", "uk: Бувай.", "ru: Да"]),
            ("no punctuation at all", cut([(.en, "just some words")]), ["en: just some words"]),
            ("an empty text", cut([(.en, "")]), []),
            ("no run", cut([]), []),
        ])
    }
}
