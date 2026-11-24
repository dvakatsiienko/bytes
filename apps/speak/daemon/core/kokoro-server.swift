// the kokoro server's warm-up: started when nothing answers, and asked for one word. the process and the calls are handed in
import Foundation

@MainActor
protocol LocalServer: AnyObject {
    var isRunning: Bool { get }
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
        if await isReady() {
            // it was warmed by the daemon it belongs to
            guard mayStart else { return }
        } else {
            guard mayStart, await starts() else { return }
        }
        // one word, so the model is loaded before a press asks for it
        do {
            let (status, _) = try await net.whole(Kokoro.request("Ready.", settings()))
            guard status == 200 else { throw EngineError.status(status) }
        } catch {
            return write("kokoro: its first word failed — \(error)")
        }
        onWarm()
        write("kokoro: warm")
    }

    // answers once it is up. one still loading after 60 s is waited for again, never joined by a second
    private func starts() async -> Bool {
        if !server.isRunning {
            do {
                try server.start()
            } catch {
                write("kokoro: server did not start — \(error)")
                return false
            }
        }
        for _ in 0..<240 {
            if await isReady() { return true }
            guard server.isRunning else {
                write("kokoro: server exited before it answered")
                return false
            }
            try? await Task.sleep(for: pause)
        }
        write("kokoro: server not answering after 60 s")
        return false
    }

    private func isReady() async -> Bool { (try? await net.whole(Kokoro.readyRequest()))?.status == 200 }
}
