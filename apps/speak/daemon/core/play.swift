// plays one chunk's pieces, whichever engine renders them
import Foundation

// the first piece within the deadline, which runs from the moment nothing plays: audio or a timeout, never both. the
// settings at the first sound hold for the chunk
@MainActor
func play(_ pieces: Pieces, of chunk: Chunk, into player: Player, settings: () -> EngineConfig, deadline: Duration?, onAudio: () -> Void) async throws {
    let line = PieceLine(pieces)
    var next = try await answer(of: Task { try await line.next() }, within: deadline, after: { await player.drained() })
    var held: EngineConfig?
    while let piece = next {
        // checked on main, where a stop runs: a piece that lands after it never reaches the player
        try Task.checkCancellation()
        let settings = held ?? settings()
        try player.schedule(piece.pcm, settings)
        if held == nil { onAudio() }
        held = settings
        next = try await line.next()
    }
    try Task.checkCancellation()
    // an answer with no sound in it is no answer, unless there is no word to say, «…»
    if held == nil, chunk.text.contains(where: { $0.isLetter || $0.isNumber }) { throw EngineError.noSound }
}

// one reader at a time: the first piece is waited for in a task of its own, the rest on main
private final class PieceLine: @unchecked Sendable {
    private var pieces: Pieces.AsyncIterator

    init(_ pieces: Pieces) { self.pieces = pieces.makeAsyncIterator() }

    // the next one with a sound in it
    func next() async throws -> Rendered? {
        while let piece = try await pieces.next() {
            if piece.pcm.count > 1 { return piece }
        }
        // a cancelled line ends like a whole one
        try Task.checkCancellation()
        return nil
    }
}
