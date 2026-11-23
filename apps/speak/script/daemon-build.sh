#!/bin/sh
# builds x-speak and installs it where no repo move reaches it: the tests, the compile, the signature, then an
# atomic move into ~/.local/libexec/x-speak/. it never touches launchd: daemon-relaunch.sh starts the new binary.
# signed with the one local identity «x-speak local signing», so the Accessibility grant pins to the certificate
# and survives every rebuild. no ad-hoc fallback on purpose: a missing identity fails the build instead of
# shipping a binary that silently loses its grant.
# usage: script/daemon-build.sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
install_dir="$HOME/.local/libexec/x-speak"
"$here/daemon-test.sh"
cd "$here/../daemon"
mkdir -p build "$install_dir"
swiftc -O -parse-as-library -swift-version 5 -suppress-warnings \
    normalize.swift arguments.swift config.swift control.swift panel.swift main.swift -o build/x-speak
codesign --force --sign 'x-speak local signing' --identifier com.dima.x-speak build/x-speak
mv -f build/x-speak "$install_dir/x-speak"
echo "installed $install_dir/x-speak — script/daemon-relaunch.sh starts it"
