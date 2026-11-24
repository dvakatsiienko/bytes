import Foundation

struct ElevenLabs: VoiceEngine {
    // female only (dima's blind test). premades answered 200 on the restricted key; charlotte and aria are library
    // voices, which answer 402 on free and restricted keys (2026-09-29)
    static let facts = EngineFacts(label: "ElevenLabs", keyName: "ELEVENLABS_API_KEY", streams: true, voices: [
        Voice(id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah"),
        Voice(id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura"),
        Voice(id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice"),
        Voice(id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda"),
        Voice(id: "cgSgspJ2msm6clMCkdW9", name: "Jessica"),
        Voice(id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily"),
    ])
    private let net: any Net

    init(_ parts: EngineParts) { net = parts.net }

    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces {
        guard let key else { throw EngineError.noKey }
        guard let voice = settings.voice(for: chunk.lang) else { throw EngineError.noVoice }
        return streamed(try post(
            "https://api.elevenlabs.io/v1/text-to-speech/\(voice)/stream?output_format=pcm_24000",
            ["language_code": chunk.lang.rawValue, "model_id": settings.model ?? "eleven_v4_turbo", "text": chunk.text],
            headers: ["xi-api-key": key]
        ), net)
    }

    // needs the key's «User» permission (user_read); a key without it answers 401 and the card keeps its last state
    func balance(key: String?, _ settings: EngineConfig) async -> Balance? {
        guard let key else { return nil }
        var request = URLRequest(url: URL(string: "https://api.elevenlabs.io/v1/user/subscription")!)
        request.setValue(key, forHTTPHeaderField: "xi-api-key")
        guard let json = await jsonObject(request, net), let used = json["character_count"] as? Int, let limit = json["character_limit"] as? Int else { return nil }
        let left = limit - used
        let refills = (json["next_character_count_reset_unix"] as? Double).map(Date.init(timeIntervalSince1970:))
        let when = refills.map { ", refills \($0.formatted(.dateTime.month(.abbreviated).day()))" } ?? ""
        // a sentence costs 30–200 credits, so under 100 left a press fails more often than it plays
        return Balance(left: Double(left), refills: refills, empty: left < 100 ? "\(left) of \(limit) credits left\(when)" : nil)
    }
}
