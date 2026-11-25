// the one queue of sound: what is scheduled, what is over, who waits for the end. the audio device is handed in
import Foundation

@MainActor
protocol AudioDevice: AnyObject {
    // the engine holds the output
    var isRunning: Bool { get }
    var isPlaying: Bool { get }
    // the output went away under the engine
    var onGone: (String) -> Void { get set }
    func start() throws
    func play()
    // the sound holds where it is
    func pause()
    // drops what is scheduled
    func stop()
    // the output is let go, the graph kept
    func rest()
    // the engine ends; the next start takes the current output
    func release()
    func setSpeed(_ speed: Double)
    // s16le mono 24 kHz, two bytes or more; `whenOver` once it was heard, not once it was taken
    func schedule(_ pcm: Data, gain: Double, whenOver: @escaping @MainActor () -> Void)
}

@MainActor
final class Player {
    private let device: any AudioDevice
    private let settling: Duration
    private let now: () -> ContinuousClock.Instant
    private let write: (String) -> Void
    private var clock = PlayClock()
    private var pending = 0
    private var drainWaiters: [UUID: CheckedContinuation<Void, Never>] = [:]
    private var generation = 0
    // every buffer ever scheduled: a stop's delayed rest holds off once anything new was scheduled after it
    private var scheduled = 0
    // what is scheduled waits for the resume
    private var isPaused = false
    // when the queue ran dry mid-read: the next buffer logs the silence the listener heard
    private var dryAt: ContinuousClock.Instant?
    // since when nothing is scheduled, by itself or by a stop; a pause is not part of it
    private(set) var quietSince: ContinuousClock.Instant?

    var isPlaying: Bool { pending > 0 }

    init(device: any AudioDevice, settling: Duration = .seconds(2), now: @escaping () -> ContinuousClock.Instant = { .now }, log write: @escaping (String) -> Void) {
        self.device = device
        self.settling = settling
        self.now = now
        self.write = write
        device.onGone = { [weak self, weak device] why in
            write("audio: \(why), engine released")
            self?.stop()
            device?.release()
        }
    }

    // seconds heard, and seconds into the sound, since the read began
    var played: (heard: Double, position: Double) { clock.reading(at: now()) }

    func readBegan() { clock = PlayClock() }

    // with the engine's gain and speed
    func schedule(_ pcm: Data, _ settings: EngineConfig) throws {
        device.setSpeed(settings.speed)
        clock.setSpeed(settings.speed, at: now())
        guard pcm.count > 1 else { return }
        if !device.isRunning { try device.start() }
        if !isPaused, !device.isPlaying { device.play() }
        if pending == 0, let dryAt { write("silence: \(elapsed(dryAt)) mid-read") }
        dryAt = nil
        quietSince = nil
        pending += 1
        scheduled += 1
        if !isPaused { clock.runs(at: now()) }
        let scheduledIn = generation
        device.schedule(pcm, gain: settings.gain) { [weak self] in
            guard let self, self.generation == scheduledIn else { return }
            self.pending -= 1
            if self.pending == 0 {
                self.clock.holds(at: self.now())
                self.dryAt = .now
                self.quietSince = .now
                self.releaseWaiters()
            }
        }
    }

    func pause() {
        isPaused = true
        clock.holds(at: now())
        device.pause()
    }

    // with nothing scheduled there is nothing to play yet: the next sound starts the device
    func resume() {
        isPaused = false
        // a silence someone asked for is not a gap
        if dryAt != nil { dryAt = .now }
        if quietSince != nil { quietSince = .now }
        if pending > 0 {
            clock.runs(at: now())
            device.play()
        }
    }

    // or the wait was cancelled
    func drained() async {
        if pending == 0 { return }
        let waiter = UUID()
        await withTaskCancellationHandler {
            await withCheckedContinuation { drainWaiters[waiter] = $0 }
        } onCancel: {
            // on main, so never before the wait is stored
            Task { @MainActor in drainWaiters.removeValue(forKey: waiter)?.resume() }
        }
    }

    // the engine rests 2 s later, unless a new read scheduled audio meanwhile: one left running feeds the meter's tap
    // silence, and hours of it once froze the pill; one rested at once restarted under the next read and stumbled the
    // F4-over-F4 hand-off. a new read's own idle() rests it once that read ends
    func stop() {
        generation += 1
        device.stop()
        clock.holds(at: now())
        pending = 0
        dryAt = nil
        quietSince = .now
        releaseWaiters()
        let stoppedAt = scheduled
        Task {
            try? await Task.sleep(for: settling)
            if scheduled == stoppedAt { device.rest() }
        }
    }

    // an idle engine still holds the output; let it go between jobs
    func idle() {
        dryAt = nil
        if pending == 0 { device.rest() }
    }

    private func releaseWaiters() {
        drainWaiters.values.forEach { $0.resume() }
        drainWaiters = [:]
    }
}
