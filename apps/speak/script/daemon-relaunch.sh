#!/bin/sh
# restarts the launchd job com.dima.x-speak onto the installed binary. bootout, wait, bootstrap: `kickstart -k`
# right after a swap died with OS_REASON_CODESIGNING and sat out the 30 s throttle (3 of 3, 2026-09-30).
# a relaunch cuts a read in progress, so it refuses while the daemon is speaking, and while the daemon it would start
# finds no settings, or older ones; one too stuck to answer in 2 s is relaunched. exit 3 is a refusal, with nothing stopped; any other failure comes after the bootout.
# usage: script/daemon-relaunch.sh — the plist is ~/Library/LaunchAgents/com.dima.x-speak.plist (frame's schedule/)
set -eu
. "$(dirname "$0")/lib/daemon-installed.sh"
domain="gui/$(id -u)"
if daemon_speaks; then
    echo 'relaunch: x-speak is reading aloud now — wait for it to end' >&2
    exit 3
fi
# by its build, or by its argument, the daemon this starts reads the settings at their place
if reads_settings "$installed" || [ "$(config_argument)" = "$settings" ]; then
    if [ ! -f "$settings" ]; then
        echo "relaunch: no settings at $settings, x-speak would run on its built-in defaults" >&2
        exit 3
    fi
    if old_file_changed; then
        echo "relaunch: $(old_file_line)" >&2
        exit 3
    fi
fi
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
launchctl bootstrap "$domain" "$HOME/Library/LaunchAgents/$label.plist" || exit 1
