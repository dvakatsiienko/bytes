import Foundation

// one finished read, as one json line: numbers and names, never a word of it
struct ReadRecord: Encodable, Equatable {
    // the sound ran out, a stop, a newer read or a preview, or no engine spoke
    enum Outcome: String, Encodable { case finished, stopped, overtaken, unspoken }

    let schema = 1
    let time: Date
    // the app in front at the press; none for the socket's read
    let app: String?
    let wordsHeard: Int
    // by the cleaner's rule that cut them
    let charsCut: [String: Int] = [:]
    let secondsHeard: Double
    // in the order they were first heard
    let engines: [Engine]
    let outcome: Outcome

    enum CodingKeys: CodingKey { case schema, time, app, wordsHeard, charsCut, secondsHeard, engines, outcome }

    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(schema, forKey: .schema)
        try container.encode(time, forKey: .time)
        try container.encode(app, forKey: .app)
        try container.encode(wordsHeard, forKey: .wordsHeard)
        try container.encode(charsCut, forKey: .charsCut)
        try container.encode((secondsHeard * 10).rounded() / 10, forKey: .secondsHeard)
        try container.encode(engines.map(\.rawValue), forKey: .engines)
        try container.encode(outcome, forKey: .outcome)
    }

    var line: String? {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
        return (try? encoder.encode(self)).map { String(decoding: $0, as: UTF8.self) }
    }
}

// what a read has had so far
struct ReadTally {
    let time: Date
    let app: String?
    private var engines: [Engine] = []
    private var chunks: [(words: Int, start: Double, end: Double?)] = []

    init(time: Date, app: String?) {
        self.time = time
        self.app = app
    }

    // `start` is where its sound begins, in seconds into the read's
    mutating func began(_ text: String, start: Double) {
        chunks.append((text.split(whereSeparator: \.isWhitespace).filter { $0.contains { $0.isLetter || $0.isNumber } }.count, start, nil))
    }

    mutating func heard(_ engine: Engine) {
        if !engines.contains(engine) { engines.append(engine) }
    }

    mutating func ended(end: Double) {
        if let last = chunks.indices.last { chunks[last].end = end }
    }

    // a sentence stopped in the middle counts by the share of its sound that was heard. `position` is how much sounded,
    // `sound` how much there is, `dropped` the stretches of it that never sounded
    func record(_ outcome: ReadRecord.Outcome, heard: Double, position: Double, sound: Double, dropped: [Range<Double>] = []) -> ReadRecord {
        // an end that came by itself is a moment early or late on the clock
        let head = dropped.reduce(outcome == .finished ? position + 1 : position) { $0 + $1.upperBound - $1.lowerBound }
        let words = chunks.reduce(0) { sum, chunk in
            let end = chunk.end ?? sound
            guard end > chunk.start else { return sum }
            let heard = dropped.reduce(max(0, min(head, end) - chunk.start)) { left, gap in
                left - max(0, min(gap.upperBound, end, head) - max(gap.lowerBound, chunk.start))
            }
            // a whole sentence's share is a hair under one now and then
            return sum + Int(Double(chunk.words) * max(0, heard) / (end - chunk.start) + 1e-6)
        }
        return ReadRecord(
            time: time, app: app, wordsHeard: words, secondsHeard: heard, engines: engines,
            outcome: outcome == .finished && engines.isEmpty ? .unspoken : outcome
        )
    }
}

// the file of them, dima's alone
final class ReadRecords {
    private let path: String
    private let write: (String) -> Void

    init(path: String, log write: @escaping (String) -> Void) {
        self.path = path
        self.write = write
    }

    func add(_ record: ReadRecord) {
        guard let line = record.line else { return }
        let file = open(path, O_WRONLY | O_APPEND | O_CREAT, 0o600)
        guard file >= 0 else { return write("read record: not written — \(String(cString: strerror(errno)))") }
        let handle = FileHandle(fileDescriptor: file, closeOnDealloc: true)
        do { try handle.write(contentsOf: Data((line + "\n").utf8)) } catch { write("read record: not written — \(error)") }
    }
}
