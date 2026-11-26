// the floating pill while x-speak talks: close, a level meter, pause, stop, stick. never takes focus, floats on
// every space, drags anywhere and remembers where. the meter is the one moving part: the mixer's real level, drawn
// at the display's refresh rate while audio plays and still otherwise — cut `LevelMeter` and `Player.onLevels` to drop it.
import AppKit
import SwiftUI

@MainActor
final class PanelModel: ObservableObject {
    @Published var state = PillState()
    @Published var isSticky = UserDefaults.standard.bool(forKey: "panelSticky") {
        didSet { UserDefaults.standard.set(isSticky, forKey: "panelSticky") }
    }
    // read by the meter every frame, never observed: a new reading costs no view update
    let meter: Meter
    // which button the pointer is over; lives here because a plain swiftc build has no SwiftUI @State macro
    @Published var hovered: String?
    // the reading engine's speed, as the player plays it
    @Published var speed: Double = 1
    var speedLabel: String { String(format: "%g×", (speed * 100).rounded() / 100) }

    init(tuning: @escaping @MainActor () -> (glide: Double, flow: Double)) { meter = Meter(tuning: tuning) }

    var onClose: () -> Void = {}
    var onPause: () -> Void = {}
    var onStop: () -> Void = {}
    var onUnstick: () -> Void = {}
    var onDrag: () -> Void = {}
    var onDragEnd: () -> Void = {}

    func push(_ levels: [Float], spacing: TimeInterval) {
        guard !state.playback.isPaused else { return }
        meter.enqueue(levels, spacing: spacing)
        if !state.hasSignal, levels.contains(where: { $0 > 0.04 }) { state.hasSignal = true }
    }
}

struct PanelView: View {
    static let width: CGFloat = 354
    static let controlRow: CGFloat = 37
    static let sentenceRow: CGFloat = 27
    static func size(hasSentenceRow: Bool) -> CGSize {
        CGSize(width: width, height: controlRow + (hasSentenceRow ? sentenceRow : 0))
    }
    @ObservedObject var model: PanelModel

    var body: some View {
        let look = model.state.look
        let hasSentenceRow = model.state.hasSentenceRow
        let shape = RoundedRectangle(cornerRadius: hasSentenceRow ? 14 : Self.controlRow / 2, style: .continuous)
        VStack(spacing: 0) {
            HStack(spacing: 2) {
                PillButton(model: model, symbol: "xmark", label: "Close the panel, keep speaking", action: model.onClose)
                LevelMeter(meter: model.meter, isRunning: look.isMeterRunning, isPaused: model.state.playback.isPaused)
                    .frame(maxWidth: .infinity)
                PillButton(model: model, symbol: "speaker.wave.2.fill", label: "Volume", action: {})
                Text(model.speedLabel)
                    .font(.system(size: 12, weight: .medium))
                    .monospacedDigit()
                    .foregroundStyle(Color.white.opacity(0.85))
                    .padding(.horizontal, 4)
                    .accessibilityLabel("Speed \(model.speedLabel)")
                Divider().frame(height: 16).overlay(Color.white.opacity(0.14))
                PillButton(
                    model: model,
                    symbol: look.symbol,
                    label: look.label,
                    isDisabled: look.isDisabled,
                    action: model.onPause,
                )
                PillButton(model: model, symbol: "stop.fill", label: "stop F5", action: model.onStop)
                Divider().frame(height: 16).overlay(Color.white.opacity(0.14))
                PillButton(model: model, symbol: "pin.fill", label: model.isSticky ? "Unstick" : "Stick: stay after speech ends", isOn: model.isSticky) {
                    model.isSticky.toggle()
                    if !model.isSticky { model.onUnstick() }
                }
            }
            .padding(.horizontal, 6)
            .frame(height: Self.controlRow)
            if hasSentenceRow {
                Rectangle().fill(Color.white.opacity(0.1)).frame(height: 1)
                SentenceRow(sentence: model.state.sentence, notice: model.state.notice, isPaused: model.state.playback.isPaused)
                    .padding(.horizontal, 12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .transition(.opacity)
            }
        }
        .frame(width: Self.width, height: Self.size(hasSentenceRow: hasSentenceRow).height)
        // the line fades as its row closes: a fade, never a slide, so Reduce Motion keeps it
        .animation(.easeOut(duration: 0.2), value: hasSentenceRow)
        // the tint sits over the glass: a second .background would land behind it and vanish
        .background(ZStack { VisualEffect(); Color.black.opacity(0.55) })
        .clipShape(shape)
        .overlay(shape.strokeBorder(Color.white.opacity(0.14), lineWidth: 1))
        // the whole pill drags; a button's own click wins over this gesture. isMovableByWindowBackground never
        // fired under SwiftUI (dima's hand test, take 2)
        .contentShape(shape)
        .gesture(DragGesture(minimumDistance: 2).onChanged { _ in model.onDrag() }.onEnded { _ in model.onDragEnd() })
        .environment(\.colorScheme, .dark)
    }
}

// the sentence in the heard tone, its spoken word on a pad, what is ahead dimmer; a notice in its place says what the
// read did instead, led by its glyph
struct SentenceRow: View {
    static let heard = Color.white.opacity(0.88)
    static let ahead = Color.white.opacity(0.5)
    let sentence: PillModel.Sentence?
    let notice: PillModel.Notice?
    // paused, the whole line takes the wave's grey and the word holds on a grey pad
    let isPaused: Bool

