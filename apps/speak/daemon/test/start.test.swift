// what the daemon starts and waits for: a program's output, the keys, kokoro's server. nothing here starts the server
import Foundation

@MainActor
enum StartTest {
    static func failures() async -> Int { await childFailures() + keysFailures() + kokoroFailures() }

    static func childFailures() async -> Int {
        let shell = { (line: String, deadline: Duration) async -> String in
            let began = ContinuousClock.now
            let said: String
            do { said = try await output(of: "/bin/sh", ["-c", line], environment: ["WORD": "key"], within: deadline) } catch { said = "\(error)" }
            return ContinuousClock.now - began > .seconds(2) ? "late \(said)" : said
        }
        var rows: [(name: String, got: String, want: String)] = [
            ("what it prints", await shell("printf '%s\\0%s' \"$WORD\" \"$NONE\"", .seconds(5)), "key\0"),
            ("nothing", await shell("exit 3", .seconds(5)), ""),
            ("more than a pipe holds", "\(await shell("head -c 200000 /dev/zero", .seconds(5)).count)", "200000"),
            ("a hang ends at its deadline", await shell("echo a; exec sleep 5", .milliseconds(100)), "timeout"),
            ("a child of its own holds the pipe: the deadline still ends it", await shell("sleep 3 & exit 0", .milliseconds(100)), "timeout"),
        ]
        do {
            _ = try await output(of: "/nonexistent/program", [], environment: [:], within: .seconds(5))
            rows.append(("a program that is not there", "ran", "threw"))
        } catch {
            rows.append(("a program that is not there", "\(error)" == "timeout" ? "timeout" : "threw", "threw"))
        }
        let many = await withTaskGroup(of: String.self) { group in
            for _ in 0..<24 { group.addTask { (try? await output(of: "/bin/sh", ["-c", "exec sleep 5"], environment: [:], within: .milliseconds(300))) ?? "over" } }
            group.addTask { try? await Task.sleep(for: .milliseconds(50)); return "free" }
            return await group.next() ?? ""
        }
        rows.append(("24 that hang leave a task its thread", many, "free"))
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-child-\(ProcessInfo.processInfo.processIdentifier)")
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: folder) }
        let mark = folder.appendingPathComponent("mark").path
        let cancelled = Task { try await output(of: "/bin/sh", ["-c", "echo > \(mark)"], environment: [:], within: .seconds(5)) }
        cancelled.cancel()
        _ = await cancelled.result
        try? await Task.sleep(for: .milliseconds(150))
        rows.append(("one cancelled before it ran never starts", "\(FileManager.default.fileExists(atPath: mark))", "false"))
        _ = await shell("echo $$ > \(mark); exec sleep 5", .milliseconds(150))
        let pid = (try? String(contentsOfFile: mark, encoding: .utf8)).flatMap { Int32($0.trimmingCharacters(in: .whitespacesAndNewlines)) } ?? 0
        for _ in 0..<40 where kill(pid, 0) == 0 { try? await Task.sleep(for: .milliseconds(25)) }
        rows.append(("a hang past its deadline is ended, not left", pid > 0 && kill(pid, 0) != 0 ? "ended" : "left", "ended"))
        let open = { (try? FileManager.default.contentsOfDirectory(atPath: "/dev/fd").count) ?? -1 }
        _ = await shell("exit 0", .seconds(5))
        let before = open()
        for _ in 0..<20 { _ = await shell("echo a", .seconds(5)) }
        for _ in 0..<5 { _ = await shell("exec sleep 5", .milliseconds(20)) }
        for _ in 0..<5 { _ = try? await output(of: "/nonexistent/program", [], environment: [:], within: .seconds(5)) }
        for _ in 0..<40 where open() > before { try? await Task.sleep(for: .milliseconds(25)) }
        rows.append(("no file stays open behind a run", "\(max(0, open() - before))", "0"))
        return check("child", rows)
    }

    static func keysFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        // the keys line of the three engines these rows are about, however many more the catalogue holds
        let about = { (line: String) in
            guard line.hasPrefix("keys: "), !line.hasPrefix("keys: not") else { return line }
            return "keys: " + line.dropFirst(6).components(separatedBy: ", ").filter { ["elevenlabs", "fish", "gemini"].contains($0.split(separator: " ").first.map(String.init)) }.joined(separator: ", ")
        }
        let row = { (name: String, act: @MainActor (Keys, PlantedRunner, Calls) async -> Void, want: String) in
            let calls = Calls(), runner = PlantedRunner()
            let keys = Keys(run: { try await runner.run($0) }, now: { runner.now }, log: { calls.made.append($0) })
            await act(keys, runner, calls)
            await settle()
            rows.append((name, (calls.made.map(about) + ["\(runner.asked) asked"]).joined(separator: " | "), want))
        }
        let press: @MainActor (Keys, PlantedRunner, TimeInterval) async -> Void = { keys, runner, seconds in
            runner.now += seconds
            keys.reloadIfMissing()
            await settle()
        }
        let keychain = { (name: String, held: [Engine: String], act: @MainActor (Keys, PlantedRunner) async -> Void, want: String) in
            let calls = Calls(), runner = PlantedRunner()
            let keys = Keys(run: { try await runner.run($0) }, keychain: { held[$0] }, now: { runner.now }, log: { calls.made.append($0) })
            await act(keys, runner)
            await settle()
            rows.append((name, (calls.made.map(about) + ["\(keys[.elevenlabs] ?? "-") \(keys[.fish] ?? "-") \(keys[.gemini] ?? "-")", "\(runner.asked) asked"]).joined(separator: " | "), want))
        }
        await keychain("a key in the keychain wins over the runner's", [.fish: "mine"], { keys, _ in await keys.load() },
                       "keys: elevenlabs ok, fish keychain, gemini ok | elevenlabs mine gemini | 1 asked")
        await keychain("one the runner has none of", [.fish: "mine"], { keys, runner in runner.missing = ["fish"]; await keys.load() },
                       "keys: elevenlabs ok, fish keychain, gemini ok | elevenlabs mine gemini | 1 asked")
        await keychain("every key in the keychain asks no runner", Dictionary(uniqueKeysWithValues: Engine.allCases.filter(\.isCloud).map { ($0, "x") }).merging([.elevenlabs: "a", .fish: "b", .gemini: "c"]) { $1 }, { keys, _ in await keys.load() },
                       "keys: elevenlabs keychain, fish keychain, gemini keychain | a b c | 0 asked")
        await keychain("a runner that fails leaves the keychain's", [.fish: "mine"], { keys, runner in runner.fails = true; await keys.load() },
                       "keys: not loaded — timeout | keys: elevenlabs missing, fish keychain, gemini missing | - mine - | 1 asked")
        let slow = PlantedRunner()
        slow.missing = ["gemini"]
        let open = NSLock()
        nonisolated(unsafe) var isOpen = true
        let locked = Keys(run: { try await slow.run($0) }, keychain: { engine in open.withLock { isOpen && engine == .fish ? "mine" : nil } }, now: { slow.now }, log: { _ in })
        await locked.load()
        open.withLock { isOpen = false }
        await press(locked, slow, 61)
        rows.append(("a keychain locked later takes no key back", "\(locked[.fish] ?? "-") \(slow.asked) asked", "mine 2 asked"))
        let alone = Keys(run: nil, keychain: { $0 == .gemini ? "mine" : nil }, log: { _ in })
        await alone.load()
        rows.append(("the keychain alone, with no runner", "\(alone[.gemini] ?? "-") \(alone[.fish] ?? "-")", "mine -"))
        await row("every key there", { keys, runner, calls in
            await keys.load()
            calls.made.append("\(keys[.elevenlabs] ?? "-") \(keys[.fish] ?? "-") \(keys[.gemini] ?? "-") \(keys[.kokoro] ?? "-")")
            await press(keys, runner, 61)
        }, "keys: elevenlabs ok, fish ok, gemini ok | elevenlabs fish gemini - | 1 asked")
        await row("a missing one is looked for a minute later, not sooner", { keys, runner, _ in
            runner.missing = ["fish"]
            await keys.load()
            await press(keys, runner, 60)
            runner.missing = []
            await press(keys, runner, 1)
        }, "keys: elevenlabs ok, fish missing, gemini ok | keys: elevenlabs ok, fish ok, gemini ok | 2 asked")
        await row("a run that failed keeps the keys it had, and is tried again", { keys, runner, calls in
            runner.missing = ["fish"]
            await keys.load()
            runner.fails = true
            await press(keys, runner, 61)
            calls.made.append(keys[.gemini] ?? "-")
            runner.fails = false
            await press(keys, runner, 61)
        }, "keys: elevenlabs ok, fish missing, gemini ok | keys: not loaded — timeout | gemini | keys: elevenlabs ok, fish missing, gemini ok | 3 asked")
        await row("one load at a time, and a minute from its end", { keys, runner, calls in
            runner.missing = ["fish"]
            await keys.load()
            runner.isHeld = true
            await press(keys, runner, 61)
            await press(keys, runner, 61)
            await press(keys, runner, 61)
            calls.made.append("held")
            runner.isHeld = false
            for _ in 0..<200 where calls.made.count < 3 { try? await Task.sleep(for: .milliseconds(5)) }
            await settle()
            await press(keys, runner, 60)
            calls.made.append("\(runner.asked) still")
            await press(keys, runner, 1)
        }, "keys: elevenlabs ok, fish missing, gemini ok | held | keys: elevenlabs ok, fish missing, gemini ok | 2 still | keys: elevenlabs ok, fish missing, gemini ok | 3 asked")
        await row("no press looks before the first load", { keys, runner, _ in await press(keys, runner, 600) }, "0 asked")
        // every keyed engine of the catalogue counts, however many there are
        let keyed = Engine.allCases.filter(\.isCloud)
        for engine in keyed {
            await row("\(engine)'s key alone missing is looked for", { keys, runner, calls in
                runner.missing = [engine.rawValue]
                await keys.load()
                await press(keys, runner, 61)
                calls.made = []
            }, "2 asked")
        }
        let four = PlantedRunner()
        four.missing = ["kokoro"]
        let keys = Keys(run: { try await four.run($0) }, names: Engine.allCases.filter { $0 != .system }.map { ($0, "\($0.rawValue.uppercased())_API_KEY") }, now: { four.now }, log: { _ in })
        await keys.load()
        await press(keys, four, 61)
        rows.append(("a fourth keyed engine's missing key is looked for", "\(four.asked) asked", "2 asked"))
        let none = Keys(run: nil, log: { _ in })
        await none.load()
        none.reloadIfMissing()
        rows.append(("no runner, no keys", keyed.compactMap { none[$0] }.joined(), ""))
        return check("keys", rows)
    }

    static func kokoroFailures() async -> Int {
        var rows: [(name: String, got: String, want: String)] = []
        let row = { (name: String, mayStart: Bool, act: @MainActor (KokoroServer, PlantedServer) async -> Void, want: String) in
            let calls = Calls(), server = PlantedServer(calls)
            let kokoro = KokoroServer(server, net: server, settings: { EngineConfig(voice: ["en": "af_sky"]) }, mayStart: mayStart, pause: .milliseconds(1), log: { calls.made.append("«\($0)»") })
            kokoro.onWarm = { calls.made.append("warm") }
            await act(kokoro, server)
            rows.append((name, calls.made.joined(separator: " | "), want))
        }
        await row("nothing answers: started, waited for, asked for a word", true, { kokoro, server in
            server.readyAfter = 3
            await kokoro.warm()
        }, "start | say Ready. af_sky | warm | «kokoro: warm»")
        await row("it loads its saved model, and fetches nothing", true, { kokoro, server in
            server.readyAfter = 3
            await kokoro.warm()
            server.calls.made = ["HF_HUB_OFFLINE=\(server.startedWith["HF_HUB_OFFLINE"] ?? "")"]
        }, "HF_HUB_OFFLINE=1")
        await row("one that answers is asked for a word", true, { kokoro, server in
            server.readyAfter = 0
            await kokoro.warm()
        }, "say Ready. af_sky | warm | «kokoro: warm»")
        await row("the wait ends at the first answer", true, { kokoro, server in
            server.readyAfter = 3
            await kokoro.warm()
            server.calls.made.append("\(server.looks) looks")
        }, "start | say Ready. af_sky | warm | «kokoro: warm» | 4 looks")
        await row("a word refused is not warm", true, { kokoro, server in
            (server.readyAfter, server.wordStatus) = (0, 500)
            await kokoro.warm()
        }, "say Ready. af_sky | «kokoro: its first word failed — status(500)»")
        await row("a word with no answer is not warm", true, { kokoro, server in
            (server.readyAfter, server.wordFails) = (0, true)
            await kokoro.warm()
        }, "say Ready. af_sky | «kokoro: its first word failed — timeout»")
        await row("one still loading after a minute is never joined by a second", true, { kokoro, server in
            server.readyAfter = 300
            await kokoro.warm()
            await kokoro.warm()
        }, "start | «kokoro: server not answering yet» | say Ready. af_sky | warm | «kokoro: warm»")
        await row("one that exits ends the wait, and the next warm-up starts another", true, { kokoro, server in
            server.readyAfter = 5
            server.exitsAfter = 2
            await kokoro.warm()
            server.exitsAfter = nil
            await kokoro.warm()
        }, "start | «kokoro: server exited before it answered» | start | say Ready. af_sky | warm | «kokoro: warm»")
        await row("one that will not start", true, { kokoro, server in
            server.refuses = true
            await kokoro.warm()
        }, "start | «kokoro: server did not start — timeout»")
        await row("a one-shot starts none", false, { kokoro, _ in await kokoro.warm() }, "")
        await row("a one-shot asks a live one for no word", false, { kokoro, server in
            server.readyAfter = 0
            await kokoro.warm()
        }, "")
        await row("two warm-ups at once are one", true, { kokoro, server in
            server.readyAfter = 3
            async let first: Void = kokoro.warm()
            async let second: Void = kokoro.warm()
            _ = await (first, second)
        }, "start | say Ready. af_sky | warm | «kokoro: warm»")
        return check("kokoro server", rows)
    }
}

