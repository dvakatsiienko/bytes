import AppKit
import AVFoundation

// a voice named in config.json wins; otherwise the best installed uk/ru voice, so an enhanced download is picked up
// with no rebuild. en keeps the Spoken Content voice (siri voice 4), which no voice list exposes
@MainActor
func systemVoice(for lang: Lang, _ settings: EngineConfig) -> NSSpeechSynthesizer.VoiceName? {
    if let named = settings.voice(for: lang) { return NSSpeechSynthesizer.VoiceName(rawValue: named) }
    guard lang != .en else { return nil }
    return AVSpeechSynthesisVoice.speechVoices()
        .filter { $0.language.hasPrefix(lang.rawValue) }
        .max { $0.quality.rawValue < $1.quality.rawValue }
        .map { NSSpeechSynthesizer.VoiceName(rawValue: $0.identifier) }
}

// one synth at a time, and only its own callbacks count: a stopped synth's late «finished» once resumed the next
// read's wait, that read moved on while its synth still talked, and F5 could no longer reach the orphan
@MainActor
final class SystemVoice: NSObject, NSSpeechSynthesizerDelegate {
    private var synth: NSSpeechSynthesizer?
    private var done: CheckedContinuation<Void, Never>?
    private var onFirstWord: (() -> Void)?

    var isBusy: Bool { onFirstWord != nil }

    func speak(_ chunk: Chunk, _ settings: EngineConfig, onFirstWord: @escaping () -> Void) async {
        stop()
        let synth = systemVoice(for: chunk.lang, settings).flatMap { NSSpeechSynthesizer(voice: $0) } ?? NSSpeechSynthesizer()
        synth.delegate = self
        synth.rate *= Float(settings.speed)
        self.synth = synth
        self.onFirstWord = onFirstWord
        await withCheckedContinuation { continuation in
            done = continuation
            // a synth that refuses to start never calls back, so the read would wait on it until the next press
            if !synth.startSpeaking(chunk.text) { stop() }
        }
    }

    func stop() {
        synth?.delegate = nil
        synth?.stopSpeaking()
        synth = nil
        onFirstWord = nil
        done?.resume()
        done = nil
    }

    func pause() { synth?.pauseSpeaking(at: .immediateBoundary) }
    func resume() { synth?.continueSpeaking() }

    nonisolated func speechSynthesizer(_ sender: NSSpeechSynthesizer, willSpeakWord range: NSRange, of string: String) {
        guard range.location == 0 else { return }
        MainActor.assumeIsolated {
            guard sender === synth else { return }
            onFirstWord?()
            onFirstWord = nil
        }
    }

    nonisolated func speechSynthesizer(_ sender: NSSpeechSynthesizer, didFinishSpeaking finishedSpeaking: Bool) {
        MainActor.assumeIsolated {
            guard sender === synth else { return }
            synth = nil
            done?.resume()
            done = nil
        }
    }
}
