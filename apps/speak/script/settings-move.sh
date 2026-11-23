#!/bin/sh
# copies the settings the launchd job names to this mac's own place. the copy is checked against a hash taken
# before the new daemon was pulled, and the old file stays as it is: a rollback to the daemon that reads it needs it.
# a later run brings a change the old file got since; with `seen` nothing is copied: the settings have that change already.
# usage: script/settings-move.sh <sha256 of the old file> [seen]
set -eu
. "$(dirname "$0")/lib/daemon-installed.sh"
want=${1:-}
from=$(moved_line 1)
[ -n "$from" ] || from=$(config_argument)
[ -n "$want" ] || refuse 'usage: script/settings-move.sh <sha256 of the old file> [seen]'
[ -f "$from" ] || refuse "no settings file to move: «$from»"
[ "$(sha_of "$from")" = "$want" ] || refuse "$from is not the file that was hashed: $(sha_of "$from")"
# last: until it is written, a relaunch still sees the change as one nobody brought
record() { printf '%s\n%s\n' "$from" "$want" >"$moved_from"; }
if [ "${2:-}" = seen ]; then
    [ -f "$settings" ] || refuse "no settings at $settings"
    record
    echo "settings: $from is seen at $want"
    exit
fi
if [ -e "$settings" ] && [ "$(sha_of "$settings")" != "$want" ]; then
    [ "$(sha_of "$settings")" = "$(moved_line 2)" ] \
        || refuse "$settings has changes of its own: bring the ones of $from there by hand, then script/settings-move.sh $want seen"
    cp "$settings" "$settings.before-move"
fi
mkdir -p "$(dirname "$settings")"
cp "$from" "$settings.new"
[ "$(sha_of "$settings.new")" = "$want" ] || refuse "the copy differs, nothing moved: $settings.new"
mv "$settings.new" "$settings"
record
echo "settings: at $settings, $want"
