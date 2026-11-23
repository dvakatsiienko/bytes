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
# a second link, then one rename over the target: the installed path is never missing, and each file keeps its inode,
# which is how the build knows the running binary. $1 and $2: what the binary now kept ran with, its argument and settings
swap() {
    ln -f "$installed" "$install_dir/x-speak.swap"
    mv -f "$kept" "$installed"
    mv -f "$install_dir/x-speak.swap" "$kept"
    if [ -f "$rolled_back" ]; then rm -f "$rolled_back"; else : >"$rolled_back"; fi
    printf '%s\n' "$1" >"$kept.config"
    printf '%s\n' "$2" >"$kept.settings"
}
told() { # label, now, recorded at the build
    if [ -z "$3" ]; then echo "$1: $2, the build recorded none"
    elif [ "$2" = "$3" ]; then echo "$1: the same"
    else echo "$1: $2, the kept binary ran with $3"; fi
}

[ -f "$kept" ] || refuse "nothing to go back to: no build has kept a binary at $kept"
[ -f "$installed" ] || refuse "no binary at $installed"
# the grant is pinned to what the installed binary is signed with, down to the certificate's hash
grant=$(codesign -d -r- "$installed" 2>/dev/null | sed -n 's/^designated => //p')
codesign --verify --strict -R="$grant" "$kept" 2>/dev/null \
    || refuse "the kept binary is not signed like the installed one, the Accessibility grant would not hold"
case "$(daemon_status)" in *'"speaking":true'*) refuse 'x-speak is reading aloud now — wait for it to end' ;; esac

ran_with=$(cat "$kept.config" 2>/dev/null || true)
ran_settings=$(cat "$kept.settings" 2>/dev/null || true)
swap "$(running_argument)" "$(settings_line)"
code=0
"$here/daemon-relaunch.sh" || code=$?
if [ "$code" -eq 3 ]; then
    swap "$ran_with" "$ran_settings"
    refuse 'the relaunch was refused, the binaries are back as they were'
fi
# past a refusal the old process is stopped or stopping: the way back is the restored binary, not the bad one
[ "$code" -eq 0 ] || refuse 'x-speak was not started: the restored binary is installed, daemon-relaunch.sh starts it'
# longer than launchd's 30 s retry of a start that died
tries=0
until daemon_answers; do
    tries=$((tries + 1))
    [ "$tries" -le 40 ] || refuse "the restored daemon ($(hash_of "$installed")) does not answer; $kept holds the one before it"
    sleep 1
done
[ "$(running_inode)" = "$(stat -f %i "$installed")" ] || refuse 'launchd runs another binary than the installed one'

echo "rollback: running $(hash_of "$installed")"
told settings "$(settings_line)" "$ran_settings"
told 'config argument' "$(config_argument)" "$ran_with"
