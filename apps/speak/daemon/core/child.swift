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

// everything but the launch happens on its queue
private final class Child: @unchecked Sendable {
    let process = Process()
    private let queue = DispatchQueue(label: "x-speak.child")
    private var source: DispatchSourceRead?
    private var printed = Data()
    private var waiter: CheckedContinuation<String, Error>?
    private var isOver = false

    func run() async throws -> String {
        try await withTaskCancellationHandler {
            try await withCheckedThrowingContinuation { continuation in
                queue.async {
                    self.waiter = continuation
                    self.isOver ? self.end(with: CancellationError()) : self.start()
                }
            }
        } onCancel: {
            queue.async { self.end(with: CancellationError()) }
        }
    }

    private func start() {
        let pipe = Pipe()
        let reading = pipe.fileHandleForReading
        process.standardOutput = pipe
        process.standardError = FileHandle.nullDevice
        let source = DispatchSource.makeReadSource(fileDescriptor: reading.fileDescriptor, queue: queue)
        self.source = source
        source.setEventHandler { [self] in
            var buffer = [UInt8](repeating: 0, count: 65536)
            let count = read(reading.fileDescriptor, &buffer, buffer.count)
            if count > 0 { printed.append(contentsOf: buffer[..<count]) } else { end(with: nil) }
        }
        // its own end of the pipe is closed here alone, once nothing reads it
        source.setCancelHandler { try? reading.close() }
        source.resume()
        do {
            try process.run()
        } catch {
            end(with: error)
        }
    }

    private func end(with error: Error?) {
        isOver = true
        source?.cancel()
        source = nil
        if error != nil, process.isRunning { process.terminate() }
        if let error { waiter?.resume(throwing: error) } else { waiter?.resume(returning: String(decoding: printed, as: UTF8.self)) }
        waiter = nil
    }
}
