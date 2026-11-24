import Foundation

struct Kokoro: VoiceEngine {
    // every af_ and bf_ voice answered on the warm server (2026-09-29)
    static let facts = EngineFacts(
        label: "Kokoro (local)", languages: [.en], isLocalServer: true,
        voices: [
            "af_heart", "af_bella", "af_nicole", "af_sarah", "af_sky", "af_nova", "af_river", "af_jessica", "af_alloy", "af_aoede", "af_kore",
            "bf_emma", "bf_isabella", "bf_alice", "bf_lily",
        ].map { Voice(id: $0, name: $0) }
    )
    // clear of chords' worktree daemon on :7383
    static let port = 7385
    private static let url = "http://127.0.0.1:\(port)"
    private let net: any Net

    init(_ parts: EngineParts) { net = parts.net }

    // the server answers only once the whole chunk is rendered, so there is nothing to stream
    func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces {
        rendered(try Self.request(chunk.text, settings), net)
    }

    static func request(_ text: String, _ settings: EngineConfig) throws -> URLRequest {
        try post("\(url)/v1/audio/speech", [
            "input": text, "model": "mlx-community/Kokoro-82M-bf16", "response_format": "pcm", "voice": settings.voice(for: .en) ?? facts.voices[0].id,
        ])
    }

    // answered by a server that is up
    static func readyRequest() -> URLRequest {
        var request = URLRequest(url: URL(string: "\(url)/docs")!)
        request.timeoutInterval = 1
        return request
    }
}
