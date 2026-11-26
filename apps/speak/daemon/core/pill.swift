// what the pill shows: the read that plays first; the admin's infinite waveform and a screenshot's sample only where
// nothing plays
struct PillState: Equatable {
    private(set) var playback = Playback.idle
    private(set) var isWaveOn = false
    private(set) var isSample = false
    // flips once per read, on the first audible reading
    var hasSignal = false
    // what stands in the sentence's row, until the read ends
    private(set) var notice: PillModel.Notice?
    // the sentence being read; its row opens only while there is one
    private(set) var sentence: PillModel.Sentence?
    // the sentences queued after it, each from where its sound starts, in seconds of sound at 1×
    private var ahead: [Queued] = []
    private struct Queued: Equatable {
        let start: Double
        let sentence: PillModel.Sentence
        // queued after the notice that stands: its sentence takes the notice's place
        var isAfterNotice = true
    }

    // a read that begins takes the pill
    mutating func follow(_ playback: Playback) {
        if let read = playback.read, read != self.playback.read { leave() }
        self.playback = playback
    }

    // why the waveform does not run: never over a read, and a renewal never starts one that has ended
    mutating func startWave(isRenewal: Bool = false) -> String? {
        guard playback == .idle else { return "the waveform waits: x-speak is reading aloud" }
        guard isWaveOn || !isRenewal else { return "the waveform has ended" }
        isWaveOn = true
        return nil
    }

    // whether the pill is free to leave: a read keeps it
    mutating func stopWave() -> Bool {
        isWaveOn = false
        guard playback == .idle else { return false }
        hasSignal = false
        return true
    }

    mutating func showSample() { isSample = true }
    mutating func noticed(_ notice: PillModel.Notice) {
        self.notice = notice
        for index in ahead.indices { ahead[index].isAfterNotice = false }
    }
    mutating func reads(_ sentence: PillModel.Sentence?) { self.sentence = sentence }

    // a chunk handed to the player: its sentence comes up once the sound reaches its start
    mutating func queue(_ text: String, from start: Double) { ahead.append(Queued(start: start, sentence: .init(text: text))) }

    // the sound heard so far brings up each sentence it reached; a notice stands until a sentence queued after it comes
    // up, whichever comes up first in time
    mutating func advance(to position: Double) {
        while let next = ahead.first, next.start <= position {
            sentence = next.sentence
            if next.isAfterNotice { notice = nil }
            ahead.removeFirst()
        }
    }

    mutating func leave() { (isWaveOn, isSample, hasSignal, notice, sentence, ahead) = (false, false, false, nil, nil, []) }

    // the body: the control row alone, or with the sentence row under it
    var hasSentenceRow: Bool { sentence != nil || notice != nil }

    // ⏸ while it talks, ▶ while paused, a dim ▶ when nothing plays; the meter runs once a sound was heard
    var look: PillLook {
        let isSpeaking = playback != .idle || isSample
        return PillLook(
            symbol: isSpeaking && !playback.isPaused ? "pause.fill" : "play.fill",
            label: !isSpeaking ? "nothing playing" : playback.isPaused ? "resume ⇧F4" : "pause ⇧F4",
            isDisabled: !isSpeaking,
            isMeterRunning: (isSpeaking || isWaveOn) && !playback.isPaused && hasSignal
        )
    }
}

struct PillLook: Equatable {
    let symbol: String
    let label: String
    let isDisabled: Bool
    let isMeterRunning: Bool
}
