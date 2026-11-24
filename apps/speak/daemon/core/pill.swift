// what the pill shows: the read that plays first; the admin's infinite waveform and a screenshot's sample only where
// nothing plays
struct PillState: Equatable {
    private(set) var playback = Playback.idle
    private(set) var isWaveOn = false
    private(set) var isSample = false
    // flips once per read, on the first audible reading
    var hasSignal = false

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
    mutating func leave() { (isWaveOn, isSample, hasSignal) = (false, false, false) }

    // ⏸ while it talks, ▶ while paused, a dim ▶ when nothing plays; the meter runs once a sound was heard
    var look: PillLook {
        let isSpeaking = playback != .idle || isSample
        return PillLook(
            symbol: isSpeaking && !playback.isPaused ? "pause.fill" : "play.fill",
            label: !isSpeaking ? "Nothing playing" : playback.isPaused ? "Resume · F4" : "Pause · F4",
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
