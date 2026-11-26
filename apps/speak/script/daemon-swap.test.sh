#!/bin/sh
# the build's kept binary and the way back, in a scratch home. usage: script/daemon-swap.test.sh
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-scratch.sh"
build() { printf '%s' "$1" >"$state/next"; out=$("$root/app/script/daemon-build.sh" 2>&1); code=$?; }
rollback() { out=$("$root/app/script/daemon-rollback.sh" 2>&1); code=$?; }
logs() { echo "2026-11-23 10:00:00.500 config: $1" >>"$HOME/.local/share/x-speak/daemon.err.log"; }
pair() { printf '%s/%s' "$(content_of x-speak)" "$(content_of x-speak.prev)"; }

setup; build new
is 'a build keeps the running binary it replaces' 'new/old' "$(pair)"
is 'a build never relaunches' '' "$(relaunches)"
is 'the kept binary carries the config argument it ran with' '/old/config.json' "$(content_of x-speak.prev.config)"

setup; echo '2026-11-23 10:00:00.700 press: grab ax 9 ms, normalize 9 ms, 1 chunks, 40 characters «config: loaded /c.json — a selected text»' >>"$HOME/.local/share/x-speak/daemon.err.log"; build new
is 'a selected text in the log is no settings line' 'loaded — same' "$(content_of x-speak.prev.settings)"

setup; build two; build three
is 'a build over a binary that never started keeps the one that did' 'three/old' "$(pair)"

setup; build two; started; build three
is 'a build over a started binary keeps that one' 'three/two' "$(pair)"

setup; rm "$state/inode" "$state/status"; build new
is 'nothing running and nothing kept: the installed binary is kept' 'new/old' "$(pair)"
is 'nothing running and nothing kept: what it ran with is not made up' '' "$(content_of x-speak.prev.config)$(content_of x-speak.prev.settings)"
setup; printf 'good' >"$libexec/x-speak.prev"; rm "$state/inode" "$state/status"; build new
is 'nothing running: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; rm "$state/status"; build new
is 'running but not answering: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; printf '{"error":"main thread blocked for 9.0 s","main":"blocked for 9.0 s"}' >"$state/status"; build new
is 'running with a stuck main thread: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; printf 'good' >"$libexec/x-speak.prev"; printf '{"speaking":false,"main":"blocked for 9.0 s"}' >"$state/status"; build new
is 'a stuck main thread with its last status: a kept binary is not overwritten' 'new/good' "$(pair)"
setup; plist '/new/config.json'; build new
is 'the argument kept is the one the process runs with, not the next start'"'"'s' '/old/config.json' "$(content_of x-speak.prev.config)"
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
is 'the binary rolled back is kept with the argument it ran with' '/old/config.json' "$(content_of x-speak.prev.config)"
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
is 'the binary rolled back is kept with the settings it ran with' 'loaded — other' "$(content_of x-speak.prev.settings)"
setup; build new; started; logs 'running on the built-in defaults — /c.json: not readable'; rollback
says 'settings only the new build could not read are the same' 'settings: the same'
setup; logs 'kept the last good one — /c.json: bad'; build new; started; echo 'running on the built-in defaults — /c.json: bad' >"$state/settings"; rollback
says 'a restored daemon on the built-in defaults is named' 'settings: running on the built-in defaults'

setup; echo /moved/config.json >"$state/argument"; build new; started; echo /new/config.json >"$state/argument"; touch "$state/dies"; rollback
is 'a rollback that fails keeps the argument of the binary it put aside' '/new/config.json' "$(content_of x-speak.prev.config)"
is 'a restored daemon that never answers is an error' '1' "$code"
says 'a restored daemon that never answers is named' 'does not answer'
says 'a restored daemon that never answers: the moved config argument is still named' 'config argument: /old/config.json, the kept binary ran with /moved/config.json'
setup; build new; started; stub nc 'cat >/dev/null; if [ -f "$state/relaunches" ]; then echo "{\"error\":\"main thread blocked\",\"main\":\"blocked for 9.0 s\"}"; else echo "{\"speaking\":false}"; fi'; rollback
is 'a restored daemon with a stuck main thread is an error' '1' "$code"

