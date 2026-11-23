// the admin page's door into the running daemon: one json line in, one json line out, over a unix socket
// only this user can open. previews go through the daemon's own speak path, never a second synth.
// the socket lives on its own queue: a main thread stuck for minutes once took the admin down with it
import Foundation
import Network

final class Control: @unchecked Sendable {
    private let socket: String
    private let answers: Answers
    // concurrent: a status must never queue behind another request's 2 s wait on a blocked main
    private let queue = DispatchQueue(label: "x-speak.control", attributes: .concurrent)
    private var listener: NWListener?

    init(socket: String, answers: Answers) {
        self.socket = socket
        self.answers = answers
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
                let reply = answers.answer(Data(buffer[..<newline]))
                connection.send(content: reply + Data("\n".utf8), completion: .contentProcessed { _ in connection.cancel() })
            } else if isComplete || error != nil {
                connection.cancel()
            } else {
                read(connection, into: buffer)
            }
        }
    }
}
