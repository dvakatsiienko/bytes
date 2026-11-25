// an engine's key in dima's keychain: `security add-generic-password -s x-speak -a <engine> -T <the installed binary> -w`
import Foundation
import Security

// no window over his screen, whatever the item's lock or owner asks: one that would ask reads as missing
func withNoKeychainWindows() { SecKeychainSetUserInteractionAllowed(false) }

@Sendable
func keychainKey(_ engine: Engine) -> String? {
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword, kSecAttrService: "x-speak", kSecAttrAccount: engine.rawValue,
        kSecMatchLimit: kSecMatchLimitOne, kSecReturnData: true, kSecUseAuthenticationUI: kSecUseAuthenticationUIFail,
    ]
    var found: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &found)
    if status != errSecSuccess, status != errSecItemNotFound { log("keychain: \(engine.rawValue) not read — \(status)") }
    let key = (found as? Data).map { String(decoding: $0, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines) }
    return key.flatMap { $0.isEmpty ? nil : $0 }
}