setup; build new; started; echo /new/config.json >"$state/argument"; logs 'loaded /c.json — other'; stub_file "$root/app/script/daemon-relaunch.sh" 'echo "relaunch: x-speak is reading aloud now" >&2; exit 3'; rollback
is 'a refused relaunch leaves no trace of a rollback' no "$([ -f "$libexec/x-speak.prev.rolled-back" ] && echo yes || echo no)"
is 'a refused relaunch keeps what the kept binary ran with' '/old/config.json loaded — same' "$(content_of x-speak.prev.config) $(content_of x-speak.prev.settings)"
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

# the settings move out of the file the launchd job names, once, and every byte is checked
move() { out=$("$root/app/script/settings-move.sh" "$@" 2>&1); code=$?; }
sha() { shasum -a 256 "$1" | cut -d' ' -f1; }
unmoved() { setup; rm "$place"; old="$state/old place.json"; echo tracked >"$old"; plist "$old"; echo "$old" >"$state/argument"; }
places() { printf '%s/%s' "$(cat "$old" 2>/dev/null || echo none)" "$(cat "$place" 2>/dev/null || echo none)"; }
unmoved; move "$(sha "$old")"
is 'the settings move, and the old file stays' '0 tracked/tracked' "$code $(places)"
says 'the settings moved: the line names the new place' "$place"
move "$(sha "$old")"
is 'a second move of the same file changes nothing' '0 tracked/tracked' "$code $(places)"
unmoved; hash=$(sha "$old"); echo edited >"$old"; move "$hash"
is 'a file that changed since its hash: refused' '1 edited/none' "$code $(places)"
unmoved; move
is 'no hash: refused' '1 tracked/none' "$code $(places)"
says 'no hash: says how' 'usage'
unmoved; hash=$(sha "$old"); rm "$old"; move "$hash"
is 'no file where the job points: refused' '1 none/none' "$code $(places)"
says 'no file where the job points: names the place' "no settings file to move: «${old}»"
unmoved; stub cp 'for last in "$@"; do :; done; echo torn >"$last"'; move "$(sha "$old")"; rm "$root/bin/cp"
is 'a torn copy: refused, no settings appear' '1 tracked/none' "$code $(places)"

unmoved; stub mv 'exit 1'; move "$(sha "$old")"; rm "$root/bin/mv"
is 'a first move killed before its last step leaves no word of one' '1 tracked/none no' "$code $(places) $([ -f "$place.moved-from" ] && echo yes || echo no)"
unmoved; move "$(sha "$old")"; was=$(sed -n 2p "$place.moved-from"); echo edited >"$old"; stub mv 'exit 1'; move "$(sha "$old")"; rm "$root/bin/mv"
is 'a second move killed before its last step: the change still counts as one nobody brought' "1 edited/tracked $was" "$code $(places) $(sed -n 2p "$place.moved-from")"
move "$was" seen
is 'seen with another hash: refused' "1 $was" "$code $(sed -n 2p "$place.moved-from")"
unmoved; move "$(sha "$old")" seen
is 'seen with no settings: refused' '1 tracked/none no' "$code $(places) $([ -f "$place.moved-from" ] && echo yes || echo no)"

unmoved; build new
is 'a build with no settings at their place: refused, nothing changes' '1 old/none' "$code $(pair)"
says 'a build with no settings at their place: names the move' 'settings-move.sh'

