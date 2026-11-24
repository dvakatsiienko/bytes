// the engines the daemon knows: an engine is a case, its line in `type`, and its own file, engine-<id>.swift
import Foundation

enum Engine: String, CaseIterable {
    // the order the page draws those outside a chain in
    case elevenlabs, kokoro, system, fish, gemini

    var type: any VoiceEngine.Type {
        switch self {
        case .elevenlabs: ElevenLabs.self
        case .kokoro: Kokoro.self
        case .system: MacVoice.self
        case .fish: Fish.self
        case .gemini: Gemini.self
        }
    }

    var facts: EngineFacts { type.facts }
    var isCloud: Bool { facts.keyName != nil }
    func speaks(_ lang: Lang) -> Bool { facts.languages.contains(lang) }
}

struct EngineFacts {
    let label: String
    // its key's name in the environment; none: it needs no key, and is no cloud engine
    var keyName: String?
    var languages = Lang.allCases
    // answers as it renders, so the next chunk is worth opening ahead
    var streams = false
    // a server on this mac the daemon keeps alive, which answers a chunk whole
    var isLocalServer = false
    var voices: [Voice] = []
}

// a voice one can pick; no language: it speaks every one its engine does
struct Voice: Equatable, Encodable {
    let id: String
    let name: String
    var lang: Lang?
}

// a piece of a chunk's sound, s16le mono 24 kHz, and the words that begin in it
struct Rendered: Equatable {
    let pcm: Data
    var marks: [Mark] = []
}

// a word: its place in the chunk's text, and when it begins from the chunk's start
struct Mark: Equatable {
    let range: Range<Int>
    let seconds: Double
}

typealias Pieces = AsyncThrowingStream<Rendered, Error>

protocol VoiceEngine {
    static var facts: EngineFacts { get }
    // a log line of its own for a refusal
    static func refusalNote(status: Int, model: String?) -> String?
    init(_ parts: EngineParts)
    @MainActor func voices() -> [Voice]
    // ended by whoever stops listening
    @MainActor func render(_ chunk: Chunk, _ settings: EngineConfig, key: String?) throws -> Pieces
    // what is left at the provider; nil when it tells nothing
    func balance(key: String?, _ settings: EngineConfig) async -> Balance?
}

extension VoiceEngine {
    static func refusalNote(status: Int, model: String?) -> String? { nil }
    @MainActor func voices() -> [Voice] { Self.facts.voices }
    func balance(key: String?, _ settings: EngineConfig) async -> Balance? { nil }
}

// what an engine reaches outside itself through
struct EngineParts {
    let net: any Net
    let mac: any MacVoices
}

protocol Net: Sendable {
    // an answer as it comes
    func open(_ request: URLRequest) async throws -> (status: Int, body: AsyncThrowingStream<Data, Error>)
    func whole(_ request: URLRequest) async throws -> (status: Int, body: Data)
}

// macos's own voices
protocol MacVoices: Sendable {
    @MainActor func installed() -> [Voice]
    @MainActor func render(_ chunk: Chunk, _ settings: EngineConfig) -> Pieces
}

// a post with a json body
func post(_ url: String, _ body: [String: Any], headers: [String: String] = [:]) throws -> URLRequest {
    guard let url = URL(string: url) else { throw EngineError.noVoice }
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "content-type")
    for (name, value) in headers { request.setValue(value, forHTTPHeaderField: name) }
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    return request
}

// off main: on it, a buffered answer starved the deadline's timer (fish played at 604 ms under a 400 ms one)
private func pieces(_ make: @escaping @Sendable (Pieces.Continuation) async throws -> Void) -> Pieces {
    Pieces { continuation in
        let task = Task {
            do {
                try await make(continuation)
                continuation.finish()
            } catch {
                continuation.finish(throwing: error)
            }
        }
        continuation.onTermination = { _ in task.cancel() }
    }
}

// samples as they come; one may be cut in the middle of two bytes
func streamed(_ request: URLRequest, _ net: any Net) -> Pieces {
    pieces { continuation in
        let (status, body) = try await net.open(request)
        var buffer = Data()
        guard status == 200 else {
            do { for try await data in body { buffer.append(data); if buffer.count > 4096 { break } } } catch {}
            throw engineError(status: status, body: buffer)
        }
        for try await data in body {
            buffer.append(data)
            let pcm = Data(buffer.prefix(buffer.count & ~1))
            buffer = Data(buffer.dropFirst(pcm.count))
            if !pcm.isEmpty { continuation.yield(Rendered(pcm: pcm)) }
        }
    }
}

// one piece, once the whole answer is here
func rendered(_ request: URLRequest, _ net: any Net, _ pcm: @escaping @Sendable (Data) throws -> Data = { $0 }) -> Pieces {
    pieces { continuation in
        let (status, body) = try await net.whole(request)
        guard status == 200 else { throw engineError(status: status, body: body) }
        continuation.yield(Rendered(pcm: try pcm(body)))
    }
}
