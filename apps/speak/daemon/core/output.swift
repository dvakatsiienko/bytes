// what a read plays through: the audio engine and the mac voice answer to the same four
@MainActor
protocol SpeechOutput: AnyObject {
    // holds off a cloud engine's first-audio budget
    var isBusy: Bool { get }
    func pause()
    func resume()
    func stop()
}
