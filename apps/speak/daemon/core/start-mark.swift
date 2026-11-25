import Foundation

// what a daemon that came up says of itself: its build, by the hash of its binary, and when
func startMark(build: String, at date: Date) -> String {
    "ok \(build) \(ISO8601DateFormatter().string(from: date))\n"
}
