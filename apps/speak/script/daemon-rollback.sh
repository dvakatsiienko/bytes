#!/bin/sh
# puts back the daemon the last build replaced, and starts it: the kept binary and the installed one change places, so
# a second run comes forward again. the relaunch refuses while the daemon reads aloud, and nothing here writes the launchd plist.
# usage: script/daemon-rollback.sh
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-installed.sh"

hash_of() { sha_of "$1" | cut -c1-12; }
# a second link, then one rename over the target: the installed path is never missing, and each file keeps its inode,
# which is how the build knows the running binary. $1 and $2: what the binary now kept ran with (record_kept)
swap() {
    # half a swap would tell each binary the other's place
    trap '' HUP INT TERM
    rm -f "$install_dir/x-speak.swap.reads"
    ln -f "$installed" "$install_dir/x-speak.swap"
    mv -f "$kept" "$installed"
    mv -f "$install_dir/x-speak.swap" "$kept"
    if [ -f "$rolled_back" ]; then rm -f "$rolled_back"; else : >"$rolled_back"; fi
    if [ -f "$reads" ]; then mv -f "$reads" "$install_dir/x-speak.swap.reads"; fi
    if [ -f "$kept.reads" ]; then mv -f "$kept.reads" "$reads"; fi
    if [ -f "$install_dir/x-speak.swap.reads" ]; then mv -f "$install_dir/x-speak.swap.reads" "$kept.reads"; fi
    record_kept "$1" "$2"
    trap - HUP INT TERM
}
# a daemon from before the settings had a place of their own reads the file its argument names. that file gets the
# settings of today, but only while nobody changed it since they moved: two sets of changes have no right answer
old_place=
carry_settings() {
    target=$(config_argument)
    if [ ! -f "$settings" ] || [ "$(cat "$kept.reads" 2>/dev/null || true)" = "$settings" ] || [ "$target" = "$settings" ]; then return 0; fi
    { [ -n "$target" ] && [ "$(moved_line 1)" = "$target" ]; } \
        || refuse "the kept daemon reads $target, and nothing says the settings moved from there; compare it with $settings by hand"
    [ "$(sha_of "$target" 2>/dev/null)" = "$(moved_line 2)" ] \
        || refuse "the kept daemon reads $target, which changed since the settings moved; compare it with $settings by hand"
    old_place=$target
    cp "$target" "$settings.old-place"
    place "$settings"
}
# $1 over the old place, which then counts as unchanged
place() {
    cp "$1" "$old_place.new"
    mv -f "$old_place.new" "$old_place"
    printf '%s\n%s\n' "$old_place" "$(sha_of "$old_place")" >"$moved_from"
}
report_change() { # label, now, recorded at the build
    if [ -z "$3" ]; then echo "$1: $2, the build recorded none"
    elif [ "$2" = "$3" ]; then echo "$1: the same"
    else echo "$1: $2, the kept binary ran with $3"; fi
}

lock_binaries
[ -f "$kept" ] || refuse "nothing to go back to: no build has kept a binary at $kept"
[ -f "$installed" ] || refuse "no binary at $installed"
# the grant is pinned to what the installed binary is signed with, down to the certificate's hash
grant=$(codesign -d -r- "$installed" 2>/dev/null | sed -n 's/^designated => //p')
codesign --verify --strict -R="$grant" "$kept" 2>/dev/null \
    || refuse "the kept binary is not signed like the installed one, the Accessibility grant would not hold"
daemon_speaks && refuse 'x-speak is reading aloud now — wait for it to end'

ran_with=$(cat "$kept.config" 2>/dev/null || true)
ran_settings=$(cat "$kept.settings" 2>/dev/null || true)
carry_settings
swap "$(running_argument)" "$(settings_line)"
code=0
"$here/daemon-relaunch.sh" || code=$?
if [ "$code" -eq 3 ]; then
    swap "$ran_with" "$ran_settings"
    [ -z "$old_place" ] || place "$settings.old-place"
    refuse 'the relaunch was refused, the binaries are back as they were'
fi
# past a refusal the old process is stopped or stopping: the way back is the restored binary, not the bad one
[ "$code" -eq 0 ] || refuse 'x-speak was not started: the restored binary is installed, daemon-relaunch.sh starts it'
report_change 'config argument' "$(config_argument)" "$ran_with"
# longer than launchd's 30 s retry of a start that died
tries=0
until daemon_answers; do
    tries=$((tries + 1))
    [ "$tries" -le 40 ] || refuse "the restored daemon ($(hash_of "$installed")) does not answer; $kept holds the one before it"
    sleep 1
done
[ "$(running_inode)" = "$(stat -f %i "$installed")" ] || refuse 'launchd runs another binary than the installed one'

[ -z "$old_place" ] || echo "settings: copied to $old_place, which this daemon reads; a change it saves there stays there"
echo "rollback: running $(hash_of "$installed")"
report_change settings "$(settings_line)" "$ran_settings"
