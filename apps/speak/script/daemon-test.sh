#!/bin/sh
# typechecks the whole daemon, then compiles the whole core with its tests and runs them: the normalizer against
# golden.json, the argv parser, the settings file, the read path, the seams. the scripts' own tests run last, on
# stubs. mac only (swiftc).
# usage: script/daemon-test.sh
set -eu
cd "$(dirname "$0")/../daemon"
mkdir -p build
# the core decides without the mac, so its tests can build all of it: Foundation is the one module it may import
for module in $(swiftc -frontend -emit-imported-modules core/*.swift -module-name core -o -); do
    [ "$module" = Foundation ] || { echo "daemon-test: daemon/core imports $module" >&2; exit 1; }
done
# each part is handed what it needs: no module-level value, a `static var` included, but a private constant of the core's
globals=$(grep -nE '^(@[A-Za-z_]+(\([^)]*\))? +|[a-z]+(\([a-z]+\))? +|import [A-Za-z.]+; *)*(let|var) |(^|[ {;])static (weak )?var ' ./*.swift core/*.swift | grep -vE '^core/[^:]*:[0-9]+:private let ' || true)
[ -z "$globals" ] || { printf 'daemon-test: a module-level value\n%s\n' "$globals" >&2; exit 1; }
places=$(grep -nE 'NSHomeDirectory|homeDirectory|\.applicationSupportDirectory|"(/Users|~/|/\.local|/Library)' ./*.swift core/*.swift | grep -v '^core/paths\.swift:' || true)
[ -z "$places" ] || { printf 'daemon-test: a place named outside core/paths.swift\n%s\n' "$places" >&2; exit 1; }
../script/daemon-compile.sh -typecheck
swiftc -parse-as-library -swift-version 5 core/*.swift test/*.swift -o build/daemon-test
./build/daemon-test golden.json config.json ../contract/config.schema.json
../script/daemon-core.test.sh
../script/daemon-swap.test.sh
../script/daemon-try.test.sh
