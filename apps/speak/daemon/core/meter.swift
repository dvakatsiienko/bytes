import Foundation

// the level history (newest first, mirrored out from the centre) and the bars as drawn. readings play out ~100 times
// a second, 10 ms apart; every display frame each bar glides a share of the way to its reading (pill glide), so the
// meter flows instead of stepping (dima: «smooth, like requestAnimationFrame»)
@MainActor
final class Meter {
    private var history = [Float](repeating: 0, count: 9)
    private var shown = [Float](repeating: 0, count: 17)
    // centre-heavy envelope: the edges reach ~40 % of the centre, so the meter reads as a curve, never a full block
    private let envelope: [Float] = (0..<17).map { index in
        let distance = Float(abs(index - 8)) / 8
        return 0.4 + 0.6 * pow(cos(distance * .pi / 2), 2)
    }
    private var lastFrame: Date?
    // the pill's glide and flow in ms, read on every frame and reading
    private let tuning: @MainActor () -> (glide: Double, flow: Double)

    init(tuning: @escaping @MainActor () -> (glide: Double, flow: Double)) { self.tuning = tuning }

    // readings waiting for their moment: a 100 ms buffer's ten windows, each due 10 ms after the last
    private var pending: [(due: Date, level: Float)] = []

    // a reading still undrawn a second past its moment is dropped: with the timeline paused and the tap still feeding,
    // five idle hours piled up ~1.8 M readings, and the next frame spent 6.5 min of main draining them
    func enqueue(_ levels: [Float], spacing: TimeInterval) {
        let now = Date()
        pending.removeFirst(pending.prefix { $0.due < now.addingTimeInterval(-1) }.count)
        let start = max(now, pending.last.map { $0.due.addingTimeInterval(spacing) } ?? .distantPast)
        pending += levels.enumerated().map { (start.addingTimeInterval(Double($0.offset) * spacing), $0.element) }
    }

    // readings arrive every 10 ms; the wave moves one bar outward per meterFlowMs, carrying the loudest reading of
    // that span, so the travel speed is a setting and not the audio's buffer rate
    private var stepPeak: Float = 0
    private var stepReadings = 0

    func push(_ level: Float) {
        stepPeak = max(stepPeak, level)
        stepReadings += 1
        guard stepReadings >= max(1, Int((tuning().flow / 10).rounded())) else { return }
        // a short decay, so a pause between words does not snap the centre bar to a dot
        history.removeLast()
        history.insert(max(stepPeak, (history.first ?? 0) * 0.72), at: 0)
        stepPeak = 0
        stepReadings = 0
    }

    func reset() {
        pending = []
        stepPeak = 0
        stepReadings = 0
        history = history.map { _ in 0 }
        shown = shown.map { _ in 0 }
        lastFrame = nil
    }

    func show(_ levels: [Float]) {
        history = levels
        shown = history.reversed() + history.dropFirst()
    }

    // one display frame: a frame-rate-independent ease; config's meterGlideMs is the time to cover most of the gap
    func frame(at date: Date) -> [Float] {
        let dt = lastFrame.map { min(0.1, date.timeIntervalSince($0)) } ?? 1.0 / 60
        lastFrame = date
        let due = pending.prefix { $0.due <= date }
        due.forEach { push($0.level) }
        pending.removeFirst(due.count)
        let ease = Float(1 - exp(-dt / max(0.0001, tuning().glide / 1000)))
        let raw = history.reversed() + history.dropFirst()
        // a light blur across neighbours, so the wave reads as one flowing shape, not 17 independent bars
        let target = raw.indices.map { index in
            let left = raw[max(0, index - 1)], right = raw[min(raw.count - 1, index + 1)]
            return (left + 2 * raw[index] + right) / 4 * envelope[index]
        }
        for index in shown.indices { shown[index] += (target[index] - shown[index]) * ease }
        return shown
    }
}

// a talking voice without the voice: ~4 syllables a second inside ~1.6 s phrases, a short breath between them
func speechLevel(at t: Double) -> Double {
    let phrase = t.truncatingRemainder(dividingBy: 1.6)
    guard phrase < 1.3 else { return 0.02 }
    let syllable = abs(sin(t * .pi * 4.2))
    let texture = 0.5 + 0.5 * sin(t * 37) * sin(t * 13)
    return min(0.95, 0.25 + 0.45 * syllable + 0.15 * texture)
}
