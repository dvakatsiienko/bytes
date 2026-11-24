// the daemon's tests, one binary. golden.json is dima's real text (tickets, commits, a url and a path
// mid-sentence) and what a voice should receive for it; the argv cases guard the launchd job's flags; the
// config cases guard the load line; config, chain and seams.test.swift hold the rest of the core. usage: daemon-test <golden.json> <config.json> <config.schema.json>
import Foundation

struct Case: Decodable {
    let `in`: String
    let out: [[String]]
}

@main
struct DaemonTest {
    @MainActor
    static func main() async throws {
        var failed = try goldenFailures(CommandLine.arguments[1]) + argvFailures() + configFailures(CommandLine.arguments[2]) + PathsTest.failures() + SchemaTest.failures(CommandLine.arguments[3]) + ConfigTest.failures() + StoreTest.failures() + ChainTest.failures()
        failed += await SeamsTest.failures()
        exit(failed == 0 ? 0 : 1)
    }

    // the load line is the switch's proof that the right file is in use: what it prints, and what a bad path says
    @MainActor
    static func configFailures(_ shipped: String) throws -> Int {
        let fixture = FileManager.default.temporaryDirectory.appendingPathComponent("x-speak-test-\(ProcessInfo.processInfo.processIdentifier).json")
        defer { try? FileManager.default.removeItem(at: fixture) }
        try Data(#"{"chain":{"en":["kokoro"]},"firstAudioMs":900,"engines":{"elevenlabs":{"voice":{"en":"Jessica","*":"Sarah"},"gain":1.2},"system":{}}}"#.utf8).write(to: fixture)
        let good = ConfigStore(fixture)
        let missing = ConfigStore(URL(fileURLWithPath: "/nonexistent/x-speak/config.json"))
        let cases: [(name: String, passes: Bool)] = [
            ("the fixture loads", good.refresh() == nil),
            ("the summary prints every voice, speed and gain", good.current.summary == "elevenlabs: voice *=Sarah,en=Jessica, speed 1.0, gain 1.2; system: voice -, speed 1.0, gain 1.0"),
            ("a missing file is an error the admin can show", missing.refresh() == "config.json: not readable"),
            ("the missing file's error stays on the next press", missing.refresh() == "config.json: not readable"),
            ("the shipped config.json loads", ConfigStore(URL(fileURLWithPath: shipped)).refresh() == nil),
        ]
        for item in cases where !item.passes { print("✗ config: \(item.name)") }
        let failed = cases.filter { !$0.passes }.count
        print("\(cases.count - failed)/\(cases.count) config cases pass")
        return failed
    }

    static func goldenFailures(_ path: String) throws -> Int {
        let cases = try JSONDecoder().decode([Case].self, from: Data(contentsOf: URL(fileURLWithPath: path)))
        var failed = 0
        for item in cases {
            let got = normalize(item.in).map { [$0.lang.rawValue, $0.text] }
            if got != item.out {
                failed += 1
                print("✗ \(item.in)\n  want \(item.out)\n  got  \(got)")
            }
        }
        print("\(cases.count - failed)/\(cases.count) golden cases pass")
        return failed
    }

    // launchd restarts a daemon that exits, so a flag read as text to speak is a 30 s relaunch loop
    static func argvFailures() -> Int {
        let cases: [(argv: [String], want: Result<Arguments, ArgumentsError>)] = [
            (["--config", "/c.json"], .success(Arguments(configPath: "/c.json"))),
            (["--config", "/c.json", "--keys-run", "/op-run.sh"], .success(Arguments(configPath: "/c.json", keysRunPath: "/op-run.sh"))),
            (["--keys-run", "/op-run.sh", "--config", "/c.json"], .success(Arguments(configPath: "/c.json", keysRunPath: "/op-run.sh"))),
            (["--config", "/c.json", "--engine", "kokoro", "hello", "there"], .success(Arguments(configPath: "/c.json", engine: "kokoro", text: ["hello", "there"]))),
            (["hello", "--config", "/c.json", "there"], .success(Arguments(configPath: "/c.json", text: ["hello", "there"]))),
            ([], .failure(.missingConfig)),
            (["hello"], .failure(.missingConfig)),
            (["--config"], .failure(.missingValue("--config"))),
            (["--config", "--keys-run", "/op-run.sh"], .failure(.missingValue("--config"))),
            (["--config", "/c.json", "--keys-run"], .failure(.missingValue("--keys-run"))),
            (["--config", "/c.json", "--keysrun", "/op-run.sh"], .failure(.unknownFlag("--keysrun"))),
            (["--config", "/c.json", "--engine", "kokoro"], .failure(.engineWithoutText)),
            (["--config", "/c.json", "-keys-run", "/op-run.sh"], .failure(.unknownFlag("-keys-run"))),
            (["--config", ""], .failure(.missingValue("--config"))),
        ]
        var failed = 0
        for item in cases {
            let got = Result { try Arguments.parse(item.argv) }.mapError { $0 as? ArgumentsError ?? .missingConfig }
            if got != item.want {
                failed += 1
                print("✗ argv \(item.argv)\n  want \(item.want)\n  got  \(got)")
            }
        }
        print("\(cases.count - failed)/\(cases.count) argv cases pass")
        return failed + kokoroStartFailures()
    }

    static func kokoroStartFailures() -> Int {
        let cases: [(argv: [String], want: Bool)] = [
            (["--config", "/c.json"], true),
            (["--config", "/c.json", "--keys-run", "/op-run.sh"], true),
            (["--config", "/c.json", "hello"], false),
            (["--config", "/c.json", "--keys-run", "/op-run.sh", "hello"], false),
            (["--config", "/c.json", "--engine", "kokoro", "hello"], false),
        ]
        let failing = cases.filter { (try? Arguments.parse($0.argv))?.mayStartKokoro != $0.want }
        for item in failing { print("✗ kokoro start \(item.argv)\n  want \(item.want)") }
        print("\(cases.count - failing.count)/\(cases.count) kokoro start cases pass")
        return failing.count
    }
}
