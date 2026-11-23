#!/bin/sh
# typechecks the whole daemon, then compiles the whole core with its tests and runs them: the normalizer against
# golden.json, the argv parser, the config load line. the scripts' own tests run last, on stubs. mac only (swiftc).
# usage: script/daemon-test.sh
set -eu
cd "$(dirname "$0")/../daemon"
mkdir -p build
# the core decides without the mac, so its tests can build all of it: Foundation is the one module it may import
for module in $(swiftc -frontend -emit-imported-modules core/*.swift -module-name core -o -); do
    [ "$module" = Foundation ] || { echo "daemon-test: daemon/core imports $module" >&2; exit 1; }
done
# each part is handed what it needs: no module-level value, but a private constant of the core's
globals=$(grep -nE '^(@[A-Za-z]+(\([a-z]+\))? |private |fileprivate |internal |public |nonisolated(\(unsafe\))? )*(let|var) ' ./*.swift core/*.swift | grep -vE '^core/[^:]*:[0-9]+:private let ' || true)
[ -z "$globals" ] || { printf 'daemon-test: a module-level value\n%s\n' "$globals" >&2; exit 1; }
../script/daemon-compile.sh -typecheck
swiftc -parse-as-library -swift-version 5 core/*.swift test/*.swift -o build/daemon-test
./build/daemon-test golden.json config.json
../script/daemon-core.test.sh
../script/daemon-swap.test.sh
../script/daemon-try.test.sh
