#!/bin/sh
# the daemon's source list, in one place; a relative output lands under daemon/.
# usage: script/daemon-compile.sh <swiftc options …>
set -eu
cd "$(dirname "$0")/../daemon"
swiftc -parse-as-library -swift-version 5 -suppress-warnings \
    normalize.swift arguments.swift config.swift control.swift panel.swift main.swift "$@"