// prints each key as its engine's name
final class PlantedRunner: @unchecked Sendable {
    var now = Date(timeIntervalSince1970: 1_000_000)
    var missing: Set<String> = []
    var prefix = ""
    var fails = false
    var isHeld = false
    private(set) var asked = 0

    func run(_ line: String) async throws -> String {
        asked += 1
        while isHeld { try? await Task.sleep(for: .milliseconds(5)) }
        if fails { throw EngineError.timeout }
        return line.split(separator: "\"").filter { $0.hasPrefix("${") }.map { name in
            let engine = name.dropFirst(2).prefix { $0 != "_" }.lowercased()
            return missing.contains(engine) ? "\0" : prefix + engine + "\0"
        }.joined()
    }
}

// a server that answers after so many looks at it
@MainActor
final class PlantedServer: LocalServer, Net {
    let calls: Calls
    private(set) var isRunning = false
    private(set) var startedWith: [String: String] = [:]
    var readyAfter = Int.max
    var exitsAfter: Int?
    var refuses = false
    var wordStatus = 200
    var wordFails = false
    private(set) var looks = 0
    private var looksRunning = 0

    init(_ calls: Calls) { self.calls = calls }

    func start(with environment: [String: String]) throws {
        startedWith = environment
        calls.made.append("start")
        if refuses { throw EngineError.timeout }
        isRunning = true
        looksRunning = 0
    }

    nonisolated func open(_ request: URLRequest) async throws -> (status: Int, body: AsyncThrowingStream<Data, Error>) { throw EngineError.timeout }

    nonisolated func whole(_ request: URLRequest) async throws -> (status: Int, body: Data) { try await answer(request) }

    private func answer(_ request: URLRequest) async throws -> (status: Int, body: Data) {
        if request.url?.lastPathComponent == "docs" {
            looks += 1
            if isRunning { looksRunning += 1 }
            if let exitsAfter, looksRunning > exitsAfter { isRunning = false }
            guard looks > readyAfter else { throw EngineError.timeout }
            return (200, Data())
        }
        let json = request.httpBody.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
        calls.made.append("say \(json?["input"] ?? "-") \(json?["voice"] ?? "-")")
        if wordFails { throw EngineError.timeout }
        return (wordStatus, Data())
    }
}
