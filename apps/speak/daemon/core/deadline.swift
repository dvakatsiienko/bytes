import Foundation

// the task's answer, or a timeout past the deadline. both a timeout and a cancelled wait cancel the task
func answer<T: Sendable>(of task: Task<T, Error>, within deadline: Duration?) async throws -> T {
    try await withTaskCancellationHandler {
        guard let deadline else { return try await task.value }
        let timer = Task {
            do { try await Task.sleep(for: deadline) } catch { return false }
            task.cancel()
            return true
        }
        do {
            let value = try await task.value
            timer.cancel()
            return value
        } catch {
            timer.cancel()
            throw await timer.value ? URLError(.timedOut) : error
        }
    } onCancel: {
        task.cancel()
    }
}
