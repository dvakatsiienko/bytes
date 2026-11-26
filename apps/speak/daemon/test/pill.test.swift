// the pill's fixed states, each by its own mark
import Foundation

enum PillTest {
    static func failures() -> Int {
        let printed = { (fixture: PillFixture) in fixture.model.json }
        let word = #""word":{"isHeld":false,"offset":4,"text":"kettle"}"#
        let line = #""text":"The kettle clicks off and the room is quiet.""#
        let marks: [(PillFixture, String)] = [
            (.reading, #"{"isPaused":false,"isReading":true,"isStuck":false,"sentence":{\#(line),\#(word)}}"#),
            (.volumeRow, #""openRow":{"control":"volume","value":80}"#),
            (.speedRow, #""openRow":{"control":"speed","value":1.25}"#),
            (.paused, #""isPaused":true,"isReading":true,"isStuck":false,"sentence":{\#(line),"word":{"isHeld":true,"offset":4,"text":"kettle"}}"#),
            (.fellThrough, #""notice":"fish is out of quota. kokoro reads.""#),
            (.hover, #""hint":{"control":"stop","text":"stop F5"}"#),
            (.longLine, #"mown since the spring.","word":{"isHeld":false,"offset":59,"text":"railway"}"#),
            (.idleStuck, #"{"isPaused":false,"isReading":false,"isStuck":true}"#),
            (.noWordTimings, #""sentence":{\#(line)}"#),
            (.codeBlock, #""notice":"a code block. skipped.""#),
        ]
        let places = PillFixture.allCases.compactMap { fixture -> String? in
            guard let sentence = fixture.model.sentence, let word = sentence.word else { return nil }
            return sentence.text.dropFirst(word.offset).hasPrefix(word.text) ? nil : fixture.rawValue
        }
        return check("pill state", marks.map { fixture, mark in
            (fixture.rawValue, printed(fixture).contains(mark) ? mark : printed(fixture), mark)
        }) + check("pill states", [
            ("the ten", marks.map(\.0.rawValue).joined(separator: " "), "reading volume-row speed-row paused fell-through hover long-line idle-stuck no-word-timings code-block"),
            ("each its own", "\(Set(PillFixture.allCases.map(printed)).count)", "10"),
            ("a row in two alone", PillFixture.allCases.filter { printed($0).contains("openRow") }.map(\.rawValue).joined(separator: " "), "volume-row speed-row"),
            ("a hint in one alone", PillFixture.allCases.filter { printed($0).contains("hint") }.map(\.rawValue).joined(separator: " "), "hover"),
            ("no sentence", PillFixture.allCases.filter { !printed($0).contains("sentence") }.map(\.rawValue).joined(separator: " "), "fell-through idle-stuck code-block"),
            ("an unknown one names the ten", "\(ArgumentsError.unknownPill("nope"))", "unknown pill «nope» — one of: reading, volume-row, speed-row, paused, fell-through, hover, long-line, idle-stuck, no-word-timings, code-block"),
            ("a word lit stands in its sentence", places.joined(separator: " "), ""),
        ]) + check("the sentence row", [
            ("a mark lights its word", "\(PillFixture.reading.model.sentence!.parts)", #"(heard: "The ", lit: "kettle", ahead: " clicks off and the room is quiet.")"#),
            ("no mark lights nothing", "\(PillFixture.noWordTimings.model.sentence!.parts)", #"(heard: "The kettle clicks off and the room is quiet.", lit: "", ahead: "")"#),
            ("a mark off its word lights nothing", "\(PillModel.Sentence(text: "one two", word: .init(text: "two", offset: 0, isHeld: false)).parts.lit)", ""),
        ])
    }
}
