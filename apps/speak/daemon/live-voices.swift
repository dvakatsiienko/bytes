// each engine's chunk, from its request to the output it plays on
import Foundation

@MainActor
final class LiveVoices: ChunkVoices {
    private let player: Player
    private let macVoice: VoiceOutput
    private let keys: Keys
    private let kokoro: KokoroServer
    private var kokoroPrefetch: (text: String, task: Task<Data, Error>)?
    // the next chunk's request, opened once this one is heard: its first-audio wait (0.5–3 s on fish's free tier)
    // hides behind the audio instead of sitting between two sentences
    private var cloudPrefetch: (engine: Engine, text: String, task: Task<(URLSession.AsyncBytes, URLResponse), Error>)?

    init(player: Player, macVoice: VoiceOutput, keys: Keys, kokoro: KokoroServer) {
        self.player = player
        self.macVoice = macVoice
        self.keys = keys
        self.kokoro = kokoro
    }

    func hasKey(_ engine: Engine) -> Bool { keys[engine] != nil }
    func reloadMissingKeys() { keys.reloadIfMissing() }
    func restartKokoro() { Task { await kokoro.warm() } }

    func quotas(fish settings: EngineConfig) async -> [(Engine, Quota?)] {
        let elevenKey = keys[.elevenlabs], fishKey = keys[.fish], fishModel = settings.model ?? "s2.1-pro-free"
        async let eleven = Quota.elevenlabs(key: elevenKey)
        async let fish = Quota.fish(key: fishKey, model: fishModel)
        return [(.elevenlabs, await eleven), (.fish, await fish)]
    }

    func dropAhead() {
        cloudPrefetch?.task.cancel()
        cloudPrefetch = nil
        kokoroPrefetch?.task.cancel()
        kokoroPrefetch = nil
    }

    func renderKokoroAhead(_ chunk: Chunk, settings: EngineConfig) {
        let voice = settings.voice(for: .en)
        kokoroPrefetch = (chunk.text, Task { try await kokoro.pcm(chunk.text, voice: voice) })
    }

    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig) {
        guard let request = try? request(for: engine, chunk, key: keys[engine], settings: settings) else { return }
        cloudPrefetch?.task.cancel()
        cloudPrefetch = (engine, chunk.text, Task { try await URLSession.shared.bytes(for: request) })
    }

    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws {
        switch engine {
        case .system:
            await player.drained()
            try Task.checkCancellation()
            await macVoice.speak(chunk, settings(), onFirstWord: onAudio)
        case .gemini:
            // read once: a save while it renders waits for the next chunk
            let settings = settings()
            let pcm = try await geminiPCM(chunk, key: keys[.gemini], settings: settings)
            try Task.checkCancellation()
            try player.schedule(pcm, settings)
            onAudio()
        // the kokoro server answers only once the whole chunk is rendered, so there is nothing to stream
        case .kokoro:
            let prefetched = kokoroPrefetch.flatMap { $0.text == chunk.text ? $0.task : nil }
            kokoroPrefetch = nil
            let pcm = if let prefetched { try await prefetched.value } else { try await kokoro.pcm(chunk.text, voice: settings().voice(for: .en)) }
            // a render that lands after a stop never reaches the player
            try Task.checkCancellation()
            try player.schedule(pcm, settings())
            onAudio()
        default:
            let ahead = cloudPrefetch.flatMap { $0.engine == engine && $0.text == chunk.text ? $0.task : nil }
            if ahead == nil { cloudPrefetch?.task.cancel() }
            cloudPrefetch = nil
            let request = try request(for: engine, chunk, key: keys[engine], settings: settings())
            let open = ahead ?? Task { try await URLSession.shared.bytes(for: request) }
            try await stream(open, into: player, settings(), deadline: deadline, onAudio: onAudio)
        }
    }
}
