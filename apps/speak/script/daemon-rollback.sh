#!/bin/sh
# puts back the daemon the last build replaced, and starts it: the kept binary and the installed one change places, so
# a second run comes forward again. the relaunch refuses while the daemon reads aloud, and nothing here writes the launchd plist.
# usage: script/daemon-rollback.sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/daemon-installed.sh"

refuse() {
    echo "rollback: $1" >&2
    exit 1
}
hash_of() { shasum -a 256 "$1" | cut -c1-12; }
# the last word on the settings, also a daemon that could not read them: the reason after the dash
settings_line() { grep -hE 'config: (loaded|kept|running)' "$HOME/.local/share/x-speak/daemon.err.log" 2>/dev/null | tail -1 | sed 's/^.* — //'; }
# a second link, then one rename over the target: the installed path is never missing, and each file keeps its inode,
# which is how the build knows the running binary
swap() {
    ln -f "$installed" "$install_dir/x-speak.swap"
    mv -f "$kept" "$installed"
    mv -f "$install_dir/x-speak.swap" "$kept"
}

[ -f "$kept" ] || refuse "nothing to go back to: no build has kept a binary at $kept"
[ -f "$installed" ] || refuse "no binary at $installed"
codesign --verify --strict -R='identifier "com.dima.x-speak" and certificate leaf[subject.CN] = "x-speak local signing"' "$kept" 2>/dev/null \
    || refuse "the kept binary's signature is not x-speak's, its Accessibility grant would not hold"

before=$(settings_line)
ran_with=$(cat "$kept.config" 2>/dev/null || true)
argument=$(config_argument)
swap
if ! "$here/daemon-relaunch.sh"; then
    # a relaunch refuses before it stops anything; past that point the way back is the restored binary, not the bad one
    launchctl print "gui/$(id -u)/$label" >/dev/null 2>&1 || refuse "x-speak is not running: the restored binary is installed, daemon-relaunch.sh starts it"
    swap
    refuse 'the relaunch was refused, the binaries are back as they were'
fi
tries=0
until [ -n "$(daemon_status)" ]; do
    tries=$((tries + 1))
    [ "$tries" -le 40 ] || refuse "the restored daemon ($(hash_of "$installed")) does not answer; $kept holds the one before it"
    sleep 0.5
done
[ "$(running_inode)" = "$(stat -f %i "$installed")" ] || refuse 'launchd runs another binary than the installed one'
printf '%s\n' "$argument" >"$kept.config"

echo "rollback: running $(hash_of "$installed")"
if [ "$(settings_line)" = "$before" ]; then echo 'settings: the same'; else echo "settings: not the same — $(settings_line)"; fi
if [ -z "$ran_with" ] || [ "$ran_with" = "$argument" ]; then
    echo 'config argument: the same'
else
    echo "config argument: $argument, the kept binary ran with $ran_with"
fi
