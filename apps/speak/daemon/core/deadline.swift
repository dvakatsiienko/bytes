import Foundation

// the task's answer, or a timeout past the deadline, which runs from `quiet`'s return. both a timeout and a cancelled
// wait cancel the task
func answer<T: Sendable>(of task: Task<T, Error>, within deadline: Duration?, after quiet: @escaping @Sendable () async -> Void = {}) async throws -> T {
    try await withTaskCancellationHandler {
        guard let deadline else { return try await task.value }
        let late = Late()
        let timer = Task {
            await quiet()
            try await Task.sleep(for: deadline)
            late.set()
            task.cancel()
        }
        defer { timer.cancel() }
        do { return try await task.value } catch { throw late.isSet ? EngineError.timeout : error }
    } onCancel: {
        task.cancel()
    }
}

private final class Late: @unchecked Sendable {
    private let lock = NSLock()
    private var value = false
    var isSet: Bool { lock.withLock { value } }
    func set() { lock.withLock { value = true } }
}