# the daemon from before the move is in no build's word
moved() { unmoved; rm "$libexec/x-speak.readers"; move "$(sha "$old")"; build new; started; echo today >"$place"; }
relaunch() { out=$("$root/app/script/daemon-relaunch.sh" 2>&1); code=$?; }
running() { [ -f "$state/inode" ] && echo running || echo stopped; }
moved; rollback
is 'back to a daemon from before the move: its file gets the settings of today' '0 old/new today/today' "$code $(pair) $(places)"
says 'back to a daemon from before the move: says where they went' "copied to $old"
echo saved by the old one >"$old"; rollback
is 'forward again, with a change in the old file alone: refused, the binaries stay' '1 old/new saved by the old one/today' "$code $(pair) $(places)"
says 'forward again, with a change in the old file alone: names the way' "settings-move.sh $(sha "$old") brings"
move "$(sha "$old")"
is 'a second move brings that change' '0 saved by the old one/saved by the old one' "$code $(places)"
is 'a second move keeps the settings it went over' today "$(cat "$place.before-move")"
rollback
is 'forward again, with the change moved' '0 new/old saved by the old one/saved by the old one' "$code $(pair) $(places)"
echo hand edit >"$old"; echo today >"$place"; rollback
is 'back once more, with a change in both: refused, the binaries stay' '1 new/old hand edit/today' "$code $(pair) $(places)"
says 'back once more, with a change in both: says so' 'changed since the settings moved'
is 'a refusal never relaunches' '2' "$(relaunches)"
move "$(sha "$old")"
is 'a move over settings with a change of their own: refused' '1 hand edit/today' "$code $(places)"
says 'a move over settings with a change of their own: names the way' "settings-move.sh $(sha "$old") seen"
moved; rollback; echo saved by the old one >"$old"; echo a heart >"$place"; rollback
is 'forward again, with a change in both: refused, the binaries stay' '1 old/new saved by the old one/a heart' "$code $(pair) $(places)"
says 'forward again, with a change in both: names the way' "settings-move.sh $(sha "$old") seen"
move "$(sha "$old")" seen
is 'a change brought by hand is marked seen, nothing is copied' '0 saved by the old one/a heart' "$code $(places)"
rollback
is 'forward again, with the change seen' '0 new/old saved by the old one/a heart' "$code $(pair) $(places)"
moved; rollback; echo saved by the old one >"$old"; plist "$place"; rollback
is 'the job moved on to the new place: a change in the old file still stops the way forward' '1 old/new saved by the old one/today' "$code $(pair) $(places)"
relaunch
is 'the job moved on: the old daemon started on the new place is stopped too' '3 running' "$code $(running)"
move "$(sha "$old")"
is 'the job moved on: the move still knows the old file' '0 saved by the old one/saved by the old one' "$code $(places)"
rollback
is 'the job moved on, the change brought: forward' '0 new/old' "$code $(pair)"
unmoved; rm "$libexec/x-speak.readers"; move "$(sha "$old")"; build new; echo saved meanwhile >"$old"; relaunch
is 'a save between the move and the relaunch: refused, nothing stopped' '3 running' "$code $(running)"
build two
is 'a save between the move and a build: refused, nothing installed' '1 new/old' "$code $(pair)"
says 'a save between the move and a build: says so' 'changed since the settings moved'
rm "$old"; relaunch
is 'an old file that is gone stops nothing' '0 1' "$code $(relaunches)"
unmoved; move "$(sha "$old")"; echo saved >"$old"; printf '%s' "$(cat "$old")" >"$place"; echo saved >"$place"; move "$(sha "$old")"
is 'a move killed before its last line is run again' "0 saved/saved $(sha "$old")" "$code $(places) $(sed -n 2p "$place.moved-from")"
moved; rollback; rollback; echo later >"$place"; rollback
is 'back once more, the old file as the rollback left it: the settings go along' '0 old/new later/later' "$code $(pair) $(places)"
moved; echo hand edit >"$old"; rollback
is 'the old file changed since the move: refused before anything moves' '1 new/old hand edit/today' "$code $(pair) $(places)"
moved; rm "$place.moved-from"; rollback
is 'no word of where the settings came from: refused' '1 new/old tracked/today' "$code $(pair) $(places)"
moved; plist /elsewhere.json; rollback
is 'the job names a third file: refused' '1 new/old tracked/today' "$code $(pair) $(places)"
moved; rm "$HOME/Library/LaunchAgents/com.dima.x-speak.plist" "$place.moved-from"; rollback
is 'a job that names no settings: refused, the binaries stay' '1 new/old' "$code $(pair)"
says 'a job that names no settings: says so' 'nothing says the settings moved'
moved; plist "$place"; rollback
is 'the job names the new place too: nothing to copy' '0 old/new tracked/today' "$code $(pair) $(places)"
moved; printf 'from before' >"$libexec/x-speak"; started; rollback; rollback
is 'a daemon another checkout built over the new one is known by its own bytes' '0 from before/old today/today' "$code $(pair) $(places)"
moved; stub_file "$root/app/script/daemon-relaunch.sh" 'echo reading aloud >&2; exit 3'; rollback
is 'a refused relaunch: the old file is back as it was' '1 new/old tracked/today' "$code $(pair) $(places)"
is 'a refused relaunch: the old file still counts as unchanged' "$(sha "$old")" "$(sed -n 2p "$place.moved-from")"
moved; cp "$root/app/script/daemon-relaunch.sh" "$root/app/script/real-relaunch.sh"; stub_file "$root/app/script/daemon-relaunch.sh" 'echo a heart >"$HOME/Library/Application Support/speak/config.json"; exec "$(dirname "$0")/real-relaunch.sh"'; rollback
says 'a heart while the daemons change places is named' "it is in $place alone"
moved; rollback; rm "$place"; rollback
is 'forward to a daemon that finds no settings: refused, the binaries back' '1 old/new' "$code $(pair)"
says 'forward to a daemon that finds no settings: says so' 'no settings at'
setup; build new; started; rollback
is 'two daemons that read the new place: nothing is copied' '0 today' "$code $(cat "$place")"
unmoved; rm "$libexec/x-speak.readers"; printf 'good' >"$libexec/x-speak.prev"; rollback
is 'a rollback before the settings ever moved: nothing to copy, nothing in the way' '0 good/old tracked/none' "$code $(pair) $(places)"
setup; build new; rm "$place"; relaunch
is 'a relaunch with no settings: refused, nothing stopped' '3 running' "$code $(running)"
setup; rm "$libexec/x-speak.readers" "$place"; relaunch
is 'a daemon from before the move relaunches with no settings there' 0 "$code"

