// speechify over two answers recorded from its api on 26 Nov (marks as they came, the sound cut to four bytes):
// what it asks, and each mark lit through the word map to the grabbed word it speaks
import Foundation

@MainActor
enum SpeechifyTest {
    static let grabbed = "🎉 Ship R&D fixes in a 2-step move. Ask cc about the test, then the test again."
    static let recorded = [
        #"{"audio_data":"AQIDBA==","audio_format":"L16;rate=24000;channels=1","speech_marks":{"chunks":[{"type":"word","start":0,"end":4,"start_time":0,"end_time":324,"value":"Ship"},{"type":"word","start":5,"end":8,"start_time":324,"end_time":879,"value":"R&D"},{"type":"word","start":9,"end":14,"start_time":879,"end_time":1433,"value":"fixes"},{"type":"word","start":15,"end":17,"start_time":1433,"end_time":1519,"value":"in"},{"type":"word","start":18,"end":19,"start_time":1519,"end_time":1732,"value":"a"},{"type":"word","start":20,"end":26,"start_time":1732,"end_time":2201,"value":"2-step"},{"type":"word","start":27,"end":32,"start_time":2201,"end_time":2841,"value":"move."}]}}"#,
        #"{"audio_data":"AQIDBA==","audio_format":"L16;rate=24000;channels=1","speech_marks":{"chunks":[{"type":"word","start":0,"end":3,"start_time":0,"end_time":364,"value":"Ask"},{"type":"word","start":4,"end":10,"start_time":364,"end_time":705,"value":"Claude"},{"type":"word","start":11,"end":15,"start_time":705,"end_time":1047,"value":"Code"},{"type":"word","start":16,"end":21,"start_time":1047,"end_time":1217,"value":"about"},{"type":"word","start":22,"end":25,"start_time":1217,"end_time":1388,"value":"the"},{"type":"word","start":26,"end":31,"start_time":1388,"end_time":2412,"value":"test,"},{"type":"word","start":32,"end":36,"start_time":2412,"end_time":2625,"value":"then"},{"type":"word","start":37,"end":40,"start_time":2625,"end_time":2753,"value":"the"},{"type":"word","start":41,"end":45,"start_time":2753,"end_time":3137,"value":"test"},{"type":"word","start":46,"end":52,"start_time":3137,"end_time":3905,"value":"again."}]}}"#,
    ]

    static func failures() async -> Int {
        let chunks = spokenChunks(of: grabbed, .shipped, Cleaner(dictionary: [Cleaner.Entry(word: "cc", say: "Claude Code")]))
        // each mark as «the grabbed word it lights @ its second»
        let lights = { (chunk: Chunk, answer: String) async -> String in
            var got: [String] = []
            do {
                for try await piece in try Speechify(EngineParts(net: PlantedNet(body: [Data(answer.utf8)]), mac: PlantedMac())).render(chunk, EngineConfig(), key: "k") {
                    got.append(piece.pcm.map(String.init).joined(separator: "."))
                    got += piece.marks.map { mark in lit(mark, in: chunk).map { "\((grabbed as NSString).substring(with: NSRange($0)))@\($0.lowerBound)" } ?? "none" }
                }
            } catch {
                got.append("\(error)")
            }
            return got.joined(separator: " ")
        }
        // the planted net answers nothing, so the render fails after it asked
        let asked = { (settings: EngineConfig) async -> String in
            let net = PlantedNet()
            do { for try await _ in try Speechify(EngineParts(net: net, mac: PlantedMac())).render(Chunk(lang: .en, text: "Hi"), settings, key: "k") {} } catch {}
            return net.asked.joined()
        }
        var named = EngineConfig(voice: ["*": "geffen_32"])
        named.model = "simba-3.0"
        let oneDropped = recorded[1].replacingOccurrences(of: #"{"type":"word","start":11,"end":15,"start_time":705,"end_time":1047,"value":"Code"},"#, with: "")
        return check("speechify", [
            ("two chunks, the emoji cut", "\(chunks.count) «\(chunks[0].text)»", "2 «Ship R&D fixes in a 2-step move.»"),
            ("it asks for its marks with harper by default", await asked(EngineConfig()), #"POST https://api.sws.speechify.com/v1/audio/speech authorization=Bearer k {"audio_format":"pcm","input":"Hi","model":"simba-3.5","voice_id":"harper_32"}"#),
            ("a voice and a model named", await asked(named), #"POST https://api.sws.speechify.com/v1/audio/speech authorization=Bearer k {"audio_format":"pcm","input":"Hi","model":"simba-3.0","voice_id":"geffen_32"}"#),
            ("the first chunk's marks light their words", await lights(chunks[0], recorded[0]), "1.2.3.4 Ship@3 R&D@8 fixes@12 in@18 a@21 2-step@23 move@30"),
            ("the second's, the entry and the repeated word each its own", await lights(chunks[1], recorded[1]), "1.2.3.4 Ask@36 cc@40 cc@40 about@43 the@49 test@53 then@59 the@64 test@68 again@73"),
            ("a mark gone, the later ones still light", await lights(chunks[1], oneDropped), "1.2.3.4 Ask@36 cc@40 about@43 the@49 test@53 then@59 the@64 test@68 again@73"),
            ("an answer with no marks renders with none", await lights(chunks[0], #"{"audio_data":"AQIDBA=="}"#), "1.2.3.4"),
            ("a mark past the text is dropped", await lights(chunks[0], #"{"audio_data":"AQIDBA==","speech_marks":{"chunks":[{"type":"word","start":40,"end":44,"start_time":0}]}}"#), "1.2.3.4"),
            ("a mark counts scalars, a range utf-16 units", try! speechifyAnswer(Data(#"{"speech_marks":{"chunks":[{"type":"word","start":2,"end":3,"start_time":131}]}}"#.utf8), text: "𝔸 é").marks.map { "\($0.range) \($0.seconds)" }.joined(), "3..<4 0.131"),
            ("an answer that is no json fails the chunk", String(await lights(chunks[0], "no").prefix(41)), "Error Domain=NSCocoaErrorDomain Code=3840"),
        ])
    }
}
