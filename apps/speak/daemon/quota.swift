import Foundation

enum Quota {
    case left, empty(String, until: Date)

    // needs the key's «User» permission (user_read); a key without it answers 401 and the card keeps its last state
    static func elevenlabs(key: String?) async -> Quota? {
        guard let key else { return nil }
        var request = URLRequest(url: URL(string: "https://api.elevenlabs.io/v1/user/subscription")!)
        request.setValue(key, forHTTPHeaderField: "xi-api-key")
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let used = json["character_count"] as? Int, let limit = json["character_limit"] as? Int,
              let reset = json["next_character_count_reset_unix"] as? Double else { return nil }
        // a sentence costs 30–200 credits, so under 100 left a press fails more often than it plays
        guard limit - used < 100 else { return .left }
        let refill = Date(timeIntervalSince1970: reset)
        return .empty("\(limit - used) of \(limit) credits left, refills \(refill.formatted(.dateTime.month(.abbreviated).day()))", until: refill)
    }

    // the free model draws on no balance; a paid one spends the pay-as-you-go api credit, which has no refill date
    static func fish(key: String?, model: String) async -> Quota? {
        guard model.hasSuffix("-free") == false else { return .left }
        guard let key else { return nil }
        var request = URLRequest(url: URL(string: "https://api.fish.audio/wallet/self/api-credit")!)
        request.setValue("Bearer \(key)", forHTTPHeaderField: "authorization")
        guard let (data, _) = try? await URLSession.shared.data(for: request),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let credit = (json["credit"] as? String).flatMap(Double.init) else { return nil }
        return credit > 0 ? .left : .empty("api balance $0 — top up at fish.audio", until: Date().addingTimeInterval(3600))
    }
}
