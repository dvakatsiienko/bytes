import Foundation

struct MacVoice: VoiceEngine {
    // with none named, en is macos's Spoken Content voice, which no voice list exposes, and uk and ru the best installed
    static let facts = EngineFacts(label: "macOS voice", voices: Lang.allCases.map {
        Voice(id: "", name: $0 == .en ? "Spoken Content voice (Siri)" : "best installed", lang: $0)
    })
    private let mac: any MacVoices

    init(_ parts: EngineParts) { mac = parts.mac }

    func voices() -> [Voice] { Self.facts.voices + mac.installed() }
    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) -> Pieces { mac.render(chunk, settings) }
}
