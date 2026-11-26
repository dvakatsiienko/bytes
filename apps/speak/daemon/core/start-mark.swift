import Foundation

// what a daemon that came up says of itself: whether it holds F4 and read its settings, its build, by the hash of its binary, and when.
// a daemon without F4 is not up, whatever it read
func startMark(build: String, hasSettings: Bool, hasF4: Bool, at date: Date) -> String {
    "\(!hasF4 ? "no-f4" : hasSettings ? "ok" : "no-settings") \(build) \(ISO8601DateFormatter().string(from: date))\n"
}
