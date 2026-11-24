import Foundation

struct Fish: VoiceEngine {
    // its library is community clones, only as good as the uploaded clip; dima kept Sarah alone after a listen
    // (2026-09-29). s2 reads any language in her voice
    static let facts = EngineFacts(label: "Fish", keyName: "FISH_API_KEY", streams: true, voices: [Voice(id: "933563129e564b19a115bedd57b7406a", name: "Sarah")])
    // no character cap, free until 2026-11-30 (fish's blog also names 08-31; a live call answered 200 on 2026-11-19);
    // after that its non-2xx drops the tier by itself
    private static let model = "s2.1-pro-free"
    private let net: any Net

    init(_ parts: EngineParts) { net = parts.net }

    // its refusal reads as the free tier's end
    static func refusalNote(status: Int, model: String?) -> String? {
        guard [402, 429].contains(status) else { return nil }
        return "⚠️ FISH REFUSED \(model ?? Self.model) (\(status)): the free tier may have ended; the chain falls through for an hour; check fish.audio"
    }

    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces {
        guard let key else { throw EngineError.noKey }
        guard let voice = settings.voice(for: chunk.lang) else { throw EngineError.noVoice }
        return streamed(try post(
            "https://api.fish.audio/v1/tts",
            ["format": "pcm", "latency": "balanced", "reference_id": voice, "sample_rate": 24000, "text": chunk.text],
            headers: ["authorization": "Bearer \(key)", "model": settings.model ?? Self.model]
        ), net)
    }

    // the free model draws on no balance; a paid one spends the pay-as-you-go api credit, which has no refill date
    func balance(key: String?, _ settings: EngineConfig) async -> Balance? {
        guard !(settings.model ?? Self.model).hasSuffix("-free") else { return Balance(left: .infinity) }
        guard let key else { return nil }
        var request = URLRequest(url: URL(string: "https://api.fish.audio/wallet/self/api-credit")!)
        request.setValue("Bearer \(key)", forHTTPHeaderField: "authorization")
        guard let credit = (await jsonObject(request, net)?["credit"] as? String).flatMap(Double.init) else { return nil }
        return Balance(left: credit, empty: credit > 0 ? nil : "api balance $0 — top up at fish.audio")
    }
}