# a build that never comes up goes back by itself
marked() { cut -d' ' -f1,2 "$HOME/.local/share/x-speak/start-mark" 2>/dev/null; }
setup; build new; relaunch
is 'a build that comes up stays' '0 new/old 1' "$code $(pair) $(relaunches)"
says 'a build that comes up is named' "$(printf new | shasum -a 256 | cut -c1-12) is up"
stub mark ':'; relaunch
is 'a build that came up once is not watched again' '0 new/old' "$code $(pair)"
printf mute >"$libexec/x-speak"; relaunch
is 'a relaunch of what no build put there is not watched' '0 mute/old' "$code $(pair)"
for bad in broken mute dying silent keyless other; do
    setup; build "$bad"; relaunch
    is "a $bad build goes back by itself" '1 old/'"$bad running" "$code $(pair) $(running)"
    is "a $bad build: launchd runs the one put back" "$(stat -f %i "$libexec/x-speak")" "$(cat "$state/inode" 2>/dev/null)"
    is "a $bad build: one start each" 2 "$(relaunches)"
    is "a $bad build: no ok line stands" '' "$(marked)"
    case "$bad" in broken | mute) why='did not come up in 45 s' ;; keyless) why='came up without F4' ;; *) why='came up and did not stay' ;; esac
    says "a $bad build is named, and why" "$(printf "$bad" | shasum -a 256 | cut -c1-12) $why"
    says "a $bad build: says what runs now" "rollback: running $(printf old | shasum -a 256 | cut -c1-12)"
