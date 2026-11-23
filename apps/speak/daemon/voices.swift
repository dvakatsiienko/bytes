import AVFoundation

// every installed en/uk/ru voice, best quality first — the mac voice card's dropdown
func installedVoices() -> [[String: String]] {
    AVSpeechSynthesisVoice.speechVoices()
        .filter { ["en", "uk", "ru"].contains(String($0.language.prefix(2))) && $0.gender == .female }
        .sorted { $0.quality.rawValue > $1.quality.rawValue }
        .map { ["id": $0.identifier, "name": $0.name, "lang": String($0.language.prefix(2)), "quality": ["", "default", "enhanced", "premium"][$0.quality.rawValue]] }
}
