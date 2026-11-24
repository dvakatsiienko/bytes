// what a program prints, or an error past its deadline. no thread waits for it: a read that blocks parks one for as
// long as the program hangs
import Foundation

func output(of program: String, _ arguments: [String], environment: [String: String], within deadline: Duration) async throws -> String {
    let child = Child()
    child.process.executableURL = URL(fileURLWithPath: program)
    child.process.arguments = arguments
    child.process.environment = environment
    return try await answer(of: Task { try await child.run() }, within: deadline)
}

private final class Child: @unchecked Sendable {
    let process = Process()
    private let pipe = Pipe()
    private let lock = NSLock()
    private var printed = Data()
    private var waiter: CheckedContinuation<String, Error>?
    private var isOver = false

    func run() async throws -> String {
        try await withTaskCancellationHandler {
            try await withCheckedThrowingContinuation { continuation in
                lock.withLock { waiter = continuation }
                start()
            }
        } onCancel: {
            end(with: CancellationError())
        }
    }

    private func start() {
        process.standardOutput = pipe
        process.standardError = FileHandle.nullDevice
        pipe.fileHandleForReading.readabilityHandler = { [self] handle in
            let data = handle.availableData
            lock.withLock { printed.append(data) }
            if data.isEmpty { end(with: nil) }
        }
        do { try process.run() } catch { end(with: error) }
        // cancelled before it ran
        if lock.withLock({ isOver }) { end(with: CancellationError()) }
    }

    private func end(with error: Error?) {
        pipe.fileHandleForReading.readabilityHandler = nil
        let (waiter, printed) = lock.withLock {
            isOver = true
            defer { self.waiter = nil }
            return (self.waiter, self.printed)
        }
        guard let error else {
            waiter?.resume(returning: String(decoding: printed, as: UTF8.self))
            return
        }
        if process.isRunning { process.terminate() }
        waiter?.resume(throwing: error)
    }
}
