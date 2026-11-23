#!/bin/sh
# typechecks the whole daemon, then compiles and runs its tests: the normalizer against golden.json, the argv
# parser, the config load line. mac only (swiftc).
# usage: script/daemon-test.sh
set -eu
cd "$(dirname "$0")/../daemon"
mkdir -p build
swiftc -typecheck -parse-as-library -swift-version 5 -suppress-warnings \
    normalize.swift arguments.swift config.swift control.swift panel.swift main.swift
swiftc -parse-as-library -swift-version 5 normalize.swift arguments.swift config.swift daemon.test.swift -o build/daemon-test
./build/daemon-test golden.json config.json
