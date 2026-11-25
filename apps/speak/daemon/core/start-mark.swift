import Foundation

// what a daemon that came up says of itself: whether it read its settings, its build, by the hash of its binary, and when
func startMark(build: String, hasSettings: Bool, at date: Date) -> String {
    "\(hasSettings ? "ok" : "no-settings") \(build) \(ISO8601DateFormatter().string(from: date))\n"
}
