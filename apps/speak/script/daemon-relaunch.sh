#!/bin/sh
# restarts the launchd job com.dima.x-speak onto the installed binary. bootout, wait, bootstrap: `kickstart -k`
# right after a swap died with OS_REASON_CODESIGNING and sat out the 30 s throttle (3 of 3, 2026-09-30).
# a relaunch cuts a read in progress, so it refuses while the daemon is speaking, and while the daemon it would start
# finds no settings, or older ones; one too stuck to answer in 2 s is relaunched. exit 3 is a refusal, with nothing stopped; any other failure comes after the bootout.
# the first relaunch onto a build waits until it is up, and one that does not come up in 45 s goes back by itself
# (daemon-rollback.sh): launchd alone would start it again each 30 s, with no F4 in between. what no build left here, or
# what came up before, is not watched, and neither is a start of the rollback's own (--unwatched).
# usage: script/daemon-relaunch.sh — the plist is ~/Library/LaunchAgents/com.dima.x-speak.plist (frame's schedule/)
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-installed.sh"
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
# a file nobody can read takes no build back: the one that runs is asked while it can be
was_read=no
case "$(printf '%s\n' '{"op":"reload"}' | nc -U -w 2 "$HOME/.local/share/x-speak/control.sock" 2>/dev/null || true)" in *'"ok":true'*) was_read=yes ;; esac
build=$(sha_of "$installed")
name=$(printf %s "$build" | cut -c1-12)
watched=no
if [ "${1:-}" != --unwatched ] && [ "$(cat "$unstarted" 2>/dev/null)" = "$build" ]; then
    watched=yes
    # an ended watch would leave a build that never comes up where it is, and so would a word nobody is there to read
    trap '' HUP INT TERM PIPE
fi
# what an earlier start wrote; nothing is stopped yet
if ! rm -f "$start_mark"; then
    echo "relaunch: $start_mark cannot be taken away, so no start can be told from it" >&2
    exit 3
fi
launchctl bootout "$domain/$label" 2>/dev/null || true
# bootout returns before the teardown ends, and a bootstrap inside that window fails with «5: Input/output error»
tries=0
while launchctl print "$domain/$label" >/dev/null 2>&1; do
    tries=$((tries + 1))
    # launchd ends what does not stop by itself in 20 s
    if [ "$tries" -gt 300 ]; then
        echo "relaunch: $label still loaded after 60 s" >&2 || true
        break
    fi
    sleep 0.2
done
# the build that stopped may have come up once more on its way out
rm -f "$start_mark" || true
code=0
launchctl bootstrap "$domain" "$HOME/Library/LaunchAgents/$label.plist" || code=1
[ "$watched" = yes ] || exit "$code"
[ "$code" -eq 0 ] || why='was not started by launchd'
# longer than launchd's 30 s retry of a start that died
tries=0
while [ "$code" -eq 0 ]; do
    case "$(cut -d' ' -f1,2 "$start_mark" 2>/dev/null)" in
    "ok $build") break ;;
    "no-settings $build")
        [ "$was_read" = yes ] || break
        code=1
        why='does not read the settings the one before it reads'
        break
        ;;
    esac
    tries=$((tries + 1))
    if [ "$tries" -gt 45 ]; then
        code=1
        why='did not come up in 45 s'
    fi
    sleep 1
done
if [ "$code" -eq 0 ]; then
    # up, and still there
    sleep 5
    # a main thread busy for a moment is asked again
    for _ in 1 2 3; do
        if [ "$(running_inode)" = "$(stat -f %i "$installed")" ] && daemon_answers; then
            rm -f "$unstarted"
            echo "relaunch: $name is up" || true
            exit 0
        fi
        sleep 1
    done
    why='came up and did not stay'
fi
echo "relaunch: $name $why, the daemon before it goes back" >&2 || true
# its words are in a file too: the rollback goes on when nobody is there to read them
# a build that installs now holds the binaries for a moment; what it installs is not taken back
tries=0
while [ -d "$install_dir/x-speak.lock" ] && [ "$tries" -lt 30 ]; do
    tries=$((tries + 1))
    sleep 1
done
words="$install_dir/x-speak.went-back"
(: >"$words") 2>/dev/null || words=/dev/null
"$here/daemon-rollback.sh" --from "$build" >"$words" 2>&1 || true
cat "$words" >&2 || true
exit 1
