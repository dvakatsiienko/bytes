import Foundation

func request(for engine: Engine, _ chunk: Chunk, key: String?, settings: EngineConfig) throws -> URLRequest {
    switch engine {
    case .elevenlabs:
        guard let key else { throw EngineError.noKey }
        // a premade voice: library voices answer 402 on free and restricted keys
        guard let voice = settings.voice(for: chunk.lang) else { throw EngineError.noVoice }
        var request = URLRequest(url: URL(string: "https://api.elevenlabs.io/v1/text-to-speech/\(voice)/stream?output_format=pcm_24000")!)
        request.httpMethod = "POST"
        request.setValue(key, forHTTPHeaderField: "xi-api-key")
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["language_code": chunk.lang.rawValue, "model_id": settings.model ?? "eleven_v4_turbo", "text": chunk.text])
        return request
    case .fish:
        guard let key else { throw EngineError.noKey }
        guard let voice = settings.voice(for: chunk.lang) else { throw EngineError.noVoice }
        // s2.1-pro-free: no character cap, free until 2026-11-30 (fish's blog also names 08-31; a live call answered 200
        // on 2026-11-19); after that its non-2xx drops the tier by itself, and a 402 or 429 logs the loud line in handle
        var request = URLRequest(url: URL(string: "https://api.fish.audio/v1/tts")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(key)", forHTTPHeaderField: "authorization")
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.setValue(settings.model ?? "s2.1-pro-free", forHTTPHeaderField: "model")
        request.httpBody = try JSONSerialization.data(withJSONObject: [
            "format": "pcm", "latency": "balanced", "reference_id": voice, "sample_rate": 24000, "text": chunk.text,
        ])
        return request
    default:
        preconditionFailure("\(engine) is not a streaming engine")
    }
}

@MainActor
func geminiPCM(_ chunk: Chunk, key: String?, settings: EngineConfig) async throws -> Data {
    guard let key else { throw EngineError.noKey }
    let model = settings.model ?? "gemini-3.8-flash-tts"
    var request = URLRequest(url: URL(string: "https://generativelanguage.googleapis.com/v1beta/models/\(model):generateContent")!)
    request.httpMethod = "POST"
    request.setValue(key, forHTTPHeaderField: "x-goog-api-key")
    request.setValue("application/json", forHTTPHeaderField: "content-type")
    request.httpBody = try JSONSerialization.data(withJSONObject: [
        "contents": [["parts": [["text": chunk.text]]]],
        "generationConfig": ["responseModalities": ["AUDIO"], "speechConfig": ["voiceConfig": ["prebuiltVoiceConfig": ["voiceName": settings.voice(for: chunk.lang) ?? "Kore"]]]],
    ])
    let (data, response) = try await URLSession.shared.data(for: request)
    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
    guard status == 200 else { throw EngineError.status(status) }
    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    let parts = ((json?["candidates"] as? [[String: Any]])?.first?["content"] as? [String: Any])?["parts"] as? [[String: Any]]
    guard let base64 = (parts?.first?["inlineData"] as? [String: Any])?["data"] as? String, var audio = Data(base64Encoded: base64) else {
        throw EngineError.status(0)
    }
    if audio.prefix(4) == Data("RIFF".utf8) { audio = audio.dropFirst(44) }
    return Data(audio)
}
