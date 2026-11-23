#!/bin/sh
# speaks one text with this tree's daemon, built beside the installed one: it takes neither the hotkeys nor the control
# socket, has no cloud keys, never starts the kokoro server, and goes quiet when the live daemon starts a read.
# usage: script/daemon-try.sh <text …>
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-installed.sh"


# with no text the binary is a daemon: a second one, which takes the live one's socket and hotkeys
text=$*
case "$text" in
-*) refuse 'a text never starts with a dash — usage: script/daemon-try.sh <text …>' ;;
*[![:space:]]*) ;;
*) refuse 'nothing to speak — usage: script/daemon-try.sh <text …>' ;;
esac
daemon_speaks && refuse 'x-speak is reading aloud now — wait for it to end'
cd "$here/../daemon"
mkdir -p build
"$here/daemon-compile.sh" -O -o build/x-speak-try
daemon_speaks && refuse 'x-speak is reading aloud now — wait for it to end'

trap 'kill $(jobs -p) 2>/dev/null || true' EXIT
build/x-speak-try --config "$PWD/config.json" "$text" &
child=$!
while kill -0 "$child" 2>/dev/null; do
    daemon_speaks && refuse 'the live daemon started a read, this one stopped'
    sleep 1
done
code=0
wait "$child" || code=$?
exit "$code"
