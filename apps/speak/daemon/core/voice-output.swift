// a voice that plays for itself, outside the audio device: one text at a time
import Foundation

@MainActor
protocol Synth: AnyObject {
    // false when it refuses to start: it never calls back then
    func start() -> Bool
    func pause()
    func resume()
    func stop()
}

@MainActor
final class VoiceOutput: SpeechOutput {
    typealias Make = (_ chunk: Chunk, _ settings: EngineConfig, _ onWord: @escaping @MainActor () -> Void, _ onEnd: @escaping @MainActor () -> Void) -> any Synth

    private let make: Make
    // a stopped synth's late «finished» once resumed the next read's wait, that read moved on while its synth still
    // talked, and F5 could no longer reach the orphan: only the callbacks of this number count
    private var number = 0
    private var synth: (any Synth)?
    private var isStarted = false
    private var isPaused = false
    private var onFirstWord: (() -> Void)?
    private var done: CheckedContinuation<Void, Never>?

    var isBusy: Bool { synth != nil }

    init(make: @escaping Make) { self.make = make }

    // returns when it was spoken to its end, stopped, or refused
    func speak(_ chunk: Chunk, _ settings: EngineConfig, onFirstWord: @escaping () -> Void) async {
        stop()
        let mine = number
        synth = make(chunk, settings, { [weak self] in self?.heard(mine) }, { [weak self] in self?.ended(mine) })
        self.onFirstWord = onFirstWord
        await withCheckedContinuation { continuation in
            done = continuation
            // under a pause it waits for the resume
            if !isPaused { start() }
        }
    }

    private func start() {
        isStarted = true
        if synth?.start() == false { stop() }
    }

    func pause() {
        isPaused = true
        if isStarted { synth?.pause() }
    }

    func resume() {
        isPaused = false
        guard let synth else { return }
        isStarted ? synth.resume() : start()
    }

    func stop() {
        number += 1
        synth?.stop()
        over()
    }

    private func heard(_ which: Int) {
        guard which == number else { return }
        onFirstWord?()
        onFirstWord = nil
    }

    private func ended(_ which: Int) {
        if which == number { over() }
    }

    private func over() {
        synth = nil
        isStarted = false
        onFirstWord = nil
        done?.resume()
        done = nil
    }
}
