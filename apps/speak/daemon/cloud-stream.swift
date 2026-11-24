import Foundation
import os

private enum StreamState { case waiting, playing, timedOut }

private func failure(_ status: Int, _ bytes: URLSession.AsyncBytes) async -> EngineError {
    var body = Data()
    do { for try await byte in bytes { body.append(byte); if body.count > 4096 { break } } } catch {}
    return engineError(status: status, body: body)
}

// plays as bytes arrive; with a deadline, no audio by then throws before anything was heard
// the byte loop runs off the main actor: on it, a buffered response starved the deadline timer (fish
// played at 604 ms under a 400 ms deadline). `state` settles the race — audio or timeout, never both.
@MainActor
func stream(_ open: Task<(URLSession.AsyncBytes, URLResponse), Error>, into player: Player, _ settings: EngineConfig, deadline: Duration?, onAudio: @escaping () -> Void) async throws {
    let state = OSAllocatedUnfairLock(initialState: StreamState.waiting)
    try await withThrowingTaskGroup(of: Bool.self) { group in
        group.addTask {
            let (bytes, response) = try await withTaskCancellationHandler { try await open.value } onCancel: { open.cancel() }
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            guard status == 200 else { throw await failure(status, bytes) }
            var buffer = Data()
            // 20 ms for the first buffer so audio starts at once, then 100 ms to schedule cheaply
            var threshold = 960
            func flush() async throws {
                let pcm = buffer.prefix(buffer.count & ~1)
                buffer.removeFirst(pcm.count)
                let isFirst = state.withLock { current in
                    guard current != .timedOut else { return false }
                    defer { current = .playing }
                    return current == .waiting
                }
                guard state.withLock({ $0 == .playing }) else { throw CancellationError() }
                // checked on main, where stop() runs: bytes that land after a stop never reach the player
                try await MainActor.run {
                    try Task.checkCancellation()
                    try player.schedule(Data(pcm), settings)
                    if isFirst { onAudio() }
                }
            }
            for try await byte in bytes {
                buffer.append(byte)
                if buffer.count >= threshold {
                    try await flush()
                    threshold = 4800
                }
            }
            if buffer.count > 1 { try await flush() }
            return true
        }
        if let deadline {
            group.addTask {
                // cancelled: the stream ended first
                do { try await Task.sleep(for: deadline) } catch { return false }
                let isLate = state.withLock { current in
                    guard current == .waiting else { return false }
                    current = .timedOut
                    return true
                }
                if isLate { throw EngineError.timeout }
                return false
            }
        }
        // a stream that ends inside its deadline does not wait the rest of it out
        for try await isWhole in group where isWhole { group.cancelAll() }
    }
    // an answer with no sound in it is no answer
    if state.withLock({ $0 == .waiting }) {
        try Task.checkCancellation()
        throw EngineError.timeout
    }
}
