import AVFoundation

@MainActor
final class MacAudio: AudioDevice {
    private let engine = AVAudioEngine()
    private let node = AVAudioPlayerNode()
    // speed without a pitch shift, applied on playback so no engine re-renders for it
    private let pace = AVAudioUnitTimePitch()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 24000, channels: 1)!

    var isRunning: Bool { engine.isRunning }
    var isPlaying: Bool { node.isPlaying }
    var onGone: (String) -> Void = { _ in }
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
            MainActor.assumeIsolated { self?.onGone("engine configuration changed") }
        }
        var defaultOutput = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultOutputDevice, mScope: kAudioObjectPropertyScopeGlobal, mElement: kAudioObjectPropertyElementMain)
        AudioObjectAddPropertyListenerBlock(AudioObjectID(kAudioObjectSystemObject), &defaultOutput, .main) { [weak self] _, _ in
            MainActor.assumeIsolated { self?.onGone("default output device changed") }
        }
    }

    func start() throws { try engine.start() }
    func play() { node.play() }
    func pause() { node.pause() }
    func stop() { node.stop() }
    func rest() { engine.pause() }
    func release() { engine.stop() }

    func setSpeed(_ speed: Double) {
        pace.rate = Float(speed)
        // at 1× the speed stage is skipped, so its buffering adds nothing to pause, resume or the first sample
        pace.bypass = speed == 1
    }

    func schedule(_ pcm: Data, gain: Double, whenOver: @escaping @MainActor () -> Void) {
        let frames = pcm.count / 2
        let gain = Float(gain)
        let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(frames))!
        buffer.frameLength = AVAudioFrameCount(frames)
        let out = buffer.floatChannelData![0]
        pcm.withUnsafeBytes { raw in
            let samples = raw.bindMemory(to: Int16.self)
            for i in 0..<frames { out[i] = max(-1, min(1, Float(Int16(littleEndian: samples[i])) / 32768 * gain)) }
        }
        // «consumed» comes ~0.3 s before the last sample is heard: a read ended on it lost its tail, which then opened
        // the next read (measured: 121 ms cut, 83 ms of it at the next start)
        node.scheduleBuffer(buffer, completionCallbackType: .dataPlayedBack) { _ in Task { @MainActor in whenOver() } }
    }
}
