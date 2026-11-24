// runs one read: each chunk through its candidates, onto the outputs. the engines, the outputs and the pill are handed in
import Foundation

// the engines, as a read hears them
@MainActor
protocol ChunkVoices: AnyObject {
    // returns once the chunk is played or on its way to the player; `onAudio` once, at its first sound
    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws
    func renderKokoroAhead(_ chunk: Chunk, settings: EngineConfig)
    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig)
    // what was asked ahead and not used yet
    func dropAhead()
    func hasKey(_ engine: Engine) -> Bool
    func reloadMissingKeys()
    func quotas(fish: EngineConfig) async -> [(Engine, Quota?)]
    func restartKokoro()
}

enum Quota {
    case left, empty(String, until: Date)
}

@MainActor
protocol SpeechPill: AnyObject {
    var isPaused: Bool { get set }
    func show()
    // speech is over: the pill goes too, unless stick holds it
    func speechEnded()
    // real speech ends the admin's infinite waveform: the meter goes back to the sound
    func stopWave()
}

@MainActor
final class Speaker: ReadTarget {
    private let player: Player
    private let macVoice: any SpeechOutput
    private let voices: any ChunkVoices
    private let pill: any SpeechPill
    private let saved: () -> Config
    private let write: (String) -> Void
    private var outputs: [any SpeechOutput] { [player, macVoice] }
    // engine → when it may be tried again; a failure costs its time once, then nothing until the reset
    private var skipUntil: [Engine: Date] = [:]
    // engine → the provider's quota message; cleared by the engine's next success, so a monthly reset heals itself
    private var outOfQuota: [Engine: String] = [:]
    private var quotaProbedAt: Date?
    private var job: Task<Void, Never>?
    // numbers each read in the log, so two reads talking at once show as two numbers interleaved
    private var reads = 0
    // a preview's unsaved card settings, in force for that one job
    private var draft: (engine: Engine, settings: EngineConfig)?

    private func settings(_ engine: Engine) -> EngineConfig {
        draft.flatMap { $0.engine == engine ? $0.settings : nil } ?? saved()[engine]
    }

    // the admin asks every few seconds: a status older than 10 min refreshes the quota behind this answer
    func health() -> [String: [String: String]] {
        if quotaProbedAt.map({ Date().timeIntervalSince($0) > 600 }) ?? true { Task { await probeQuota() } }
        var result: [String: [String: String]] = [:]
        for engine in Engine.allCases {
            let needsKey = engine.isCloud && !voices.hasKey(engine)
            let until = skipUntil[engine].flatMap { $0 > Date() ? $0 : nil }
            result[engine.rawValue] = needsKey ? ["state": "no key"]
                : outOfQuota[engine].map { ["state": "no quota", "note": $0] }
                ?? until.map { ["state": "benched", "until": ISO8601DateFormatter().string(from: $0)] } ?? ["state": "live"]
        }
        return result
    }

    init(player: Player, macVoice: any SpeechOutput, voices: any ChunkVoices, pill: any SpeechPill, settings saved: @escaping () -> Config, log write: @escaping (String) -> Void) {
        self.player = player
        self.macVoice = macVoice
        self.voices = voices
        self.pill = pill
        self.saved = saved
        self.write = write
    }

    // the next press can use it
    func kokoroIsWarm() { skipUntil[.kokoro] = nil }

    func togglePause() {
        guard isSpeaking else { return }
        pill.isPaused.toggle()
        outputs.forEach { if pill.isPaused { $0.pause() } else { $0.resume() } }
    }

    func stop() {
        if job != nil { write("read \(reads): stopped") }
        job?.cancel()
        voices.dropAhead()
        outputs.forEach { $0.stop() }
        job = nil
        draft = nil
    }

    // a preview ignores the bench: dima asked to hear this engine, so it is tried even when benched
    func preview(_ text: String, with engine: Engine, settings: EngineConfig) {
        stop()
        draft = (engine, settings)
        skipUntil[engine] = nil
        speak(chunks(normalize(text)), only: engine, pressed: .now)
    }

    var isSpeaking: Bool { job != nil }
    var isPaused: Bool { pill.isPaused }