    var body: some View {
        Group {
            if let notice {
                HStack(spacing: 6) {
                    if notice == .codeBlock {
                        Image(systemName: "chevron.left.forwardslash.chevron.right").font(.system(size: 9, weight: .semibold))
                    }
                    Text(notice.line)
                }
                .foregroundStyle(Self.heard)
            } else if let sentence {
                let parts = sentence.parts
                HStack(spacing: 0) {
                    Text(parts.heard).foregroundStyle(isPaused ? Self.ahead : Self.heard)
                    if !parts.lit.isEmpty {
                        Text(parts.lit)
                            .fontWeight(.semibold)
                            .foregroundStyle(isPaused ? Self.heard : .white)
                            .padding(.horizontal, 3)
                            .background(RoundedRectangle(cornerRadius: 4).fill(isPaused ? Color.white.opacity(0.14) : LevelMeter.accent.opacity(0.42)))
                    }
                    Text(parts.ahead).foregroundStyle(Self.ahead)
                }
            }
        }
        .font(.system(size: 13))
        .lineLimit(1)
        .textSelection(.enabled)
    }
}

// newest level in the centre, older ones moving outward on both sides. a 60 fps timeline while speech with a signal
// plays — measured: +7 % of one core at 60, +11 % at 120, with the eased bars equally smooth to the eye; paused,
// stopped or idle it draws once and holds
struct LevelMeter: View {
    // the one accent (Linear's indigo), on live bars only; at rest the bars are dim dots
    static let accent = Color(red: 0.56, green: 0.58, blue: 1.0)
    let meter: Meter
    let isRunning: Bool
    // paused, the wave keeps its last shape in grey
    let isPaused: Bool

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 60, paused: !isRunning)) { context in
            Canvas { canvas, size in
                let levels = meter.frame(at: context.date)
                let width: CGFloat = 2.5
                let gap: CGFloat = 2.5
                var x = (size.width - CGFloat(levels.count) * (width + gap) + gap) / 2
                for level in levels {
                    let height = max(width, CGFloat(level) * size.height)
                    let bar = CGRect(x: x, y: (size.height - height) / 2, width: width, height: height)
                    canvas.fill(Path(roundedRect: bar, cornerRadius: width / 2), with: .color(level <= 0.04 ? Color.white.opacity(0.22) : isPaused ? Color.white.opacity(0.45) : Self.accent))
                    x += width + gap
                }
            }
        }
        .frame(height: 20)
        .accessibilityHidden(true)
    }
}

struct PillButton: View {
    @ObservedObject var model: PanelModel
    let symbol: String
    let label: String
    var isOn = false
    var isDisabled = false
    let action: () -> Void

