import Foundation

// all a pill shows, as one value
struct PillModel: Encodable, Equatable {
    var isReading = true
    var isPaused = false
    var isStuck = false
    var sentence: Sentence?
    // what stands in the sentence's row in the pill's own voice
    var notice: Notice?
    var openRow: OpenRow?
    var hint: Hint?

    struct Sentence: Encodable, Equatable {
        let text: String
        // nil where the engine gave no word timings
        var word: Word?

        // what the row draws: the heard part, the lit word, what is still ahead. the word is lit only from a mark, so
        // with none the whole sentence is heard and nothing is lit
        var parts: (heard: String, lit: String, ahead: String) {
            guard let word, word.offset >= 0, text.dropFirst(word.offset).hasPrefix(word.text) else { return (text, "", "") }
            let start = text.index(text.startIndex, offsetBy: word.offset)
            let end = text.index(start, offsetBy: word.text.count)
            return (String(text[..<start]), String(text[start..<end]), String(text[end...]))
        }
    }
    struct Word: Encodable, Equatable {
        let text: String
        // its place in the sentence, in characters
        let offset: Int
        let isHeld: Bool
    }
    enum Notice: Encodable, Equatable {
        case codeBlock
        case fellThrough(from: Engine, to: Engine)

        var line: String {
            switch self {
            case .codeBlock: "a code block. skipped."
            case .fellThrough(let from, let to): "\(from) is out of quota. \(to) reads."
            }
        }
        func encode(to encoder: any Encoder) throws {
            var container = encoder.singleValueContainer()
            try container.encode(line)
        }
    }
    struct OpenRow: Encodable, Equatable {
        enum Control: String, Encodable { case volume, speed }
        let control: Control
        let value: Double
    }
    struct Hint: Encodable, Equatable {
        enum Control: String, Encodable { case stop }
        let control: Control
        let text: String
    }

    var json: String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
        return String(decoding: (try? encoder.encode(self)) ?? Data(), as: UTF8.self)
    }
}

// the states behind the pill's sealed boards, each one fixed: looked at and compared with no read
enum PillFixture: String, CaseIterable {
    case reading, volumeRow = "volume-row", speedRow = "speed-row", paused, fellThrough = "fell-through", hover
    case longLine = "long-line", idleStuck = "idle-stuck", noWordTimings = "no-word-timings", codeBlock = "code-block"

    var model: PillModel {
        let line = "The kettle clicks off and the room is quiet."
        let long = "Past the last houses the road bends twice, drops under the railway, and comes out beside a field that nobody has mown since the spring."
        var model = PillModel(sentence: .init(text: line, word: .init(text: "kettle", offset: 4, isHeld: false)))
        switch self {
        case .reading: break
        case .volumeRow: model.openRow = .init(control: .volume, value: 80)
        case .speedRow: model.openRow = .init(control: .speed, value: 1.25)
        case .paused:
            model.isPaused = true
            model.sentence?.word = .init(text: "kettle", offset: 4, isHeld: true)
        case .fellThrough:
            model.sentence = nil
            model.notice = .fellThrough(from: .fish, to: .kokoro)
        case .hover: model.hint = .init(control: .stop, text: "stop F5")
        case .longLine: model.sentence = .init(text: long, word: .init(text: "railway", offset: 59, isHeld: false))
        case .idleStuck: model = PillModel(isReading: false, isStuck: true)
        case .noWordTimings: model.sentence?.word = nil
        case .codeBlock:
            model.sentence = nil
            model.notice = .codeBlock
        }
        return model
    }
}
