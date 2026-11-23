import Foundation

struct Chunk {
    let lang: Lang
    let text: String
}

enum EngineError: Error {
    case noKey, noVoice, status(Int), timeout
    // the provider's own words, e.g. «you have 14 credits remaining, while 203 are required»
    case quota(String)
}

// sentences, and a long first sentence cut at its first comma past 40 chars, so audio starts early
func chunks(_ runs: [Run]) -> [Chunk] {
    var result: [Chunk] = []
    for run in runs {
        let marked = run.text.replacingOccurrences(of: "([.!?…;])\\s+", with: "$1\0", options: .regularExpression)
        for sentence in marked.split(separator: "\0") {
            var text = String(sentence)
            if result.isEmpty, text.count > 100, let comma = text.dropFirst(40).firstIndex(of: ",") {
                result.append(Chunk(lang: run.lang, text: String(text[...comma])))
                text = String(text[text.index(after: comma)...]).trimmingCharacters(in: .whitespaces)
            }
            result.append(Chunk(lang: run.lang, text: text))
        }
    }
    return result
}
