#!/bin/sh
# the build's kept binary and the way back, in a scratch home. usage: script/daemon-swap.test.sh
here=$(cd "$(dirname "$0")" && pwd)
. "$here/daemon-scratch.sh"
build() { printf '%s' "$1" >"$state/next"; out=$("$root/app/script/daemon-build.sh" 2>&1); code=$?; }
rollback() { out=$("$root/app/script/daemon-rollback.sh" 2>&1); code=$?; }
pair() { printf '%s/%s' "$(bytes x-speak)" "$(bytes x-speak.prev)"; }

setup; build new
is 'a build keeps the running binary it replaces' 'new/old' "$(pair)"
is 'a build never relaunches' '' "$(relaunches)"
is 'the kept binary carries the config argument it ran with' '/old/config.json' "$(bytes x-speak.prev.config)"

setup; build two; build three
is 'a build over a binary that never started keeps the one that did' 'three/old' "$(pair)"

setup; build two; started; build three
is 'a build over a started binary keeps that one' 'three/two' "$(pair)"

setup; rm "$state/inode" "$state/status"; build new
is 'nothing running and nothing kept: the installed binary is kept' 'new/old' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; rm "$state/inode" "$state/status"; build new
is 'nothing running: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; rm "$state/status"; build new
is 'running but not answering: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; rm "$libexec/x-speak" "$state/inode" "$state/status"; build new
is 'a first install keeps nothing' 'new/none' "$(pair)"

for fault in compile-fails sign-fails; do
    setup; printf 'good' >"$libexec/x-speak.prev"; touch "$state/$fault"; build new
    is "a build that $fault changes nothing" 'old/good' "$(pair)"
done
setup; printf 'good' >"$libexec/x-speak.prev"; echo 1 >"$state/test-exit"; build new
is 'a build whose tests fail changes nothing' 'old/good' "$(pair)"

setup; rollback
is 'nothing kept: refused' '1' "$code"
is 'nothing kept: nothing changes' 'old/none' "$(pair)"
says 'nothing kept: says so' 'nothing to go back to'

setup; printf 'unsigned' >"$libexec/x-speak.prev"; rollback
is 'a kept binary with another signature: refused' '1' "$code"
is 'a kept binary with another signature: nothing changes' 'old/unsigned' "$(pair)"
is 'a kept binary with another signature: no relaunch' '' "$(relaunches)"

setup; build new; started; printf '{"paused":false,"speaking":true}' >"$state/status"; rollback
is 'reading aloud: refused' '1' "$code"
is 'reading aloud: nothing changes' 'new/old' "$(pair)"
is 'reading aloud: no relaunch' '' "$(relaunches)"
is 'reading aloud: the installed file is still the running one' "$(cat "$state/inode")" "$(stat -f %i "$libexec/x-speak")"

setup; build new; started; rollback
is 'a rollback succeeds' '0' "$code"
is 'a rollback swaps the two' 'old/new' "$(pair)"
is 'a rollback relaunches once' '1' "$(relaunches)"
is 'the running daemon is the installed file' "$(stat -f %i "$libexec/x-speak")" "$(cat "$state/inode")"
says 'a rollback names the running binary by hash' "$(printf old | shasum -a 256 | cut -c1-12)"
says 'a rollback says the settings are the same' 'settings: the same'
says 'a rollback says the config argument is the same' 'config argument: the same'
is 'a rollback never writes the plist' '/old/config.json' "$(plutil -extract ProgramArguments.2 raw "$HOME/Library/LaunchAgents/com.dima.x-speak.plist")"
rollback
is 'a second rollback comes back to the new one' 'new/old' "$(pair)"

setup; build new; started; rm "$state/status"
stub launchctl 'case "$1" in bootout) rm -f "$state/inode" ;; print) [ -f "$state/inode" ] && printf "\tpid = 1\n" ;;
    bootstrap) echo relaunch >>"$state/relaunches"; stat -f %i "$libexec/x-speak" >"$state/inode"; printf "{\"speaking\":false}" >"$state/status" ;; esac'
rollback
is 'a broken daemon that answers nothing is rolled back' '0 old/new' "$code $(pair)"

setup; build new; started; plist '/new/config.json'; rollback
says 'a changed config argument is named' 'config argument: /new/config.json, the kept binary ran with /old/config.json'

setup; build new; started; echo 'loaded /c.json — other' >"$state/settings"; rollback
says 'changed settings are named' 'settings: not the same'
setup; build new; started; echo 'running on the built-in defaults — /c.json: not readable' >"$state/settings"; rollback
says 'a restored daemon that cannot read its settings is named' 'settings: not the same'

setup; build new; started; touch "$state/dies"; rollback
is 'a restored daemon that never answers is an error' '1' "$code"
says 'a restored daemon that never answers is named' 'does not answer'

setup; build new; started; stub_file "$root/app/script/daemon-relaunch.sh" 'echo "relaunch: x-speak is reading aloud now" >&2; exit 1'; rollback
is 'a refused relaunch is an error' '1' "$code"
is 'a refused relaunch puts the binaries back' 'new/old' "$(pair)"

setup; build new; started; touch "$state/bootstrap-fails"; rollback
is 'a relaunch that ends with nothing running leaves the restored binary in place' '1 old/new' "$code $(pair)"
says 'a relaunch that ends with nothing running says so' 'x-speak is not running'

setup; build new; started; touch "$state/other"; rollback
is 'launchd running another binary is an error' '1' "$code"
says 'launchd running another binary is named' 'another binary'

passed swap
