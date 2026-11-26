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
        ]) + check("the open row's keys", [
            ("↑ on volume", "\(PillModel.OpenRow.Control.volume.stepped(72, up: true, shift: false, option: false))", "73.0"),
            ("⇧↓ on volume", "\(PillModel.OpenRow.Control.volume.stepped(72, up: false, shift: true, option: false))", "68.0"),
            ("⌥↑ on volume", "\(PillModel.OpenRow.Control.volume.stepped(72, up: true, shift: false, option: true))", "72.1"),
            ("↑ at the top stays", "\(PillModel.OpenRow.Control.volume.stepped(100, up: true, shift: true, option: false))", "100.0"),
            ("↑ on speed", "\(PillModel.OpenRow.Control.speed.stepped(1.15, up: true, shift: false, option: false))", "1.16"),
            ("⇧↓ on speed", "\(PillModel.OpenRow.Control.speed.stepped(1.15, up: false, shift: true, option: false))", "1.11"),
            ("↓ at the bottom stays", "\(PillModel.OpenRow.Control.speed.stepped(0.5, up: false, shift: false, option: false))", "0.5"),
            ("a typed speed with its ×", "\(PillModel.OpenRow.Control.speed.typed("1,3×") ?? -1)", "1.3"),
            ("a typed volume past the top", "\(PillModel.OpenRow.Control.volume.typed("140") ?? -1)", "100.0"),
            ("a word typed", "\(PillModel.OpenRow.Control.volume.typed("loud") ?? -1)", "-1.0"),
        ]) + check("the sentence comes up with its sound", [
            ("before its sound, none", shown(at: -1), "-"),
            ("at its start, the first", shown(at: 0), "One."),
            ("between, still the first", shown(at: 1.9), "One."),
            ("past both starts, the last", shown(at: 5), "Two."),
            ("a notice stands over the sentences queued before it", shown(at: 0, notice: true, then: 5), "a code block. skipped."),
            ("a sentence queued after a notice takes its place", shown(at: 0, notice: true, queuedAfter: ("Three.", 4), then: 5), "Three."),
            ("a read's end clears what is queued", shown(at: 0, leave: true), "-"),
        ])
    }

    private static func shown(at position: Double, notice: Bool = false, queuedAfter: (String, Double)? = nil, then later: Double? = nil, leave: Bool = false) -> String {
        var state = PillState()
        state.queue("One.", from: 0)
        state.queue("Two.", from: 2)
        state.advance(to: position)
        if notice { state.noticed(.codeBlock) }
        if let queuedAfter { state.queue(queuedAfter.0, from: queuedAfter.1) }
        if let later { state.advance(to: later) }
        if leave {
            state.leave()
            state.advance(to: 10)
        }
        return state.notice?.line ?? state.sentence?.text ?? "-"
    }
}
