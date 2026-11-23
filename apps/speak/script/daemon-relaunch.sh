#!/bin/sh
# restarts the launchd job com.dima.x-speak onto the installed binary. bootout, wait, bootstrap: `kickstart -k`
# right after a swap died with OS_REASON_CODESIGNING and sat out the 30 s throttle (3 of 3, 2026-09-30).
# a relaunch cuts a read in progress, so it refuses while the daemon is speaking; a daemon too stuck to
# answer in 2 s is relaunched.
# usage: script/daemon-relaunch.sh — the plist is ~/Library/LaunchAgents/com.dima.x-speak.plist (frame's schedule/)
set -eu
label=com.dima.x-speak
domain="gui/$(id -u)"
status=$(printf '%s\n' '{"op":"status"}' | nc -U -w 2 "$HOME/.local/share/x-speak/control.sock" 2>/dev/null || true)
case "$status" in
*'"speaking":true'*)
    echo "relaunch: x-speak is reading aloud now — wait for it to end" >&2
    exit 1
    ;;
esac
launchctl bootout "$domain/$label" 2>/dev/null || true
# bootout returns before the teardown ends, and a bootstrap inside that window fails with «5: Input/output error»
tries=0
while launchctl print "$domain/$label" >/dev/null 2>&1; do
    tries=$((tries + 1))
    if [ "$tries" -gt 50 ]; then
        echo "relaunch: $label still loaded after 10 s" >&2
        exit 1
    fi
    sleep 0.2
done
launchctl bootstrap "$domain" "$HOME/Library/LaunchAgents/$label.plist"
