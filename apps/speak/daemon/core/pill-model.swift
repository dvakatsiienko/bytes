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
        enum Control: String, Encodable {
            case volume, speed

            var range: ClosedRange<Double> { self == .volume ? Config.volumes : EngineConfig.speeds }

            // ↑↓ one step, ⇧ four, ⌥ a fine one: volume 1, 4, 0.1; speed 0.01, 0.04, 0.005
            func stepped(_ value: Double, up: Bool, shift: Bool, option: Bool) -> Double {
                let unit = self == .volume ? 1.0 : 0.01
                let step = option ? (self == .volume ? 0.1 : 0.005) : shift ? unit * 4 : unit
                return clamped(value + (up ? step : -step))
            }

            // a typed value, read as the box shows it; nil for words
            func typed(_ text: String) -> Double? {
                Double(text.trimmingCharacters(in: .whitespaces).replacingOccurrences(of: "×", with: "").replacingOccurrences(of: ",", with: ".")).map(clamped)
            }

            func clamped(_ value: Double) -> Double { ((min(max(value, range.lowerBound), range.upperBound)) * 1000).rounded() / 1000 }

            var keys: [(key: String, step: String)] {
                self == .volume ? [("↑↓", "1"), ("⇧", "4"), ("⌥", "0.1"), ("⏎", "set")] : [("↑↓", "0.01"), ("⇧", "0.04"), ("⌥", "fine"), ("⏎", "set")]
            }
        }
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
