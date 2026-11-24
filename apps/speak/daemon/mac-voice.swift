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

@MainActor
final class MacSynth: NSObject, NSSpeechSynthesizerDelegate, Synth {
    private let synth: NSSpeechSynthesizer
    private let text: String
    private let onWord: @MainActor () -> Void
    private let onEnd: @MainActor () -> Void

    init(_ chunk: Chunk, _ settings: EngineConfig, onWord: @escaping @MainActor () -> Void, onEnd: @escaping @MainActor () -> Void) {
        synth = systemVoice(for: chunk.lang, settings).flatMap { NSSpeechSynthesizer(voice: $0) } ?? NSSpeechSynthesizer()
        synth.rate *= Float(settings.speed)
        text = chunk.text
        self.onWord = onWord
        self.onEnd = onEnd
        super.init()
        synth.delegate = self
    }

    func start() -> Bool { synth.startSpeaking(text) }
    func pause() { synth.pauseSpeaking(at: .immediateBoundary) }
    func resume() { synth.continueSpeaking() }

    func stop() {
        synth.delegate = nil
        synth.stopSpeaking()
    }

    nonisolated func speechSynthesizer(_ sender: NSSpeechSynthesizer, willSpeakWord range: NSRange, of string: String) {
        MainActor.assumeIsolated { onWord() }
    }

    nonisolated func speechSynthesizer(_ sender: NSSpeechSynthesizer, didFinishSpeaking finishedSpeaking: Bool) {
        MainActor.assumeIsolated { onEnd() }
    }
}
