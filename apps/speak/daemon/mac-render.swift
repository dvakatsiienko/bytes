// the mac voice as samples for the player, s16le mono 24 kHz. its Spoken Content voice comes only to an utterance that
// prefers the assistive settings: any other en voice is Samantha (probed, 23 Nov)
import AVFoundation
import os

struct MacRender: MacVoices {
    // every installed en/uk/ru voice, best quality first
    @MainActor
    func installed() -> [Voice] {
        AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.gender == .female }
            .sorted { $0.quality.rawValue > $1.quality.rawValue }
            .compactMap { voice in
                Lang(rawValue: String(voice.language.prefix(2))).map {
                    Voice(id: voice.identifier, name: "\(voice.name) · \(["", "default", "enhanced", "premium"][voice.quality.rawValue])", lang: $0)
                }
            }
    }

    @MainActor
    func render(_ chunk: Chunk, _ settings: EngineConfig) -> Pieces {
        let utterance = AVSpeechUtterance(string: chunk.text)
        if let voice = systemVoice(for: chunk.lang, settings) {
            utterance.voice = voice
        } else {
            utterance.prefersAssistiveTechnologySettings = true
        }
        let synth = AVSpeechSynthesizer(), samples = Samples()
        return Pieces { continuation in
            // a voice that stops calling back would hold the read for good; a night asleep is not its silence
            let watch = Task {
                while samples.silence < .seconds(5) { try await Task.sleep(for: .seconds(1)) }
                continuation.finish(throwing: EngineError.timeout)
            }
            // the synth lives as long as the stream
            continuation.onTermination = { _ in
                watch.cancel()
                Task { @MainActor in synth.stopSpeaking(at: .immediate) }
            }
            synth.write(utterance) { buffer in
                guard let buffer = buffer as? AVAudioPCMBuffer, buffer.frameLength > 0 else {
                    if let tail = samples.take(nil), !tail.isEmpty { continuation.yield(Rendered(pcm: tail)) }
                    continuation.finish()
                    return
                }
                if let data = samples.take(buffer), !data.isEmpty { continuation.yield(Rendered(pcm: data)) }
            }
        }
    }
}

// a voice named in the settings and installed wins; otherwise the best installed uk/ru voice, so an enhanced download is picked up
// with no rebuild. en keeps the Spoken Content voice (siri voice 4), which no voice list exposes
@MainActor
private func systemVoice(for lang: Lang, _ settings: EngineConfig) -> AVSpeechSynthesisVoice? {
    if let named = settings.voice(for: lang).flatMap(AVSpeechSynthesisVoice.init(identifier:)) { return named }
    guard lang != .en else { return nil }
    return AVSpeechSynthesisVoice.speechVoices()
        .filter { $0.language.hasPrefix(lang.rawValue) }
        .max { $0.quality.rawValue < $1.quality.rawValue }
}

// one voice's buffers, in its own format, into the player's
private final class Samples: @unchecked Sendable {
    private let format = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: 24000, channels: 1, interleaved: true)!
    private var converter: AVAudioConverter?
    private let lastCall = OSAllocatedUnfairLock(initialState: SuspendingClock.now)

    var silence: Duration { SuspendingClock.now - lastCall.withLock { $0 } }

    // nil: the voice is done, what the converter still holds comes out
    func take(_ buffer: AVAudioPCMBuffer?) -> Data? {
        lastCall.withLock { $0 = .now }
        if converter == nil, let buffer { converter = AVAudioConverter(from: buffer.format, to: format) }
        guard let converter else { return nil }
        let frames = Double(buffer?.frameLength ?? 0) * format.sampleRate / converter.inputFormat.sampleRate
        guard let out = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(frames) + 4096) else { return nil }
        var isGiven = false
        converter.convert(to: out, error: nil) { _, status in
            defer { isGiven = true }
            guard let buffer, !isGiven else {
                status.pointee = buffer == nil ? .endOfStream : .noDataNow
                return nil
            }
            status.pointee = .haveData
            return buffer
        }
        guard let samples = out.int16ChannelData?[0] else { return nil }
        return Data(bytes: samples, count: Int(out.frameLength) * 2)
    }
}
