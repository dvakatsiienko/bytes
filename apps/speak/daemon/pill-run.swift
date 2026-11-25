import AppKit

// the pill alone: no app part that reads a key, a socket or a sound is made
@MainActor
func showPill(_ fixture: PillFixture) {
    // read by the panel and never saved: stick is this run's own
    UserDefaults.standard.setVolatileDomain(["panelSticky": fixture.model.isStuck], forName: UserDefaults.argumentDomain)
    let panel = Panel(settings: { .fallback })
    panel.model.onClose = { exit(0) }
    Timer.scheduledTimer(withTimeInterval: 20, repeats: false) { _ in exit(0) }
    NSApplication.shared.setActivationPolicy(.prohibited)
    panel.show(fixture.model)
    withExtendedLifetime(panel) { NSApplication.shared.run() }
}