    func silence() {
        stop()
        pill.speechEnded()
    }

    func read(_ parts: [Chunk], pressed: ContinuousClock.Instant) {
        if job != nil { stop() }
        speak(parts, only: nil, pressed: pressed)
        voices.reloadMissingKeys()
    }

    // the providers' balance calls cost nothing: a card shows the real quota before a press finds it, and an empty
    // engine sits benched until its refill instead of spending ~1 s of every press on a refusal
    func probeQuota() async {
        quotaProbedAt = Date()
        for (engine, quota) in await voices.quotas(fish: settings(.fish)) {
            switch quota {
            case .empty(let message, let until)?:
                outOfQuota[engine] = message
                skipUntil[engine] = until
            case .left? where outOfQuota[engine] != nil:
                outOfQuota[engine] = nil
                skipUntil[engine] = nil
            default: break
            }
        }
    }

    func speak(_ parts: [Chunk], only: Engine?, pressed: ContinuousClock.Instant) {
        pill.stopWave()
        pill.show()
        reads += 1
        let read = reads
        job = Task {
            var isFirst = true
            // a cloud engine that missed chunk 1's budget never takes over mid-read once audio is playing
            var lead: Engine?
            for (index, chunk) in parts.enumerated() {
                // the mac voice and kokoro finish a chunk normally even after a stop, so a stopped read ends here
                if Task.isCancelled { return }
                write("read \(read): chunk \(index + 1)/\(parts.count)")
                let engines = candidates(chain: saved().chain, lang: chunk.lang, only: only, benched: skipUntil, lead: lead, now: Date())
                if rendersKokoroAhead(engines, lead: lead, isPlaying: player.isPlaying) {
                    voices.renderKokoroAhead(chunk, settings: settings(.kokoro))
                }
                let budgetEnds = firstAudioBudgetEnds(isPlaying: outputs.contains { $0.isBusy }, firstAudioMs: saved().firstAudioMs, now: .now)
                for engine in engines {
                    let deadline: Duration?
                    switch firstAudioWait(for: engine, among: engines, lead: lead, budgetEnds: budgetEnds, now: .now) {
                    case .skip: continue
                    case .asLongAsItTakes: deadline = nil
                    case .atMost(let wait): deadline = wait
                    }
                    do {
                        try await voices.speak(chunk, with: engine, settings: { self.settings(engine) }, deadline: deadline) {
                            if isFirst { self.write("first audio: \(engine.rawValue) \(elapsed(pressed))") }
                            isFirst = false
                            if engine.streams, parts.indices.contains(index + 1) {
                                self.voices.openAhead(parts[index + 1], with: engine, settings: self.settings(engine))
                            }
                        }
                        outOfQuota[engine] = nil
                        if let lead, lead != engine { write("voice switch: \(lead.rawValue) → \(engine.rawValue) mid-read") }
                        lead = engine
                        break
                    } catch is CancellationError {
                        return
                    } catch {
                        if Task.isCancelled { return }
                        handle(error, from: engine)
                    }
                }
            }
            await player.drained()
            if !Task.isCancelled {
                job = nil
                draft = nil
                player.idle()
                pill.speechEnded()
            }
        }
    }

    private func handle(_ error: Error, from engine: Engine) {
        let decision = bench(for: error, from: engine)
        if let seconds = decision.seconds { skipUntil[engine] = Date().addingTimeInterval(seconds) }
        if let message = decision.quota {
            outOfQuota[engine] = message
            // the refusal knows no refill date; the probe does, and benches the engine until then instead of for an hour
            Task { await probeQuota() }
        }
        // off the hot path
        if decision.restartsKokoro { voices.restartKokoro() }
        write("\(engine.rawValue) skipped: \(error)\(decision.seconds.map { ", off for \(Int($0)) s" } ?? "")")
        if decision.mayEndFishFreeTier, case EngineError.status(let code) = error {
            write("⚠️ FISH REFUSED \(settings(.fish).model ?? "s2.1-pro-free") (\(code)): the free tier may have ended; the chain falls through for an hour; check fish.audio")
        }
    }
}
