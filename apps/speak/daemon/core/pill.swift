// what the pill's pause button and meter show, from the speech alone: ⏸ while it talks, ▶ while paused, a dim ▶ when
// nothing plays. the mac voice plays outside the audio engine and sends no signal, so its speech never runs the meter
struct PillLook: Equatable {
    let symbol: String
    let label: String
    let isDisabled: Bool
    let isMeterRunning: Bool
}

func pillLook(isSpeaking: Bool, isPaused: Bool, hasSignal: Bool) -> PillLook {
    PillLook(
        symbol: isSpeaking && !isPaused ? "pause.fill" : "play.fill",
        label: !isSpeaking ? "Nothing playing" : isPaused ? "Resume · F4" : "Pause · F4",
        isDisabled: !isSpeaking,
        isMeterRunning: isSpeaking && !isPaused && hasSignal
    )
}
