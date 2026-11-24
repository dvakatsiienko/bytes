import Foundation

// the answer to one line of the control socket, asked off main. main gets a budget; past it the request is abandoned
// before it runs, so a preview never fires minutes late, and a status falls back to main's last answer
final class Answers: @unchecked Sendable {
    private let commands: @MainActor () -> any DaemonCommands
    private let mainAge: @Sendable () -> Duration
    private let budget: @Sendable (String) -> TimeInterval
    private let onMain: @Sendable (@escaping @MainActor () -> Void) -> Void
    private let lock = NSLock()
    // the last status main gave, served with a «main» note while main cannot answer
    private var lastStatus: [String: Any]?

    init(
        commands: @escaping @MainActor () -> any DaemonCommands,
        mainAge: @escaping @Sendable () -> Duration,
        budget: @escaping @Sendable (String) -> TimeInterval = mainBudget,
        onMain: @escaping @Sendable (@escaping @MainActor () -> Void) -> Void = { work in
            DispatchQueue.main.async { MainActor.assumeIsolated { work() } }
        }
    ) {
        self.commands = commands
        self.mainAge = mainAge
        self.budget = budget
        self.onMain = onMain
    }

    func answer(_ line: Data) -> Data {
        guard let request = try? JSONDecoder().decode(Request.self, from: line) else { return reply(["error": "bad request"]) }
        let isStatus = request.op == "status"
        let turn = Turn()
        onMain {
            guard turn.begins() else { return }
            turn.ends(with: runOp(request, with: self.commands()))
        }
        guard let object = turn.object(within: budget(request.op)) else {
            let age = mainAge()
            let note = "blocked for \(seconds(age))"
            // a busy main that missed 50 ms is not a stall: the note starts where the watchdog's line does
            if isStatus, var last = lock.withLock({ lastStatus }) {
                if age > .seconds(2) { last["main"] = note }
                // every sound is started by main, a sentence at a time: past a minute nothing plays any more, and a
                // relaunch, which waits for a read to end, is the way out
                if age > .seconds(60) {
                    last["speaking"] = false
                    last["paused"] = false
                    last["read"] = nil
                }
                return reply(last)
            }
            return reply(["error": "main thread \(note), \(request.op) dropped", "main": note])
        }
        if isStatus { lock.withLock { lastStatus = object } }
        return reply(object)
    }

    private func reply(_ object: [String: Any]) -> Data {
        (try? JSONSerialization.data(withJSONObject: object)) ?? Data("{}".utf8)
    }
}

@Sendable
func mainBudget(_ op: String) -> TimeInterval { op == "status" ? 0.05 : 2 }

// one request's run on main: abandoned when the budget ends before it began, waited for when it had
private final class Turn: @unchecked Sendable {
    private let lock = NSLock()
    private let done = DispatchSemaphore(value: 0)
    private var isRunning = false
    private var isAbandoned = false
    private var result: [String: Any] = [:]

    func begins() -> Bool {
        lock.withLock {
            guard !isAbandoned else { return false }
            isRunning = true
            return true
        }
    }

    func ends(with object: [String: Any]) {
        lock.withLock { result = object }
        done.signal()
    }

    func object(within budget: TimeInterval) -> [String: Any]? {
        if done.wait(timeout: .now() + budget) == .timedOut {
            let hasBegun = lock.withLock {
                if !isRunning { isAbandoned = true }
                return isRunning
            }
            guard hasBegun else { return nil }
            done.wait()
        }
        return lock.withLock { result }
    }
}
