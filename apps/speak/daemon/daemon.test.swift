// the daemon's tests, one binary. golden.json is dima's real text (tickets, commits, a url and a path
// mid-sentence) and what a voice should receive for it; the argv cases guard the launchd job's flags.
// usage: daemon-test <golden.json>
import Foundation

struct Case: Decodable {
    let `in`: String
    let out: [[String]]
}

@main
struct DaemonTest {
    static func main() throws {
        let failed = try goldenFailures(CommandLine.arguments[1]) + argvFailures()
        exit(failed == 0 ? 0 : 1)
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
        return failed
    }
}
