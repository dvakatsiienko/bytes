#!/bin/sh
# a build tried beside the live daemon, in a scratch home: the built binary is a stub that writes down its argv.
# usage: script/daemon-try.test.sh
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-scratch.sh"
app() {
    setup
    stub_file "$state/next" 'for word in "$@"; do printf "[%s]" "$word"; done >>"$state/argv"
trap "echo stopped >\"$state/ended\"; exit 143" TERM
echo $$ >"$state/child"
left=150; [ -f "$state/reads-on" ] || left=0
while [ "$left" -gt 0 ]; do left=$((left - 1)); /bin/sleep 0.02; done
exit "$(cat "$state/child-exit" 2>/dev/null || echo 0)"'
}
try() { out=$("$root/app/script/daemon-try.sh" "$@" 2>&1); code=$?; }
child_state() { # the stub's process, given a moment to end
    for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 "$(cat "$state/child")" 2>/dev/null || { echo gone; return; }; /bin/sleep 0.05; done
    echo left
}
argv() { cat "$state/argv" 2>/dev/null || printf none; }
built() { [ -f "$root/app/daemon/build/x-speak-try" ] && echo yes || echo no; }
argv_config() { argv | sed "s|\[$place\]|[CONFIG]|"; }

app; try 'a first line'
is 'a text is spoken by the built binary, with the config and no keys runner' '[--config][CONFIG][a first line]' "$(argv_config)"
is 'a spoken text ends well' 0 "$code"
is 'the built binary stays out of the install folder' old "$(ls "$libexec" | grep -vxE 'x-speak(\.readers)?')$(content_of x-speak)"
is 'the built binary is in the tree' yes "$(built)"
is 'the live daemon is not relaunched' '' "$(relaunches)"
is 'the launchd job is not touched' "$(stat -f %i "$libexec/x-speak")" "$(cat "$state/inode")"

app; rm "$place"; try 'a first line'
is 'a mac with no settings of its own: the tree'"'"'s seed' '[--config][SEED][a first line]' "$(argv | sed "s|\[[^]]*/app/daemon/config.json\]|[SEED]|")"
app; try two words
is 'words join into one text' '[--config][CONFIG][two words]' "$(argv_config)"
app; try 'it - is'
is 'a dash inside a text is text' '[--config][CONFIG][it - is]' "$(argv_config)"

for text in '' '   ' '
' --config -x --; do
    app; try "$text"
    is "«${text}» is refused" '1 none' "$code $(argv)"
    says "«${text}»: one line says how" 'usage'
done
app; out=$("$root/app/script/daemon-try.sh" 2>&1); code=$?
is 'no text is refused' '1 none' "$code $(argv)"

app; printf '{"paused":false,"speaking":true}' >"$state/status"; try hello
is 'reading aloud: refused' '1 none' "$code $(argv)"
is 'reading aloud: refused before a build' no "$(built)"
says 'reading aloud: says so' 'reading aloud'
app; stub swiftc 'for last in "$@"; do :; done; cp "$state/next" "$last"; printf "{\"speaking\":true}" >"$state/status"'; try hello
is 'a read that starts while it builds: refused' '1 none' "$code $(argv)"
says 'a read that starts while it builds: never starts one' 'reading aloud now'

app; touch "$state/reads-on"
stub sleep '[ -f "$state/child" ] && printf "{\"speaking\":true}" >"$state/status"; /bin/sleep 0.05'
try hello
is 'a live read stops it' '1 stopped' "$code $(cat "$state/ended" 2>/dev/null)"
says 'a live read: says so' 'the live daemon started a read'
is 'a stopped try leaves no process' gone "$(child_state)"

app; touch "$state/reads-on"
stub sleep '[ -f "$state/child" ] && kill -TERM "$PPID"; /bin/sleep 0.05'
try hello
is 'a try that is ended takes its process along' 'stopped gone' "$(cat "$state/ended" 2>/dev/null) $(child_state)"

app; echo 3 >"$state/child-exit"; try hello
is 'a binary that fails is an error' 3 "$code"
app; rm "$state/status"; try hello
is 'no live daemon: it speaks' '0 [--config][CONFIG][hello]' "$code $(argv_config)"
app; touch "$state/compile-fails"; try hello
is 'a build that fails starts nothing' '1 none' "$code $(argv)"

passed try
