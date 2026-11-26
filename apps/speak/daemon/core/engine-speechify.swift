import Foundation

struct Speechify: VoiceEngine {
    // female, its staff picks for english (the `staff_pick_rank` its voice list gives, 26 Nov 2026); harper and geffen
    // scored 4/5 in dima's blind booth. each answered a real call with audio on 26 Nov
    static let facts = EngineFacts(label: "Speechify", keyName: "SPEECHIFY_API_KEY", languages: [.en], voices: [
        Voice(id: "harper_32", name: "Harper"),
        Voice(id: "beatrice_32", name: "Beatrice"),
        Voice(id: "imogen_32", name: "Imogen"),
        Voice(id: "geffen_32", name: "Geffen"),
        Voice(id: "carly", name: "Carly"),
    ])
    private static let model = "simba-3.5"
    private let net: any Net

    init(_ parts: EngineParts) { net = parts.net }

    // the endpoint that answers whole, with a word's place and time in the text it was sent
    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces {
        guard let key else { throw EngineError.noKey }
        let request = try post(
            "https://api.sws.speechify.com/v1/audio/speech",
            ["audio_format": "pcm", "input": chunk.text, "model": settings.model ?? Self.model, "voice_id": settings.voice(for: chunk.lang) ?? "harper_32"],
            headers: ["authorization": "Bearer \(key)"]
        )
        let text = chunk.text
        return rendered(request, net, answer: { try speechifyAnswer($0, text: text) })
    }
}

// its pcm is s16le mono 24 kHz, as base64; its marks count unicode scalars of the text (a live call with «𝔸 é 🎉» in
// it, 26 Nov), turned here into utf-16 units
func speechifyAnswer(_ body: Data, text: String) throws -> Rendered {
    let json = try JSONSerialization.jsonObject(with: body) as? [String: Any]
    let pcm = Data(base64Encoded: json?["audio_data"] as? String ?? "") ?? Data()
    let words = ((json?["speech_marks"] as? [String: Any])?["chunks"] as? [[String: Any]] ?? []).filter { $0["type"] as? String == "word" }
    let scalars = Array(text.unicodeScalars)
    let unit = { (scalar: Int) in String(String.UnicodeScalarView(scalars.prefix(scalar))).utf16.count }
    let marks = words.compactMap { word -> Mark? in
        guard let start = word["start"] as? Int, let end = word["end"] as? Int, let ms = word["start_time"] as? Double, 0 <= start, start < end, end <= scalars.count else { return nil }
        return Mark(range: unit(start)..<unit(end), seconds: ms / 1000)
    }
    return Rendered(pcm: pcm, marks: marks)
}