done
relaunch
is 'a relaunch after it, onto a daemon that writes no mark, stays there' '0 old/other' "$code $(pair)"
setup; build mute; echo "ok $(sha "$libexec/x-speak") 2026-11-23T09:00:00Z" >"$HOME/.local/share/x-speak/start-mark"; relaunch
is 'a mark from an earlier start is none' '1 old/mute' "$code $(pair)"
setup; build mute; stub sleep 'echo "ok 0000 2026-11-23T10:00:00Z" >"$HOME/.local/share/x-speak/start-mark"'; relaunch
is 'the mark of another build is none' '1 old/mute' "$code $(pair)"
setup; build mute; stub sleep 'echo . >>"$state/slept"; [ "$(wc -l <"$state/slept")" -lt 44 ] || mark'; relaunch
is 'a start launchd tries again inside the window stays' '0 mute/old' "$code $(pair)"
setup; build mute; stub sleep 'echo . >>"$state/slept"; [ "$(wc -l <"$state/slept")" -lt 46 ] || mark'; relaunch
is 'a start past the window goes back' '1 old/mute' "$code $(pair)"
setup; build mute; stub sleep 'printf three >"$libexec/x-speak"'; relaunch
is 'a build installed inside the window is not taken back' '1 three/old' "$code $(pair)"
is 'a build installed inside the window leaves no lock' free "$([ -d "$libexec/x-speak.lock" ] && echo locked || echo free)"
for end in HUP INT TERM; do
    setup; build mute; echo "$end" >"$state/end"; stub sleep 'kill "-$(cat "$state/end")" "$PPID"'; relaunch
    is "a watch that $end would end goes back all the same" '1 old/mute' "$code $(pair)"
done
setup; build new; touch "$state/bootstrap-fails"; relaunch
is 'a build launchd would not start goes back' '1 old/new 2' "$code $(pair) $(relaunches)"
says 'a build launchd would not start: says so' 'was not started by launchd'
setup; build mute; "$root/app/script/daemon-relaunch.sh" 2>&1 | true; n=0; while [ "$(pair)" != old/mute ] && [ $n -lt 100 ]; do n=$((n + 1)); /bin/sleep 0.05; done
is 'a watch nobody reads goes back all the same' old/mute "$(pair)"
says_file() { grep -q "$2" "$libexec/x-speak.went-back" && got=yes || got=no; is "$1" yes "$got"; }
says_file 'a watch nobody reads leaves its words' 'rollback: running'
n=0; while locked_now=$([ -d "$libexec/x-speak.lock" ] && echo locked) && [ $n -lt 100 ]; do n=$((n + 1)); /bin/sleep 0.05; done
setup; build new; stub nc 'cat >/dev/null; if [ -f "$state/relaunches" ] && [ ! -f "$state/asked" ]; then touch "$state/asked"; echo "{\"error\":\"x\",\"main\":\"blocked for 0.1 s\"}"; else echo "{\"speaking\":false}"; fi'; relaunch
is 'a build busy for a moment stays' '0 new/old' "$code $(pair)"
setup; build new; mkdir -p "$HOME/.local/share/x-speak/start-mark/held"; relaunch
is 'a mark that cannot be taken away: refused, nothing stopped' '3 new/old running' "$code $(pair) $(running)"
setup; build new; cp "$root/bin/launchctl" "$state/launchctl"; stub launchctl 'case "$1" in print) if [ -f "$state/booted-out" ]; then n=$(cat "$state/left"); [ "$n" -gt 0 ] && echo $((n - 1)) >"$state/left" && exit 0; fi ;; bootout) touch "$state/booted-out" ;; esac; exec "$state/launchctl" "$@"'; echo 90 >"$state/left"; chmod +x "$state/launchctl"; relaunch
is 'a watched job that takes 18 s to stop is waited for' '0 new/old' "$code $(pair)"
setup; build mute; stub nc 'cat >/dev/null; if [ -f "$state/relaunches" ]; then echo "{\"speaking\":true}"; else echo "{\"speaking\":false}"; fi'; relaunch
is 'a build with no mark that reads aloud is left to read' '1 mute/old' "$code $(pair)"
says 'a build with no mark that reads aloud: says so' 'reading aloud now'
setup; rm "$libexec/x-speak" "$state/inode" "$state/status"; build mute; relaunch
is 'a first build that never comes up has nothing to go back to' '1 mute/none' "$code $(pair)"
says 'a first build that never comes up: says so' 'nothing to go back to'
setup; build broken; rollback; rollback
is 'forward by hand to a build that never came up is not taken back' '1 broken/old' "$code $(pair)"
is 'and its relaunch watched nothing' '' "$(printf '%s\n' "$out" | grep 'did not come up')"
relaunch
is 'but its relaunch is' '1 old/broken' "$code $(pair)"

