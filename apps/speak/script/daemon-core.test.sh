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
    for later in swap try core; do stub_file "$root/app/script/daemon-$later.test.sh" ':'; done
}
plant() { printf '%b\n' "$1" >"$root/app/daemon/core/Planted.swift"; }
run() { out=$("$root/app/script/daemon-test.sh" 2>&1); code=$?; }

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

app; plant 'enum Planted { static let planted: Int = "a word" }'; run
is 'a core file with a wrong type fails the run' 1 "$code"
says 'a core file with a wrong type is named' 'Planted.swift'

passed core
