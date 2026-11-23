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
    for later in swap try core; do stub_file "$root/app/script/daemon-$later.test.sh" 'touch "$state/reached"'; done
    state="$root/app/state"
    export state
    mkdir -p "$state"
}
plant() { printf '%b\n' "$1" >"$root/app/daemon/core/Planted.swift"; }
run() { out=$("$root/app/script/daemon-test.sh" 2>&1); code=$?; }

for line in 'import AppKit' '@preconcurrency import AVFoundation' 'import Carbon.HIToolbox' 'import class AppKit.NSColor' \
    'import Foundation; import AppKit' '@preconcurrency\nimport\n  Carbon' 'import SwiftUI'; do
    app; plant "$line"; run
    is "«${line}» in the core fails the run" 1 "$code"
    says "«${line}» in the core is named" "$(printf '%b' "$line" | grep -oE 'AppKit|AVFoundation|Carbon|SwiftUI')"
done

app; plant 'let planted: Int = "a word"'; run
is 'a core file with a wrong type fails the run' 1 "$code"
says 'a core file with a wrong type is named' 'Planted.swift'

passed core
