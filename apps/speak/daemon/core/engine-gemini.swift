import Foundation

struct Gemini: VoiceEngine {
    static let facts = EngineFacts(label: "Gemini", keyName: "GEMINI_API_KEY", voices: [
        Voice(id: "Kore", name: "Kore"),
        Voice(id: "Aoede", name: "Aoede"),
        Voice(id: "Leda", name: "Leda"),
        Voice(id: "Zephyr", name: "Zephyr"),
    ])
    private let net: any Net

    init(_ parts: EngineParts) { net = parts.net }

    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces {
        guard let key else { throw EngineError.noKey }
        let voice = settings.voice(for: chunk.lang) ?? Self.facts.voices[0].id
        return rendered(try post(
            "https://generativelanguage.googleapis.com/v1beta/models/\(settings.model ?? "gemini-3.8-flash-tts"):generateContent",
            [
                "contents": [["parts": [["text": chunk.text]]]],
                "generationConfig": ["responseModalities": ["AUDIO"], "speechConfig": ["voiceConfig": ["prebuiltVoiceConfig": ["voiceName": voice]]]],
            ],
            headers: ["x-goog-api-key": key]
        ), net, samples)
    }
}

@Sendable
private func samples(_ body: Data) throws -> Data {
    let json = try JSONSerialization.jsonObject(with: body) as? [String: Any]
    let parts = ((json?["candidates"] as? [[String: Any]])?.first?["content"] as? [String: Any])?["parts"] as? [[String: Any]]
    let base64 = (parts?.first?["inlineData"] as? [String: Any])?["data"] as? String ?? ""
    let audio = Data(base64Encoded: base64) ?? Data()
    return audio.prefix(4) == Data("RIFF".utf8) ? Data(audio.dropFirst(44)) : audio
}