# it answers a reload as it answers a status: yes to one, no to the other
reads_file() { stub nc 'case "$(cat)" in *reload*) echo "'"$1"'" ;; *) [ -f "$state/status" ] && cat "$state/status" ;; esac'; }
setup; build unread; reads_file '{\"ok\":true}'; relaunch
is 'a build that does not read the settings the one before it reads goes back' '1 old/unread' "$code $(pair)"
says 'a build that does not read them: says so' 'does not read the settings the one before it reads'
setup; build unread; reads_file '{\"error\":\"config.json: not readable\"}'; relaunch
is 'settings nobody can read take no build back' '0 unread/old' "$code $(pair)"
setup; build new; stub sleep '[ "$1" != 5 ] || rm -f "$state/inode" "$state/status"'; relaunch
is 'a build that dies in its first 5 s goes back' '1 old/new' "$code $(pair)"
setup; build mute; mkdir "$libexec/x-speak.lock"; stub sleep 'echo . >>"$state/slept"; [ "$(wc -l <"$state/slept")" -ne 60 ] || rmdir "$libexec/x-speak.lock"'; relaunch
is 'binaries another build holds for a moment are waited for' '1 old/mute' "$code $(pair)"
setup; build mute; mkdir -p "$libexec/x-speak.went-back"; relaunch
is 'words that cannot be written hold no rollback up' '1 old/mute' "$code $(pair)"
for stays in 18 90; do
    setup; build mute; cp "$root/bin/launchctl" "$state/launchctl"
    stub launchctl 'case "$1" in print) n=$(cat "$state/left" 2>/dev/null || echo 0); [ "$n" -gt 0 ] && echo $((n - 1)) >"$state/left" && exit 0 ;; bootout) cat "$state/stays" >"$state/left" ;; esac; exec "$state/launchctl" "$@"'
    echo $((stays * 5)) >"$state/stays"; relaunch
    is "a job that takes $stays s to stop, twice: the one before it runs" '1 old/mute running' "$code $(pair) $(running)"
done

# the first run stays inside its relaunch until `go` appears
held() {
    cp "$root/app/script/daemon-relaunch.sh" "$root/app/script/real-relaunch.sh"
    stub_file "$root/app/script/daemon-relaunch.sh" 'echo $$ >"$state/held"; touch "$state/inside"; n=0; until [ -f "$state/go" ] || [ $n -gt 200 ]; do n=$((n + 1)); /bin/sleep 0.02; done; exec "$(dirname "$0")/real-relaunch.sh" "$@"'
    "$root/app/script/daemon-rollback.sh" >"$state/first" 2>&1 &
    first=$!
    n=0; until [ -f "$state/inside" ] || [ $n -gt 200 ]; do n=$((n + 1)); /bin/sleep 0.02; done
}
# a rollback that is ended leaves its relaunch running, so that one is waited for too
release() {
    touch "$state/go"; first_code=0; wait "$first" 2>/dev/null || first_code=$?
    n=0; while kill -0 "$(cat "$state/held")" 2>/dev/null && [ $n -le 200 ]; do n=$((n + 1)); /bin/sleep 0.02; done
}
locked() { [ -d "$libexec/x-speak.lock" ] && echo locked || echo free; }

