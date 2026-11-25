# sourced by the daemon scripts: what is installed, what is running, what it answers
install_dir="$HOME/.local/libexec/x-speak"
installed="$install_dir/x-speak"
kept="$install_dir/x-speak.prev"
rolled_back="$kept.rolled-back"
label=com.dima.x-speak
# the hash of the build that has not come up yet, and the line a daemon writes when it has: `ok <hash> <time>`
unstarted="$install_dir/x-speak.unstarted"
start_mark="$HOME/.local/share/x-speak/start-mark"
# the daemon's own place for its settings (daemon/core/paths.swift), and the file they were moved from with its hash
settings="$HOME/Library/Application Support/speak/config.json"
moved_from="$settings.moved-from"
# the binaries that read the settings at their place, by hash, each written down as a build installs it; a binary from
# before the settings had a place of their own reads what its launchd argument names
readers="$install_dir/x-speak.readers"

# 1 the file the settings moved from, 2 its hash then
moved_line() { sed -n "$1p" "$moved_from" 2>/dev/null || true; }
# the file the settings moved from changed since: a daemon that reads the moved ones would drop that change
old_file_changed() { [ -f "$(moved_line 1)" ] && [ "$(sha_of "$(moved_line 1)")" != "$(moved_line 2)" ]; }
old_file_line() {
    if [ "$(sha_of "$settings")" = "$(moved_line 2)" ]; then way='brings that change'; else way="seen, once $settings has that change too"; fi
    echo "$(moved_line 1) changed since the settings moved — script/settings-move.sh $(sha_of "$(moved_line 1)") $way"
}

sha_of() { shasum -a 256 "$1" | cut -d' ' -f1; }
reads_settings() { grep -qx "$(sha_of "$1")" "$readers" 2>/dev/null; }

daemon_status() {
    printf '%s\n' '{"op":"status"}' | nc -U -w 2 "$HOME/.local/share/x-speak/control.sock" 2>/dev/null || true
}

daemon_speaks() { case "$(daemon_status)" in *'"speaking":true'*) ;; *) return 1 ;; esac }

# a reply is not an answer: a daemon whose main thread is stuck still sends its last status, or an error, with the stall named
daemon_answers() {
    case "$(daemon_status)" in *'"main":'*) return 1 ;; *'"speaking":'*) ;; *) return 1 ;; esac
}

# the inode of the binary launchd's process runs: a build replaces the file, and the process keeps the old one open
running_inode() {
    pid=$(launchctl print "gui/$(id -u)/$label" 2>/dev/null | awk '/^\tpid = /{print $3}')
    [ -n "$pid" ] || return 0
    lsof -a -p "$pid" -d txt -F in 2>/dev/null | awk -v path="$installed" '/^f/ {inode = ""} /^i/ {inode = substr($0, 2)} $0 == "n" path {print inode; exit}'
}

# what the daemon last said of its settings: the values of a load, or why it kept or fell back. a load's path is
# dropped, so the same values from another place read the same
settings_line() {
    grep -hE '^[0-9-]+ [0-9:.]+ config: (loaded|kept|running)' "$HOME/.local/share/x-speak/daemon.err.log" 2>/dev/null | tail -1 \
        | sed -E 's/^[0-9-]+ [0-9:.]+ config: //; s/^loaded .* — /loaded — /'
}

# what the running process was started with: the plist may have moved on since
running_argument() {
    argument=$(launchctl print "gui/$(id -u)/$label" 2>/dev/null | awk 'found {sub(/^[ \t]+/, ""); print; exit} $1 == "--config" {found = 1}')
    if [ -n "$argument" ]; then printf '%s\n' "$argument"; else config_argument; fi
}

# what the next start gets
config_argument() {
    args="$HOME/Library/LaunchAgents/$label.plist"
    i=0
    while word=$(plutil -extract "ProgramArguments.$i" raw "$args" 2>/dev/null); do
        i=$((i + 1))
        [ "$word" = --config ] && plutil -extract "ProgramArguments.$i" raw "$args" && return 0
    done
    return 0
}

# one build or rollback at a time moves the binaries: two swaps at once can lose one
lock_binaries() {
    mkdir -p "$install_dir"
    mkdir "$install_dir/x-speak.lock" 2>/dev/null \
        || refuse "another build or rollback moves the binaries; none running: rmdir $install_dir/x-speak.lock"
    trap 'rmdir "$install_dir/x-speak.lock"' EXIT
}

# what the kept binary ran with: its config argument, its settings' values
record_kept() {
    printf '%s\n' "$1" >"$kept.config"
    printf '%s\n' "$2" >"$kept.settings"
}

refuse() {
    echo "$(basename "$0" .sh): $1" >&2
    exit 1
}
