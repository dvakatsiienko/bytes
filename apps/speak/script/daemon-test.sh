#!/bin/sh
# compiles and runs the daemon's tests: the normalizer against golden.json, and the argv parser. mac only (swiftc).
# usage: script/daemon-test.sh
set -eu
cd "$(dirname "$0")/../daemon"
mkdir -p build
swiftc -parse-as-library normalize.swift arguments.swift daemon.test.swift -o build/daemon-test
./build/daemon-test golden.json
