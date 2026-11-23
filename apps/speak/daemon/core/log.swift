import Foundation

func log(_ line: String) {
    let stamp = ISO8601DateFormatter.string(from: Date(), timeZone: .current, formatOptions: [.withFullDate, .withDashSeparatorInDate, .withSpaceBetweenDateAndTime, .withTime, .withColonSeparatorInTime, .withFractionalSeconds])
    FileHandle.standardError.write(Data("\(stamp) \(line)\n".utf8))
}

func elapsed(_ since: ContinuousClock.Instant) -> String {
    let ms = (ContinuousClock.now - since).components
    return "\(ms.seconds * 1000 + ms.attoseconds / 1_000_000_000_000_000) ms"
}

func seconds(_ duration: Duration) -> String {
    String(format: "%.1f s", Double(duration.components.seconds) + Double(duration.components.attoseconds) / 1e18)
}