setup; build new; started; held
"$root/app/script/daemon-rollback.sh" >"$state/second" 2>&1 & second=$!
/bin/sleep 0.4; touch "$state/go"; second_code=0; wait "$second" || second_code=$?; out=$(cat "$state/second"); release
is 'two rollbacks at once: the second is refused, the first ends well' '1 0' "$second_code $first_code"
is 'two rollbacks at once: one swap, both binaries there' 'old/new' "$(pair)"
is 'two rollbacks at once: one line' '1' "$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
says 'two rollbacks at once: the line names the lock' "$libexec/x-speak.lock"
is 'a rollback leaves no lock' free "$(locked)"
setup; build new; started; held; build fix; build_code=$code; during=$(locked); release
is 'a build inside a rollback is refused and installs nothing' '1 old/new' "$build_code $(pair)"
is 'a build that is refused leaves the lock to its owner, who frees it' 'locked free' "$during $(locked)"
setup; build new
is 'a build leaves no lock' free "$(locked)"
started; printf '{"speaking":true}' >"$state/status"; rollback
is 'a refused rollback leaves no lock' free "$(locked)"
setup; build new; started; held; kill -TERM "$first"; release
is 'a rollback that is ended leaves no lock' free "$(locked)"
is 'the relaunch it left behind has ended, on the stubs' 1 "$(relaunches)"
setup; build new; started; mkdir "$libexec/x-speak.lock"; rollback
is 'a lock left behind: refused, nothing changes' '1 new/old' "$code $(pair)"
says 'a lock left behind: the line says how to clear it' 'rmdir'

setup; printf 'good' >"$libexec/x-speak.prev"; stub lsof 'printf "p1\nftxt\ni%s\nn/usr/lib/dyld\nftxt\nn%s\n" "$(cat "$state/inode")" "$libexec/x-speak"'; build new
is 'an installed path with no inode of its own never borrows the one before it' 'new/good' "$(pair)"

# a build that knows speechify, and settings that name it, over `old`, which does not
with_speechify() {
    mkdir -p "$root/app/daemon/core"
    printf 'enum Engine {\n    case elevenlabs, kokoro, system, fish, gemini, speechify\n' >"$root/app/daemon/core/engine.swift"
    printf '{"chain":{"en":["kokoro","speechify","system"]},"engines":{"kokoro":{},"speechify":{"gain":1}},"firstAudioMs":900}\n' >"$place"
    whole=$(cat "$place")
}
named() { jq -c '[.chain.en, (.engines | keys)]' "$place" 2>/dev/null; }
setup; with_speechify; build new; started; rollback
is 'a rollback onto a binary that lacks an engine takes its name out' '[["kokoro","system"],["kokoro"]]' "$(named)"
is 'and keeps the whole file beside' "$whole" "$(cat "$place.before-rollback")"
says 'and says so' 'settings: without speechify, which this daemon does not know'
rollback
is 'coming forward again puts the whole file back' "$whole" "$(cat "$place")"
is 'and keeps no copy' no "$([ -f "$place.before-rollback" ] && echo yes || echo no)"
says 'and says so' 'settings: put back whole'
setup; with_speechify; build new; started; rollback; build fix
says 'a build after a fitted rollback says where the whole file is' 'speak:rollback forward puts it back'
setup; with_speechify; build new; started; rollback; printf '{"chain":{"en":["kokoro"]},"engines":{},"firstAudioMs":700}\n' >"$place"; rollback
is 'a file changed since the rollback is not put back over' 700 "$(jq .firstAudioMs "$place")"
setup; with_speechify; build new; started; stub_file "$root/app/script/daemon-relaunch.sh" 'exit 3'; rollback
is 'a refused relaunch leaves the settings whole' "$whole" "$(cat "$place")"
is 'and no copy' no "$([ -f "$place.before-rollback" ] && echo yes || echo no)"
setup; with_speechify; printf '{"chain":{"en":["kokoro"]},"engines":{},"firstAudioMs":900}\n' >"$place"; build new; started; rollback
is 'a file every daemon knows is not touched' 'no {"chain":{"en":["kokoro"]},"engines":{},"firstAudioMs":900}' "$([ -f "$place.before-rollback" ] && echo yes || echo no) $(cat "$place")"

passed swap
