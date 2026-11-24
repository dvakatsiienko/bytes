// what is left at a provider, and how long its refusal holds
import Foundation

struct Balance: Equatable {
    // credits or dollars; infinite where the model draws on none
    let left: Double
    var refills: Date?
    // what the card says when it is too little for a sentence
    var empty: String?
}

func jsonObject(_ request: URLRequest, _ net: any Net) async -> [String: Any]? {
    (try? await net.whole(request)).flatMap { try? JSONSerialization.jsonObject(with: $0.body) as? [String: Any] }
}

// an engine out of quota: what its card says, and when it may be tried again
struct QuotaHold: Equatable {
    let note: String
    let until: Date
    // what was left when it held, once a balance told it
    var left: Double?
    var refills: Date?
}

// the refusal knows no refill date
func refused(_ note: String, now: Date) -> QuotaHold { QuotaHold(note: note, until: now.addingTimeInterval(3600)) }

// a balance lifts a hold once it grew or the refill passed: 150 left refuse a sentence of 203 again and again
func after(_ balance: Balance, _ hold: QuotaHold?, now: Date) -> QuotaHold? {
    if let empty = balance.empty {
        return QuotaHold(note: empty, until: balance.refills ?? now.addingTimeInterval(3600), left: balance.left, refills: balance.refills)
    }
    guard var hold else { return nil }
    if let refills = hold.refills, refills <= now { return nil }
    guard let left = hold.left else {
        (hold.left, hold.refills) = (balance.left, balance.refills)
        return hold
    }
    return balance.left > left ? nil : hold
}
