import Foundation

// the sound of the sentences read last, in memory alone, so one read twice is rendered once. it holds no text: a sentence
// is its hash, and the process's own seed makes that hash mean nothing outside it
struct SoundCache {
    // everything that changes a render; the speed and the gain are the player's
    struct Key: Hashable {
        private let sentence: Int
        private let lang: Lang
        private let engine: Engine
        private let voice: String?
        private let model: String?

        // nil where the same settings can sound another way: the mac voice is picked in System Settings
        init?(_ chunk: Chunk, _ engine: Engine, _ settings: EngineConfig) {
            guard engine != .system else { return nil }
            var hasher = Hasher()
            hasher.combine(chunk.text)
            sentence = hasher.finalize()
            lang = chunk.lang
            self.engine = engine
            voice = settings.voice(for: chunk.lang)
            model = settings.model
        }
    }

    private let cap: Int
    private var sounds: [Key: [Rendered]] = [:]
    private var order: [Key] = []
    private(set) var bytes = 0

    // 32 MB is about 11 minutes
    init(cap: Int = 32 << 20) { self.cap = cap }

    subscript(key: Key?) -> [Rendered]? { key.flatMap { sounds[$0] } }

    // the oldest goes first
    mutating func keep(_ sound: [Rendered], as key: Key?) {
        let size = Self.size(sound)
        guard let key, sounds[key] == nil, size > 0, size <= cap else { return }
        sounds[key] = sound
        order.append(key)
        bytes += size
        while bytes > cap {
            bytes -= sounds.removeValue(forKey: order.removeFirst()).map(Self.size) ?? 0
        }
    }

    private static func size(_ sound: [Rendered]) -> Int { sound.reduce(0) { $0 + $1.pcm.count } }
}
