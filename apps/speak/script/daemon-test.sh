#!/bin/sh
# typechecks the whole daemon, then compiles and runs its tests: the normalizer against golden.json, the argv
# parser, the config load line. the build's kept binary, the way back and the try run last, on stubs. mac only (swiftc).
# usage: script/daemon-test.sh
set -eu
cd "$(dirname "$0")/../daemon"
mkdir -p build
../script/daemon-compile.sh -typecheck
swiftc -parse-as-library -swift-version 5 normalize.swift arguments.swift config.swift daemon.test.swift -o build/daemon-test
./build/daemon-test golden.json config.json
../script/daemon-swap.test.sh
../script/daemon-try.test.sh
