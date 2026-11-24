// the kokoro server's warm-up: started when nothing answers, and asked for one word. the process and the calls are handed in
import Foundation

@MainActor
protocol LocalServer: AnyObject {
    func start() throws
}

@MainActor
final class KokoroServer {
    private let server: any LocalServer
    private let net: any Net
    private let settings: () -> EngineConfig
    private let mayStart: Bool
    private let pause: Duration
    private let write: (String) -> Void
    // a finished warm-up
    var onWarm: () -> Void = {}
    private var isWarming = false

    init(_ server: any LocalServer, net: any Net, settings: @escaping () -> EngineConfig, mayStart: Bool, pause: Duration = .milliseconds(250), log write: @escaping (String) -> Void) {
        self.server = server
        self.net = net
        self.settings = settings
        self.mayStart = mayStart
        self.pause = pause
        self.write = write
    }

    // one warm-up at a time
    func warm() async {
        guard !isWarming else { return }
        isWarming = true
        defer { isWarming = false }
        if await isReady() { return }
        guard mayStart else { return }
        do {
            try server.start()
        } catch {
            write("kokoro: server did not start — \(error)")
            return
        }
        for _ in 0..<240 where !(await isReady()) { try? await Task.sleep(for: pause) }
        guard await isReady() else {
            write("kokoro: server not answering after 60 s")
            return
        }
        // one word, so the model is loaded before a press asks for it
        if let request = try? Kokoro.request("Ready.", settings()) { _ = try? await net.whole(request) }
        onWarm()
        write("kokoro: warm")
    }

    private func isReady() async -> Bool { (try? await net.whole(Kokoro.readyRequest()))?.status == 200 }
}
