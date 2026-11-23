#!/bin/sh
# copies the settings the launchd job names to this mac's own place. the copy is checked against a hash taken
# before the new daemon was pulled, and the old file stays as it is: a rollback to the daemon that reads it needs it.
# usage: script/settings-move.sh <sha256 of the settings file>
set -eu
. "$(dirname "$0")/lib/daemon-installed.sh"
want=${1:-}
from=$(config_argument)
[ -n "$want" ] || refuse 'usage: script/settings-move.sh <sha256 of the settings file>'
# a second move is for a change the old file got since, and only while the moved settings have none of their own
if [ -e "$settings" ]; then
    { [ "$(moved_line 1)" = "$from" ] && [ "$(sha_of "$settings")" = "$(moved_line 2)" ]; } \
        || refuse "the settings are already at $settings, and changed there"
fi
[ -f "$from" ] || refuse "the launchd job names no settings file: «$from»"
[ "$(sha_of "$from")" = "$want" ] || refuse "$from is not the file that was hashed: $(sha_of "$from")"
mkdir -p "$(dirname "$settings")"
cp "$from" "$settings.new"
[ "$(sha_of "$settings.new")" = "$want" ] || refuse "the copy differs, nothing moved: $settings.new"
printf '%s\n%s\n' "$from" "$want" >"$moved_from"
mv "$settings.new" "$settings"
echo "settings: at $settings, $want"
