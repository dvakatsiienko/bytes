// each engine's chunk, from its render to the player
import Foundation

@MainActor
final class Voices: ChunkVoices {
    private let player: Player
    private let keys: Keys
    private let servers: [Engine: KokoroServer]
    private let engines: [Engine: any VoiceEngine]
    private var cache = SoundCache()
    // asked before its turn: the next chunk, whose wait for the first sound (0.5–3 s on fish's free tier) then hides
    // behind the audio, or a local server's render of this one, while a cloud engine races its deadline
    private var ahead: [Engine: (text: String, key: SoundCache.Key?, pieces: Pieces)] = [:]

    init(_ parts: EngineParts, player: Player, keys: Keys, servers: [Engine: KokoroServer]) {
        self.player = player
        self.keys = keys
        self.servers = servers
        engines = Dictionary(uniqueKeysWithValues: Engine.allCases.map { ($0, $0.type.init(parts)) })
    }

    func voices(of engine: Engine) -> [Voice] { engines[engine]?.voices() ?? [] }
    func hasKey(_ engine: Engine) -> Bool { keys[engine] != nil }
    func reloadMissingKeys() { keys.reloadIfMissing() }
    func restartServer(of engine: Engine) { Task { await servers[engine]?.warm() } }

    func balances(_ settings: (Engine) -> EngineConfig) async -> [Engine: Balance] {
        await withTaskGroup(of: (Engine, Balance?).self) { group in
            for (id, engine) in engines {
                let key = keys[id], settings = settings(id)
                group.addTask { (id, await engine.balance(key: key, settings)) }
            }
            return await group.reduce(into: [:]) { $0[$1.0] = $1.1 }
        }
    }

    // a stream nobody reads ends by itself
    func dropAhead() { ahead = [:] }

    func openAhead(_ chunk: Chunk, with engine: Engine, settings: EngineConfig) {
        let key = SoundCache.Key(chunk, engine, settings)
        guard cache[key] == nil else { return }
        ahead[engine] = (try? engines[engine]?.render(chunk, settings, key: keys[engine])).map { (chunk.text, key, $0) }
    }

    func speak(_ chunk: Chunk, with engine: Engine, settings: @escaping () -> EngineConfig, deadline: Duration?, onAudio: @escaping (_ isCached: Bool) -> Void) async throws {
        ahead = ahead.filter { $0.value.text == chunk.text }
        let key = SoundCache.Key(chunk, engine, settings())
        // a voice changed since is asked anew
        let opened = ahead.removeValue(forKey: engine).flatMap { $0.key == key ? $0.pieces : nil }
        if let sound = cache[key] {
            let pieces = Pieces { line in
                sound.forEach { line.yield($0) }
                line.finish()
            }
            do {
                try await play(pieces, of: chunk, into: player, settings: settings, deadline: deadline) { onAudio(true) }
            } catch where !(error is CancellationError) {
                // the output's failure, never the engine's: it was not asked
                throw EngineError.noSound
            }
        } else if let pieces = try opened ?? engines[engine]?.render(chunk, settings(), key: keys[engine]) {
            let sound = try await play(pieces, of: chunk, into: player, settings: settings, deadline: deadline) { onAudio(false) }
            cache.keep(sound, as: key)
        }
    }
}