    private var isHovered: Bool { model.hovered == label }

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(isOn ? LevelMeter.accent : Color.white.opacity(0.72))
                .frame(minWidth: 26, minHeight: 26)
                .background(Capsule().fill(isOn ? LevelMeter.accent.opacity(0.28) : Color.white.opacity(isHovered ? 0.12 : 0)))
            .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.35 : 1)
        .help(label)
        .accessibilityLabel(label)
        .onHover { isHovered in
            model.hovered = isHovered ? label : nil
            if isHovered { NSCursor.pointingHand.push() } else { NSCursor.pop() }
        }
    }
}

// the frosted material, following the system appearance
struct VisualEffect: NSViewRepresentable {
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = .hudWindow
        view.blendingMode = .behindWindow
        view.state = .active
        return view
    }

    func updateNSView(_ view: NSVisualEffectView, context: Context) {}
}

@MainActor
final class Panel: SpeechPill {
    let model: PanelModel
    private let settings: @MainActor () -> Config
    // the infinite waveform's unsaved glide and flow, in force only while it runs
    private final class Wave { var tuning: (glide: Double, flow: Double)? }
    private let unsaved = Wave()
    private lazy var window: NSPanel = {
        let panel = NSPanel(
            contentRect: NSRect(origin: .zero, size: PanelView.size(hasSentenceRow: false)),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: true,
        )
        panel.level = .floating
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.hidesOnDeactivate = false
        panel.backgroundColor = .clear
        // dark glass in both system themes, the Whispr feel
        panel.appearance = NSAppearance(named: .darkAqua)
        panel.isOpaque = false
        panel.hasShadow = true
        panel.contentView = NSHostingView(rootView: PanelView(model: model))
        return panel
    }()
    private var dragStart: (mouse: NSPoint, origin: NSPoint)?
    // how far into the read's sound the listener is, in seconds at 1×: brings up each queued sentence
    var position: () -> Double = { 0 }
    private var sentenceTimer: Timer?

    init(settings: @escaping @MainActor () -> Config) {
        self.settings = settings
        model = PanelModel(tuning: { [unsaved] in unsaved.tuning ?? (settings().meterGlideMs, settings().meterFlowMs) })
        model.onDrag = { [weak self] in self?.drag() }
        model.onDragEnd = { [weak self] in self?.dragEnded() }
    }

    private func drag() {
        let mouse = NSEvent.mouseLocation
        let start = dragStart ?? (mouse, window.frame.origin)
        dragStart = start
        window.setFrameOrigin(NSPoint(x: start.origin.x + mouse.x - start.mouse.x, y: start.origin.y + mouse.y - start.mouse.y))
    }

    // where the pill sits is remembered per display, as an offset inside that display's visible frame
    private func dragEnded() {
        dragStart = nil
        let centre = NSPoint(x: window.frame.midX, y: window.frame.midY)
        guard let screen = NSScreen.screens.first(where: { $0.frame.contains(centre) }) ?? window.screen else { return }
        var positions = UserDefaults.standard.dictionary(forKey: "panelPositions") as? [String: [Double]] ?? [:]
        positions[Self.key(screen)] = [window.frame.minX - screen.visibleFrame.minX, window.frame.minY - screen.visibleFrame.minY]
        UserDefaults.standard.set(positions, forKey: "panelPositions")
    }

    // the screen under the pointer, at its remembered spot or bottom centre above the dock
    private func placeOnPointerScreen() {
        let mouse = NSEvent.mouseLocation
        guard let screen = NSScreen.screens.first(where: { $0.frame.contains(mouse) }) ?? NSScreen.main else { return }
        let area = screen.visibleFrame
        let saved = (UserDefaults.standard.dictionary(forKey: "panelPositions") as? [String: [Double]])?[Self.key(screen)]
        let size = window.frame.size
        let offset = saved.map { NSPoint(x: $0[0], y: $0[1]) } ?? NSPoint(x: (area.width - size.width) / 2, y: 24)
        window.setFrameOrigin(NSPoint(
            x: area.minX + min(max(0, offset.x), area.width - size.width),
            y: area.minY + min(max(0, offset.y), area.height - size.height),
        ))
    }

    private static func key(_ screen: NSScreen) -> String {
        let number = screen.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? CGDirectDisplayID ?? 0
        return CGDisplayCreateUUIDFromDisplayID(number).map { CFUUIDCreateString(nil, $0.takeRetainedValue()) as String } ?? "\(number)"
    }

