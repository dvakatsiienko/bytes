// the admin page's door into the running daemon: one json line in, one json line out, over a unix socket
// only this user can open. previews go through the daemon's own speak path, never a second synth.
// the socket lives on its own queue: a main thread stuck for minutes once took the admin down with it
import Foundation
import Network
import os

final class Control: @unchecked Sendable {
    private let socket: String
    private let commands: @MainActor () -> any DaemonCommands
    private let mainAge: @Sendable () -> Duration
    // concurrent: a status must never queue behind another request's 2 s wait on a blocked main
    private let queue = DispatchQueue(label: "x-speak.control", attributes: .concurrent)
    private var listener: NWListener?
    // the last status main gave, served with a «main» note while main cannot answer
    private let lastStatus = OSAllocatedUnfairLock<[String: Any]?>(uncheckedState: nil)

    init(socket: String, commands: @escaping @MainActor () -> any DaemonCommands, mainAge: @escaping @Sendable () -> Duration) {
        self.socket = socket
        self.commands = commands
        self.mainAge = mainAge
    }

    func start() {
        unlink(socket)
        let parameters = NWParameters.tcp
        parameters.requiredLocalEndpoint = NWEndpoint.unix(path: socket)
        do {
            let listener = try NWListener(using: parameters)
            listener.newConnectionHandler = { [self] connection in
                connection.start(queue: queue)
                read(connection, into: Data())
            }
            listener.stateUpdateHandler = { state in
                if case .failed(let error) = state { log("control: listener failed — \(error)") }
            }
            listener.start(queue: queue)
            self.listener = listener
            log("control: listening on \(socket)")
        } catch {
            log("control: no socket — \(error)")
        }
    }

    private func read(_ connection: NWConnection, into buffer: Data) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [self] data, _, isComplete, error in
            var buffer = buffer
            if let data { buffer.append(data) }
            if let newline = buffer.firstIndex(of: 0x0A) {
                let reply = answer(Data(buffer[..<newline]))
                connection.send(content: reply + Data("\n".utf8), completion: .contentProcessed { _ in connection.cancel() })
            } else if isComplete || error != nil {
                connection.cancel()
            } else {
                read(connection, into: buffer)
            }
        }
    }

    // main gets a budget; past it the request is abandoned before it runs, so a preview never fires minutes late, and
    // a status falls back to main's last answer
    private func answer(_ line: Data) -> Data {
        guard let request = try? JSONDecoder().decode(Request.self, from: line) else { return reply(["error": "bad request"]) }
        let isStatus = request.op == "status"
        let state = OSAllocatedUnfairLock<(object: [String: Any]?, isRunning: Bool, isAbandoned: Bool)>(uncheckedState: (nil, false, false))
        let done = DispatchSemaphore(value: 0)
        DispatchQueue.main.async {
            MainActor.assumeIsolated {
                guard state.withLock({ current in
                    guard !current.isAbandoned else { return false }
                    current.isRunning = true
                    return true
                }) else { return }
                let object = runOp(request, with: self.commands())
                state.withLock { $0.object = object }
                done.signal()
            }
        }
        if done.wait(timeout: .now() + (isStatus ? .milliseconds(50) : .seconds(2))) == .timedOut {
            let isRunning = state.withLock { current in
                if !current.isRunning { current.isAbandoned = true }
                return current.isRunning
            }
            if isRunning {
                done.wait()
            } else {
                let age = mainAge()
                let note = "blocked for \(seconds(age))"
                // a busy main that missed 50 ms is not a stall: the note starts where the watchdog's line does
                if isStatus, var last = lastStatus.withLock({ $0 }) {
                    if age > .seconds(2) { last["main"] = note }
                    return reply(last)
                }
                return reply(["error": "main thread \(note), \(request.op) dropped", "main": note])
            }
        }
        let object = state.withLock { $0.object } ?? [:]
        if isStatus { lastStatus.withLock { $0 = object } }
        return reply(object)
    }

    private func reply(_ object: [String: Any]) -> Data {
        (try? JSONSerialization.data(withJSONObject: object)) ?? Data("{}".utf8)
    }
}
