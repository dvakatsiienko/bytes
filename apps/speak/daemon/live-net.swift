import Foundation

struct LiveNet: Net {
    func open(_ request: URLRequest) async throws -> (status: Int, body: AsyncThrowingStream<Data, Error>) {
        let (bytes, response) = try await URLSession.shared.bytes(for: request)
        let body = AsyncThrowingStream<Data, Error> { continuation in
            let task = Task.detached {
                var buffer = Data()
                // 20 ms for the first piece so audio starts at once, then 100 ms to schedule cheaply
                var threshold = 960
                do {
                    for try await byte in bytes {
                        buffer.append(byte)
                        guard buffer.count >= threshold else { continue }
                        continuation.yield(buffer)
                        buffer = Data()
                        threshold = 4800
                    }
                    if !buffer.isEmpty { continuation.yield(buffer) }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
        return (status(response), body)
    }

    func whole(_ request: URLRequest) async throws -> (status: Int, body: Data) {
        let (data, response) = try await URLSession.shared.data(for: request)
        return (status(response), data)
    }

    private func status(_ response: URLResponse) -> Int { (response as? HTTPURLResponse)?.statusCode ?? 0 }
}
