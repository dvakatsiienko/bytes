// the kokoro server's warm-up: started when nothing answers, and asked for one word. the process and the calls are handed in
import Foundation

@MainActor
protocol LocalServer: AnyObject {
    func start() throws
    func isReady() async -> Bool
    // one word, so the model is loaded before a press asks for it
    func speakFirst() async
}

@MainActor
final class KokoroServer {
    private let server: any LocalServer
    private let mayStart: Bool
    private let pause: Duration
    private let write: (String) -> Void
    // a finished warm-up
    var onWarm: () -> Void = {}
    private var isWarming = false

    init(_ server: any LocalServer, mayStart: Bool, pause: Duration = .milliseconds(250), log write: @escaping (String) -> Void) {
        self.server = server
        self.mayStart = mayStart
        self.pause = pause
        self.write = write
    }

    // one warm-up at a time
    func warm() async {
        guard !isWarming else { return }
        isWarming = true
        defer { isWarming = false }
        if await server.isReady() { return }
        guard mayStart else { return }
        do {
            try server.start()
        } catch {
            write("kokoro: server did not start — \(error)")
            return
        }
        for _ in 0..<240 where !(await server.isReady()) { try? await Task.sleep(for: pause) }
        guard await server.isReady() else {
            write("kokoro: server not answering after 60 s")
            return
        }
        await server.speakFirst()
        onWarm()
        write("kokoro: warm")
    }
}
