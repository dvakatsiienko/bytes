// the one owner of the settings file: it is read again on the next F4 after a hand edit, and written here alone. a bad
// edit logs one line and the last good config stays; a save is checked first and lands whole or not at all
import Foundation

// the file as the page edits it, and the mark of the bytes it came from
struct SavedSettings {
    let config: Json
    let version: String
    // the bytes it replaced: a page that read those has missed nothing
    let was: String
}

enum SaveError: Error, CustomStringConvertible {
    case noVersion, noChange, stale, heartless, refused(String), notWritten(String)

    var description: String {
        switch self {
        case .noVersion: "a save needs the version it edits"
        case .noChange: "the save names no change"
        case .stale: "the settings changed since this page read them"
        case .heartless: "a heart needs an engine it knows, a voice, and on or off"
        case .refused(let reason): reason
        case .notWritten(let reason): "not written — \(reason)"
        }
    }
}

@MainActor
final class ConfigStore {
    private let url: URL
    private var loadedStamp: Date?
    private var lastError: String?
    private var hasLoaded = false
    private(set) var current = Config.fallback

    var path: String { url.path }
    // a link stays a link: its target is the file that is read and renamed over
    private var file: URL { url.resolvingSymlinksInPath() }

    private let write: (String) -> Void

    init(_ url: URL, log write: @escaping (String) -> Void = log) {
        self.url = url
        self.write = write
    }

    // cheap enough for every press: one stat, and a parse only when the file changed. returns the reason the
    // file on disk is not the one in use, if it is not
    @discardableResult
    func refresh() -> String? {
        let stamp = stamp()
        // a file that is not there has no stamp: it still gets its one «kept» line, or a wrong path runs silent
        guard stamp != loadedStamp || (stamp == nil && lastError == nil) else { return lastError }
        loadedStamp = stamp
        do {
            adopt(try JSONDecoder().decode(Config.self, from: Data(contentsOf: url)))
        } catch {
            // the admin's status line gets the short name, the log the full path
            let reason = stamp == nil ? "not readable" : configReason(error)
            lastError = named(reason)
            write("config: \(hasLoaded ? "kept the last good one" : "running on the built-in defaults") — \(url.path): \(reason)")
        }
        return lastError
    }

    // what the page edits; a file that does not load is a reason, never settings
    func saved() throws -> SavedSettings {
        let (data, json, _) = try onDisk()
        return SavedSettings(config: json, version: mark(data), was: mark(data))
    }

    // the changed keys alone, over the version they were made on
    func save(_ patch: Json?, over version: String?) throws -> SavedSettings {
        guard let version else { throw SaveError.noVersion }
        guard let patch, case .object(let changes) = patch, !changes.isEmpty else { throw SaveError.noChange }
        // a stale page must not write even over a broken file, so the version is read off the bytes
        guard let data = try? Data(contentsOf: url) else { throw SaveError.refused(named("not readable")) }
        guard mark(data) == version else { throw SaveError.stale }
        return try put(patch, over: data)
    }

    // one voice on or off, over the file as it stands, so no other edit rides along
    func heart(engine: String?, voice: String?, isOn: Bool?) throws -> SavedSettings {
        guard let engine = engine.flatMap(Engine.init), let voice, !voice.isEmpty, let isOn else { throw SaveError.heartless }
        let (data, _, config) = try onDisk()
        let others = config[engine].favourites.filter { $0 != voice || isOn }
        let favourites = isOn && !others.contains(voice) ? others + [voice] : others
        return try put(.object(["engines": .object([engine.rawValue: .object(["favourites": .array(favourites.map(Json.string))])])]), over: data)
    }

    private func put(_ patch: Json, over old: Data) throws -> SavedSettings {
        let before: Json = try decoded(old)
        let after = before.patched(by: patch)
        let data = Data((after.text() + "\n").utf8)
        let config: Config = try decoded(data)
        // a save never adds a name no engine answers to: a typo on the page is refused, a removed engine only loads past
        let was = (try? JSONDecoder().decode(Config.self, from: old))?.skipped ?? []
        if let typo = config.skipped.first(where: { !was.contains($0) }) { throw SaveError.refused(named(ConfigError.unknownName(typo).description)) }
        guard after != before else { return SavedSettings(config: before, version: mark(old), was: mark(old)) }
        // the rename is the write: until it, the file is the old one whole
        do { try data.write(to: file, options: .atomic) } catch { throw SaveError.notWritten(error.localizedDescription) }
        // the next press reads the file again: a hand edit right after the rename must not pass for this save
        loadedStamp = nil
        write("config: saved \(before.changes(to: after).joined(separator: ", "))")
        adopt(config)
        return SavedSettings(config: after, version: mark(data), was: mark(old))
    }

    private func adopt(_ config: Config) {
        current = config
        lastError = nil
        hasLoaded = true
        write("config: loaded \(url.path) — \(config.summary)")
        if !config.skipped.isEmpty { write("config: no engine named \(config.skipped.map { "«\($0)»" }.joined(separator: ", ")) in this build, skipped; the others load as named") }
    }

    private func onDisk() throws -> (data: Data, json: Json, config: Config) {
        guard let data = try? Data(contentsOf: url) else { throw SaveError.refused(named("not readable")) }
        return try (data, decoded(data), decoded(data))
    }

    private func decoded<T: Decodable>(_ data: Data) throws -> T {
        do { return try JSONDecoder().decode(T.self, from: data) } catch { throw SaveError.refused(named(configReason(error))) }
    }

    // read fresh: a url keeps its stat until the run loop turns, and a hand edit in that turn would be missed
    private func stamp() -> Date? { (try? FileManager.default.attributesOfItem(atPath: file.path))?[.modificationDate] as? Date }

    private func named(_ reason: String) -> String { "\(url.lastPathComponent): \(reason)" }

    // the bytes' fnv-1a: two files with one mark are the same file for a page
    private func mark(_ data: Data) -> String {
        String(data.reduce(0xcbf2_9ce4_8422_2325 as UInt64) { ($0 ^ UInt64($1)) &* 0x100_0000_01b3 }, radix: 16)
    }
}
