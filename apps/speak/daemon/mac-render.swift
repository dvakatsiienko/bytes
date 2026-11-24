// the mac voice as samples for the player, s16le mono 24 kHz. its Spoken Content voice comes only to an utterance that
// prefers the assistive settings: any other en voice is Samantha (probed, 23 Nov)
import AVFoundation

@MainActor
func renderedMacVoice(_ chunk: Chunk, _ settings: EngineConfig) -> AsyncStream<Data> {
    let utterance = AVSpeechUtterance(string: chunk.text)
    if let voice = systemVoice(for: chunk.lang, settings) {
        utterance.voice = AVSpeechSynthesisVoice(identifier: voice.rawValue)
    } else {
        utterance.prefersAssistiveTechnologySettings = true
    }
    let synth = AVSpeechSynthesizer(), samples = Samples()
    return AsyncStream { continuation in
        // the synth lives as long as the stream
        continuation.onTermination = { _ in Task { @MainActor in synth.stopSpeaking(at: .immediate) } }
        synth.write(utterance) { buffer in
            guard let buffer = buffer as? AVAudioPCMBuffer, buffer.frameLength > 0 else {
                if let tail = samples.take(nil), !tail.isEmpty { continuation.yield(tail) }
                continuation.finish()
                return
            }
            if let data = samples.take(buffer), !data.isEmpty { continuation.yield(data) }
        }
    }
}

// one voice's buffers, in its own format, into the player's
private final class Samples: @unchecked Sendable {
    private let format = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: 24000, channels: 1, interleaved: true)!
    private var converter: AVAudioConverter?

    // nil: the voice is done, what the converter still holds comes out
    func take(_ buffer: AVAudioPCMBuffer?) -> Data? {
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
