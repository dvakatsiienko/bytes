import AVFoundation

@MainActor
final class Player {
    private let engine = AVAudioEngine()
    private let node = AVAudioPlayerNode()
    // speed without a pitch shift, applied on playback so no engine re-renders for it
    private let pace = AVAudioUnitTimePitch()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 24000, channels: 1)!
    private var pending = 0
    private var drainWaiters: [CheckedContinuation<Void, Never>] = []
    private var generation = 0
    // every buffer ever scheduled: a stop's delayed pause holds off once anything new was scheduled after it
    private var scheduled = 0
    // when the queue ran dry mid-read: the next buffer logs the silence the listener heard
    private var dryAt: ContinuousClock.Instant?

    var isPlaying: Bool { pending > 0 }
    // the panel's meter: the mixer's levels, one per 10 ms of a rendered buffer, and the spacing between them
    var onLevels: (([Float], TimeInterval) -> Void)?

    init() {
        engine.attach(node)
        engine.attach(pace)
        engine.connect(node, to: pace, format: format)
        engine.connect(pace, to: engine.mainMixerNode, format: format)
        // coreaudio hands the tap 100 ms buffers whatever size is asked (4800 frames at 48 kHz, measured with 512 and
        // 1024), so one reading per buffer fed the meter 10 times a second. each buffer is cut into 10 ms windows
        // instead, and the meter plays them out over the buffer's span: ~100 readings a second
        engine.mainMixerNode.installTap(onBus: 0, bufferSize: 1024, format: nil) { [weak self] buffer, _ in
            guard let samples = buffer.floatChannelData?[0], buffer.frameLength > 0 else { return }
            let frames = Int(buffer.frameLength)
            let window = max(1, Int(buffer.format.sampleRate / 100))
            let levels = stride(from: 0, to: frames, by: window).map { start in
                let end = min(frames, start + window)
                var sum: Float = 0
                for i in start..<end { sum += samples[i] * samples[i] }
                let decibels = 10 * log10(max(sum / Float(end - start), 1e-9))
                return min(1, max(0, (decibels + 50) / 50))
            }
            let spacing = Double(window) / buffer.format.sampleRate
            Task { @MainActor in self?.onLevels?(levels, spacing) }
        }
        // an engine left on a gone output device makes every play() wait out a 5 s IO timeout on main (AirPods,
        // 2026-10-07): a device switch stops it, and the next schedule starts it on the current default device
        NotificationCenter.default.addObserver(forName: .AVAudioEngineConfigurationChange, object: engine, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated { self?.release("engine configuration changed") }
        }
        var defaultOutput = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultOutputDevice, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        AudioObjectAddPropertyListenerBlock(AudioObjectID(kAudioObjectSystemObject), &defaultOutput, .main) { [weak self] _, _ in
            MainActor.assumeIsolated { self?.release("default output device changed") }
        }
    }

    private func release(_ why: String) {
        log("audio: \(why), engine released")
        stop()
        engine.stop()
    }

    // s16le mono 24 kHz → float, with the engine's gain and speed
    func schedule(_ pcm: Data, _ settings: EngineConfig) throws {
        let gain = Float(settings.gain)
        pace.rate = Float(settings.speed)
        // at 1× the speed stage is skipped, so its buffering adds nothing to pause, resume or the first sample
        pace.bypass = settings.speed == 1
        let frames = pcm.count / 2
        guard frames > 0, let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(frames)) else { return }
        buffer.frameLength = AVAudioFrameCount(frames)
        let out = buffer.floatChannelData![0]
        pcm.withUnsafeBytes { raw in
            let samples = raw.bindMemory(to: Int16.self)
            for i in 0..<frames { out[i] = max(-1, min(1, Float(Int16(littleEndian: samples[i])) / 32768 * gain)) }
        }
        if !engine.isRunning { try engine.start() }
        if !node.isPlaying { node.play() }
        if pending == 0, let dryAt { log("silence: \(elapsed(dryAt)) mid-read") }
        dryAt = nil
        pending += 1
        scheduled += 1
        let scheduledIn = generation
        node.scheduleBuffer(buffer) { [weak self] in
            Task { @MainActor in
                guard let self, self.generation == scheduledIn else { return }
                self.pending -= 1
                if self.pending == 0 {
                    self.dryAt = .now
                    self.releaseWaiters()
                }
            }
        }
    }

    func pause() { node.pause() }
    func resume() { node.play() }

    func drained() async {
        if pending == 0 { return }
        await withCheckedContinuation { drainWaiters.append($0) }
    }

    // the engine pauses 2 s later, unless a new read scheduled audio meanwhile: one left running feeds the meter's tap
    // silence, and hours of it once froze the pill; one paused at once restarted under the next read and stumbled the
    // F4-over-F4 hand-off. a new read's own idle() pauses it once that read ends
    func stop() {
        generation += 1
        node.stop()
        pending = 0
        dryAt = nil
        releaseWaiters()
        let stoppedAt = scheduled
        Task {
            try? await Task.sleep(for: .seconds(2))
            if scheduled == stoppedAt { engine.pause() }
        }
    }

    // an idle engine still holds the output device; let it go between jobs
    func idle() {
        dryAt = nil
        if pending == 0 { engine.pause() }
    }

    private func releaseWaiters() {
        drainWaiters.forEach { $0.resume() }
        drainWaiters = []
    }
}
