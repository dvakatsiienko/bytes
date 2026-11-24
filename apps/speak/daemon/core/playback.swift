// what plays: nothing, or one numbered read. it changes by these events alone; the pill, the outputs and the status read it
enum Playback: Equatable {
    case idle
    case reading(Int, isPaused: Bool)

    var read: Int? {
        if case .reading(let read, _) = self { read } else { nil }
    }
    var isPaused: Bool {
        if case .reading(_, let isPaused) = self { isPaused } else { false }
    }
}

enum PlaybackEvent: Equatable {
    case began(Int), pausePressed, ended(Int), stopped
}

func next(_ playback: Playback, _ event: PlaybackEvent) -> Playback {
    switch (playback, event) {
    case (_, .began(let read)): .reading(read, isPaused: false)
    case (.reading(let read, let isPaused), .pausePressed): .reading(read, isPaused: !isPaused)
    case (.reading(let read, _), .ended(let ended)): read == ended ? .idle : playback
    case (_, .stopped): .idle
    case (.idle, .pausePressed), (.idle, .ended): .idle
    }
}