    func follow(_ playback: Playback) {
        let isNew = playback.read != model.state.playback.read
        model.state.follow(playback)
        if playback == .idle { return leave() }
        guard isNew else { return }
        model.meter.reset()
        endWave()
        if let lead = settings().chain[.en]?.first { model.speed = settings()[lead].speed }
        show()
    }

    func queues(_ text: String, from start: Double) {
        model.state.queue(text, from: start)
        guard sentenceTimer == nil else { return }
        sentenceTimer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self else { return }
                let before = self.model.state.sentence
                self.model.state.advance(to: self.position())
                if self.model.state.sentence != before { self.fitWindow() }
            }
        }
    }

    func noticed(_ notice: PillModel.Notice) {
        model.state.noticed(notice)
        fitWindow()
    }

    // the body grows and shrinks from its top edge, so the control row stays put; at the screen's bottom edge the
    // whole pill moves up by what it gained instead (the FRM-290 spike, 26 Nov)
    private func fitWindow() {
        let size = PanelView.size(hasSentenceRow: model.state.hasSentenceRow)
        var frame = window.frame
        guard frame.size != size else { return }
        frame.origin.y = frame.maxY - size.height
        frame.size = size
        if let area = window.screen?.visibleFrame, frame.minY < area.minY { frame.origin.y = area.minY }
        window.setFrame(frame, display: true, animate: window.isVisible && !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion)
    }

    func leave() {
        sentenceTimer?.invalidate()
        sentenceTimer = nil
        endWave()
        model.state.leave()
        model.meter.reset()
        fitWindow()
        if !model.isSticky { hide() }
    }

    private func show() {
        if !window.isVisible { placeOnPointerScreen() }
        window.orderFrontRegardless()
    }

    func hide() {
        window.orderOut(nil)
        model.meter.reset()
        model.state.hasSignal = false
    }

    // the admin's infinite waveform: speech-shaped levels with no audio, so glide and flow can be tuned by eye with
    // their unsaved values. every call re-arms a 5-minute deadline; an admin tab that vanished cannot leave it running
    private var waveTimer: Timer?
    private var waveDeadline = Date.distantPast

    func wave(on: Bool, glide: Double?, flow: Double?) -> String? {
        guard on else {
            stopWave()
            return nil
        }
        if let refusal = model.state.startWave(isRenewal: glide == nil && flow == nil) { return refusal }
        let now = unsaved.tuning ?? (settings().meterGlideMs, settings().meterFlowMs)
        unsaved.tuning = (glide ?? now.glide, flow ?? now.flow)
        waveDeadline = Date().addingTimeInterval(300)
        guard waveTimer == nil else { return nil }
        show()
        let start = Date()
        waveTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self else { return }
                if Date() > self.waveDeadline { return self.stopWave() }
                let t0 = Date().timeIntervalSince(start)
                self.model.push((0..<10).map { Float(speechLevel(at: t0 + Double($0) * 0.01)) }, spacing: 0.01)
            }
        }
        return nil
    }

    private func stopWave() {
        guard waveTimer != nil else { return }
        endWave()
        if model.state.stopWave() { leave() }
    }

    private func endWave() {
        waveTimer?.invalidate()
        waveTimer = nil
        unsaved.tuning = nil
    }

    // what today's pill has of a model: its buttons, its stick, its wave at a standstill
    func show(_ fixture: PillModel) {
        if fixture.isReading {
            showSampleLevels()
            model.state.follow(.reading(1, isPaused: fixture.isPaused))
        }
        model.state.reads(fixture.sentence)
        if let notice = fixture.notice { model.state.noticed(notice) }
        if fixture.openRow?.control == .speed, let speed = fixture.openRow?.value { model.speed = speed }
        if fixture.hint?.control == .stop { model.hovered = "stop F5" }
        fitWindow()
        show()
    }

    private func showSampleLevels() {
        model.meter.show((0..<9).map { index in Float(0.85 - Double(index) * 0.08 + 0.12 * sin(Double(index) * 1.9)) })
    }

    func demo() {
        showSampleLevels()
        model.state.showSample()
        show()
    }
}
