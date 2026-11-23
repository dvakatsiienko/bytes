import Foundation

// :7385, clear of chords' worktree daemon on :7383
let kokoroURL = URL(string: "http://127.0.0.1:7385")!

func kokoroRequest(_ text: String, voice: String?) -> URLRequest {
    var request = URLRequest(url: kokoroURL.appending(path: "v1/audio/speech"))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "content-type")
    request.httpBody = try? JSONSerialization.data(withJSONObject: [
        "input": text, "model": "mlx-community/Kokoro-82M-bf16", "response_format": "pcm", "voice": voice ?? "af_heart",
    ])
    return request
}

func kokoroReady() async -> Bool {
    var request = URLRequest(url: kokoroURL.appending(path: "docs"))
    request.timeoutInterval = 1
    return ((try? await URLSession.shared.data(for: request))?.1 as? HTTPURLResponse)?.statusCode == 200
}

func kokoroPCM(_ text: String, voice: String?) async throws -> Data {
    let (data, response) = try await URLSession.shared.data(for: kokoroRequest(text, voice: voice))
    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
    guard status == 200 else { throw EngineError.status(status) }
    return data
}
