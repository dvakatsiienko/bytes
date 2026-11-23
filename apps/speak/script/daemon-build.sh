#!/bin/sh
# builds x-speak and installs it where no repo move reaches it: the tests, the compile, the signature, then an
# atomic move into ~/.local/libexec/x-speak/. it never touches launchd: daemon-relaunch.sh starts the new binary.
# signed with the one local identity «x-speak local signing», so the Accessibility grant pins to the certificate
# and survives every rebuild. no ad-hoc fallback on purpose: a missing identity fails the build instead of
# shipping a binary that silently loses its grant. the running binary it replaces is kept for daemon-rollback.sh.
# usage: script/daemon-build.sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-installed.sh"
# a daemon with no settings runs on its built-in defaults: kokoro and the mac voice, no chain of dima's
[ -f "$settings" ] || refuse "no settings at $settings — script/settings-move.sh brings them, a new mac copies daemon/config.json there"
"$here/daemon-test.sh"
cd "$here/../daemon"
mkdir -p build
"$here/daemon-compile.sh" -O -o build/x-speak
codesign --force --sign 'x-speak local signing' --identifier com.dima.x-speak build/x-speak
lock_binaries
# only a binary that runs and answers is worth keeping: a build that never started must not push the good one out
runs=no
for _ in 1 2 3; do
    if daemon_answers && [ "$(running_inode)" = "$(stat -f %i "$installed" 2>/dev/null)" ]; then
        runs=yes
        break
    fi
    sleep 1
done
# after a rollback either of the two may be the good one, until the one put back answers
if [ "$runs" = no ] && [ -f "$rolled_back" ]; then
    refuse 'not installed — the binary the rollback put back does not answer. daemon-relaunch.sh starts it, speak:rollback comes forward again'
fi
if [ "$runs" = yes ] || { [ -f "$installed" ] && [ ! -f "$kept" ]; }; then
    cp "$installed" "$kept.new"
    mv -f "$kept.new" "$kept"
    rm -f "$rolled_back"
    if [ "$runs" = yes ]; then record_kept "$(running_argument)" "$(settings_line)"; else record_kept '' ''; fi
    if [ -f "$reads" ]; then cp "$reads" "$kept.reads"; else rm -f "$kept.reads"; fi
fi
mv -f build/x-speak "$installed"
printf '%s\n' "$settings" >"$reads"
echo "installed $installed — script/daemon-relaunch.sh starts it"
