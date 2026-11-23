#!/bin/sh
# the whole daemon, core and shell, by folder; a relative output lands under daemon/.
# usage: script/daemon-compile.sh <swiftc options …>
set -eu
cd "$(dirname "$0")/../daemon"
swiftc -parse-as-library -swift-version 5 -suppress-warnings core/*.swift ./*.swift "$@"
