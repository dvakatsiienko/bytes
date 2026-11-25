// how long a read was listened to, a mac asleep aside, and how far into its sound it is: at 1.5× ten seconds heard are
// fifteen of sound
struct PlayClock {
    private var total = (heard: 0.0, position: 0.0)
    private var speed = 1.0
    // while something sounds
    private var runningSince: SuspendingClock.Instant?

    mutating func runs(at now: SuspendingClock.Instant) {
        if runningSince == nil { runningSince = now }
    }

    mutating func holds(at now: SuspendingClock.Instant) {
        total = reading(at: now)
        runningSince = nil
    }

    // what sounded until now had the speed before
    mutating func setSpeed(_ speed: Double, at now: SuspendingClock.Instant) {
        total = reading(at: now)
        if runningSince != nil { runningSince = now }
        self.speed = speed
    }

    // both in seconds
    func reading(at now: SuspendingClock.Instant) -> (heard: Double, position: Double) {
        let running = runningSince.map { ($0.duration(to: now)) / .seconds(1) } ?? 0
        return (total.heard + running, total.position + running * speed)
    }
}
