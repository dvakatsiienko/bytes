#!/bin/sh
# the build's kept binary and the way back, in a scratch home. usage: script/daemon-swap.test.sh
here=$(cd "$(dirname "$0")" && pwd)
. "$here/daemon-scratch.sh"
build() { printf '%s' "$1" >"$state/next"; out=$("$root/app/script/daemon-build.sh" 2>&1); code=$?; }
rollback() { out=$("$root/app/script/daemon-rollback.sh" 2>&1); code=$?; }
logs() { echo "2026-11-23 10:00:00.500 config: $1" >>"$HOME/.local/share/x-speak/daemon.err.log"; }
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
setup; printf 'good' >"$libexec/x-speak.prev"; printf '{"error":"main thread blocked for 9.0 s","main":"blocked for 9.0 s"}' >"$state/status"; build new
is 'running with a stuck main thread: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; printf '{"speaking":false,"main":"blocked for 9.0 s"}' >"$state/status"; build new
is 'a stuck main thread with its last status: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; plist '/new/config.json'; build new
is 'the argument kept is the one the process runs with, not the next start'"'"'s' '/old/config.json' "$(bytes x-speak.prev.config)"
setup; build bad; started; rollback; build fix
is 'a build after a rollback keeps the binary that was put back' 'fix/old' "$(pair)"
build fix2
is 'a build after that one keeps it still' 'fix2/old' "$(pair)"
setup; build bad; started; rollback; rm "$state/inode" "$state/status"; build fix
is 'a build after a rollback nobody has seen answer: refused, both binaries stay' '1 old/bad' "$code $(pair)"
says 'a build after a rollback nobody has seen answer: says the two ways on' 'speak:rollback'
setup; build new; started; touch "$state/dies"; rollback; build fix
is 'a build after a rollback that failed: refused, both binaries stay' '1 old/new' "$code $(pair)"
rm "$state/dies"; printf '{"speaking":false}' >"$state/status"; rollback; build fix
is 'coming forward again opens the build, and the one that answers is kept' '0 fix/new' "$code $(pair)"
setup; stub nc 'cat >/dev/null; [ -f "$state/asked" ] && echo "{\"speaking\":false}" || echo "{\"error\":\"x\",\"main\":\"blocked for 0.1 s\"}"; touch "$state/asked"'; printf 'good' >"$libexec/x-speak.prev"; build new
is 'a main thread busy for a moment is asked again' 'new/old' "$(pair)"
setup; plist '/a b/config.json'; echo '/a b/config.json' >"$state/argument"; build new; started; rollback
says 'a config path with a space is read whole' 'config argument: the same'
setup; build two; started; rollback; rollback; rm "$state/inode" "$state/status"; build three
is 'a rollback that came forward again leaves the kept binary as it was' 'three/old' "$(pair)"
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

setup; printf 'good' >"$libexec/x-speak.prev"; touch "$state/no-grant"; rollback
is 'an installed binary with no signature to match: refused' '1 old/good' "$code $(pair)"

setup; build new; started; printf '{"paused":false,"speaking":true}' >"$state/status"; rollback
is 'reading aloud: one line' '1' "$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
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
is 'the binary rolled back is kept with the argument it ran with' '/old/config.json' "$(bytes x-speak.prev.config)"
setup; build new; started; rm "$libexec/x-speak.prev.config" "$libexec/x-speak.prev.settings"; rollback
says 'a build that recorded no argument is named' 'config argument: /old/config.json, the build recorded none'

setup; build new; started; stub nc 'cat >/dev/null; [ -f "$state/asked" ] && echo "{\"speaking\":true}" || echo "{\"speaking\":false}"; touch "$state/asked"'; rollback
is 'a read that starts after the first look: refused, the binaries back' '1 new/old' "$code $(pair)"
is 'a read that starts after the first look: no relaunch' '' "$(relaunches)"
setup; build new; started; echo 'loaded /c.json — other' >"$state/settings"; rollback
says 'changed settings are named' 'settings: loaded — other, the kept binary ran with loaded — same'
setup; build new; started; echo 'loaded /d.json — same' >"$state/settings"; rollback
says 'the same values from another place are the same' 'settings: the same'
setup; build new; started; logs 'loaded /c.json — other'; echo 'loaded /c.json — other' >"$state/settings"; rollback
says 'settings the new build changed are named' 'settings: loaded — other, the kept binary ran with loaded — same'
is 'the binary rolled back is kept with the settings it ran with' 'loaded — other' "$(bytes x-speak.prev.settings)"
setup; build new; started; logs 'running on the built-in defaults — /c.json: not readable'; rollback
says 'settings only the new build could not read are the same' 'settings: the same'
setup; logs 'kept the last good one — /c.json: bad'; build new; started; echo 'running on the built-in defaults — /c.json: bad' >"$state/settings"; rollback
says 'a restored daemon on the built-in defaults is named' 'settings: running on the built-in defaults'

setup; build new; started; echo /new/config.json >"$state/argument"; touch "$state/dies"; rollback
is 'a rollback that fails keeps the argument of the binary it put aside' '/new/config.json' "$(bytes x-speak.prev.config)"
is 'a restored daemon that never answers is an error' '1' "$code"
says 'a restored daemon that never answers is named' 'does not answer'
setup; build new; started; stub nc 'cat >/dev/null; if [ -f "$state/relaunches" ]; then echo "{\"error\":\"main thread blocked\",\"main\":\"blocked for 9.0 s\"}"; else echo "{\"speaking\":false}"; fi'; rollback
is 'a restored daemon with a stuck main thread is an error' '1' "$code"

setup; build new; started; echo /new/config.json >"$state/argument"; logs 'loaded /c.json — other'; stub_file "$root/app/script/daemon-relaunch.sh" 'echo "relaunch: x-speak is reading aloud now" >&2; exit 3'; rollback
is 'a refused relaunch leaves no trace of a rollback' no "$([ -f "$libexec/x-speak.prev.rolled-back" ] && echo yes || echo no)"
is 'a refused relaunch keeps what the kept binary ran with' '/old/config.json loaded — same' "$(bytes x-speak.prev.config) $(bytes x-speak.prev.settings)"
is 'a refused relaunch is an error' '1' "$code"
is 'a refused relaunch puts the binaries back' 'new/old' "$(pair)"

setup; build new; started; stub_file "$root/app/script/daemon-relaunch.sh" 'echo "relaunch: still loaded after 10 s" >&2; exit 1'; rollback
is 'a relaunch that fails while the old process stops leaves the restored binary in place' '1 old/new' "$code $(pair)"

setup; build new; started; touch "$state/bootstrap-fails"; rollback
is 'a relaunch that ends with nothing running leaves the restored binary in place' '1 old/new' "$code $(pair)"
says 'a relaunch that ends with nothing running says so' 'x-speak was not started'

setup; build new; started; touch "$state/bootstrap-refuses"; rollback
is 'a start that fails with the refusal'"'"'s number is no refusal' '1 old/new' "$code $(pair)"

setup; build new; started; touch "$state/other"; rollback
is 'launchd running another binary is an error' '1' "$code"
says 'launchd running another binary is named' 'another binary'

passed swap
