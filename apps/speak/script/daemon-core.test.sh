#!/bin/sh
# the core is built whole and stays off the mac: files planted in a copy of it fail the test run, by name.
# usage: script/daemon-core.test.sh
set -u
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-scratch.sh"
app() {
    rm -rf "$root/app"
    mkdir -p "$root/app"
    cp -R "$here" "$root/app/script"
    cp -R "$here/../daemon" "$root/app/daemon"
    cp -R "$here/../contract" "$root/app/contract"
    for later in swap try core; do stub_file "$root/app/script/daemon-$later.test.sh" ':'; done
}
plant() { printf '%b\n' "$1" >"$root/app/daemon/core/Planted.swift"; }
run() { out=$("$root/app/script/daemon-test.sh" 2>&1); code=$?; }
# a whole run inside this one: its own red lines are the only clue
passes() { is "$1" 0 "$code"; [ "$code" = 0 ] || printf '%s\n' "$out" | grep -A 2 -E '✗|error' >&2; }

for line in 'import AppKit' '@preconcurrency import AVFoundation' 'import Carbon.HIToolbox' 'import class AppKit.NSColor' \
    'import Foundation; import AppKit' '@preconcurrency\nimport\n  Carbon' 'import SwiftUI'; do
    app; plant "$line"; run
    is "«${line}» in the core fails the run" 1 "$code"
    says "«${line}» in the core is named" "$(printf '%b' "$line" | grep -oE 'AppKit|AVFoundation|Carbon|SwiftUI')"
done

for line in '@MainActor let speaker = 1' '@MainActor var config: Int { 1 }' 'let configFile = 1' 'private let launch = 1' 'nonisolated(unsafe) var heartbeat = 1' \
    '@MainActor\nvar waveTuning: Int?' 'let controlSocket = "x"' 'private(set) var reads = 0' 'weak var panel: AnyObject?' \
    '@available(macOS 15, *) let voice = 1' 'import os; let cache = 1' 'package let quota = 1' '@_spi(X)  public let quota = 1' 'enum Shared { static var speaker = 1 }'; do
    app; printf '%b\n' "$line" >"$root/app/daemon/planted.swift"; run
    is "«${line}» in the shell fails the run" 1 "$code"
    says "«${line}» in the shell is named" 'planted.swift'
    says "«${line}» in the shell is named for what it is" 'a module-level value'
done
app; plant 'var counter = 1'; run
is 'a module-level variable in the core fails the run' 1 "$code"
says 'a module-level variable in the core is named' 'core/Planted.swift'
says 'a module-level variable in the core is named for what it is' 'a module-level value'

for line in 'private let at = NSHomeDirectory()' 'private let at = "/Users/dima/x"' 'private let at = "/.local/share/x"' 'private let at = "/tmp/x"' \
    'private let at = "~/x"' 'private let at = "file:///tmp/x"' 'private let at = FileManager.default.homeDirectoryForCurrentUser' \
    'private func at(_ p: Process) { p.currentDirectoryURL = FileManager.default.homeDirectoryForCurrentUser }' 'private let at = ["/bin/sh", "/tmp/x"]' \
    'private let at = FileManager.default.temporaryDirectory' 'private let at = URL.applicationSupportDirectory' 'private let at = FileManager.SearchPathDirectory.libraryDirectory'; do
    app; plant "$line"; run
    is "«${line}» outside the paths fails the run" 1 "$code"
    says "«${line}» outside the paths is named for what it is" 'a place named outside core/paths.swift'
done

for line in 'pill-run.swift App(arguments)' 'pill-run.swift Player(device: MacAudio())' 'pill-run.swift ReadRecords(path: "x", log: { _ in })' \
    'core/sound-cache.swift try? Data().write(to: at)' 'core/sound-cache.swift FileManager.default'; do
    app; printf '%s\n' "// ${line#* }" >>"$root/app/daemon/${line%% *}"; run
    is "«${line#* }» in ${line%% *} fails the run" 1 "$code"
    says "«${line#* }» in ${line%% *} is named for what it is" 'reaches past its part'
done

app; mv "$root/app/daemon/core/sound-cache.swift" "$root/app/daemon/core/kept-sounds.swift"; run
is 'a file held to its part that moved fails the run' 1 "$code"
says 'a file held to its part that moved is named' 'core/sound-cache.swift to hold to its part'

app; plant 'import Foundation\nprivate func at(_ p: Paths) { try? FileManager.default.createDirectory(atPath: p.settings, withIntermediateDirectories: true) }'; run
passes 'a folder made at one of the paths passes'

app; plant 'protocol Planted {\n    static var planted: Int { get }\n}'; run
passes 'what a protocol of the core asks for passes'
app; plant 'enum Planted {\n    static var planted: Int { 1 }\n}'; run
is 'a static var with a body fails the run' 1 "$code"

app; plant 'enum Planted { static let planted: Int = "a word" }'; run
is 'a core file with a wrong type fails the run' 1 "$code"
says 'a core file with a wrong type is named' 'Planted.swift'

passed core
