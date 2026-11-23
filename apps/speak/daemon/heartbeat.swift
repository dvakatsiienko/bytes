import Foundation
import os

// a watchdog thread hands main a stamp twice a second; the socket and the watchdog read how long main has left it
// unrun. a main-queue stamp, not a timer: app nap coalesces a windowless daemon's timers by seconds, and a late
// timer read as a 4 s stall on an idle main. the suspending clock stops while the mac sleeps, so a night asleep
// never reads as a blocked main on wake
final class Heartbeat: @unchecked Sendable {
    private let last = OSAllocatedUnfairLock(initialState: SuspendingClock.now)

    var age: Duration { SuspendingClock.now - last.withLock { $0 } }

    func start() {
        Thread.detachNewThread { [self] in
            var longest: Duration?
            while true {
                DispatchQueue.main.async { [last] in last.withLock { $0 = SuspendingClock.now } }
                Thread.sleep(forTimeInterval: 0.5)
                let age = self.age
                if age > .seconds(2) {
                    if longest == nil { log("main: blocked for \(seconds(age))") }
                    longest = max(longest ?? .zero, age)
                } else if let stall = longest, age < .seconds(1) {
                    log("main: answering again after \(seconds(stall))+")
                    longest = nil
                }
            }
        }
    }
}
