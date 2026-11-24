// the daemon's tests, one binary. golden.json is dima's real text (tickets, commits, a url and a path
// mid-sentence) and what a voice should receive for it; the argv cases guard the launchd job's flags; the
// config cases guard the load line; config, chain and seams.test.swift hold the rest of the core. usage: daemon-test <golden.json> <config.json> <contract folder>
import Foundation

struct Case: Decodable {
    let `in`: String
    let out: [[String]]
}

@main
struct DaemonTest {
    @MainActor
    static func main() async throws {
        var failed = try goldenFailures(CommandLine.arguments[1]) + sourceFailures() + argvFailures() + configFailures(CommandLine.arguments[2]) + PathsTest.failures() + SchemaTest.failures(CommandLine.arguments[3] + "/config.schema.json") + ConfigTest.failures() + StoreTest.failures() + ChainTest.failures() + WordListsTest.failures()
        failed += try WireTest.failures(CommandLine.arguments[3] + "/wire.schema.json")
        failed += await SeamsTest.failures() + SpeakerTest.failures() + EnginesTest.failures() + StartTest.failures()
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

    // each chunk's own part of the grabbed text
    static func sourceFailures() -> Int {
        let long = String(repeating: "word ", count: 80) + "end."
        let parts = { (text: String) in spokenChunks(of: text).map { (text as NSString).substring(with: NSRange($0.source)) }.joined(separator: " | ") }
        let nul = "one.\u{0} " + String(repeating: "x", count: 310)
        let began = ContinuousClock.now
        _ = normalize(String(repeating: " ", count: 20_000))
        return check("source", [
            ("two sentences", parts("Hello there.  And bye!"), "Hello there. | And bye!"),
            ("a line end the voice gets a dot for", parts("say «done»\nthen go. ok"), "say «done»\n | then go. | ok"),
            ("two languages", parts("Read it: «привіт» 🎉 and go."), "Read it: | привіт | and go."),
            ("a list whose lines were glued", parts("lane1. merge now.2. sleep well"), "lane | 1. merge now. | 2. sleep well"),
            ("a path, an id and a unit", parts("Open docs/test-drive/exa.md. Then FRM-266 in 5ms. Bye."), "Open docs/test-drive/exa.md. | Then FRM-266 in 5ms. | Bye."),
            ("markdown around it", parts("## **One.**\n- [two](https://x.y/z). three"), "One. | two](https://x.y/z). | three"),
            ("an end and a start that share one character", parts("a — b\n@tanstack/router"), "a — b\n | @tanstack/router"),
            ("a link of three sentences", parts("see [first. second. third](https://example.com/very/long/path) and then. ok"), "see [first. | second. | third](https://example.com/very/long/path) and then. | ok"),
            ("a link of one letter", parts("See this. [1](http://x.y) and more words. ok"), "See this. | 1](http://x.y) and more words. | ok"),
            ("a link whose last sentence is one letter", parts("[Go. И](http://x.y) так"), "Go. | И](http://x.y) так"),
            ("an emphasis of one letter", parts("done. *I* go. ok"), "done. | I* go. | ok"),
            ("a url at the end is whole", parts("Docs at https://x.y/very/long/path"), "Docs at https://x.y/very/long/path"),
            ("a NUL before a sentence makes no empty chunk", "\(spokenChunks(of: nul).filter(\.text.isEmpty).count)", "0"),
            ("a blank grab is quick", ContinuousClock.now - began < .seconds(1) ? "quick" : "slow", "quick"),
            ("a code fence first", parts("```\nlet a = 1\n```\nDone. ok"), "```\nlet a = 1\n``` | Done. | ok"),
            ("a code fence", parts("Look:\n```\nlet a = 1\n```\nDone. ok"), "Look:\n```\nlet a = 1\n``` | Done. | ok"),
            ("a cut between «number» and its digits", parts("Hi. " + String(repeating: "abcdefgh ", count: 32) + "aaaaa #123456 tail here and more words"), "Hi. | " + String(repeating: "abcdefgh ", count: 32) + "aaaaa # | 123456 tail here and more words"),
            ("a long sentence, cut", parts("Hi. " + long), "Hi. | " + String(repeating: "word ", count: 60).dropLast() + " | " + String(repeating: "word ", count: 20) + "end."),
        ])
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
            // a chunk comes from inside the text, after the one before it
            let sources = spokenChunks(of: item.in).map(\.source)
            if !zip(sources, sources.dropFirst()).allSatisfy({ $0.upperBound <= $1.lowerBound }) || sources.contains(where: { $0.isEmpty || $0.upperBound > item.in.utf16.count }) {
                failed += 1
                print("✗ \(item.in)\n  sources \(sources)")
            }
            // and holds the words it says, those the text has
            let words = { (text: String) in Set(text.lowercased().split { !$0.isLetter }.map(String.init).filter { $0.count > 3 }) }
            for chunk in spokenChunks(of: item.in) {
                let gone = words(chunk.text).intersection(words(item.in)).subtracting(words((item.in as NSString).substring(with: NSRange(chunk.source))))
                if gone.isEmpty { continue }
                failed += 1
                print("✗ \(item.in)\n  «\(chunk.text)» without \(gone)")
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
