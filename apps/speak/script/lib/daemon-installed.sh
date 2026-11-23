# sourced by the daemon scripts: what is installed, what is running, what it answers
install_dir="$HOME/.local/libexec/x-speak"
installed="$install_dir/x-speak"
kept="$install_dir/x-speak.prev"
rolled_back="$kept.rolled-back"
label=com.dima.x-speak

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
    grep -hE 'config: (loaded|kept|running)' "$HOME/.local/share/x-speak/daemon.err.log" 2>/dev/null | tail -1 \
        | sed -E 's/^.* config: //; s/^loaded .* — /loaded — /'
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

# what the kept binary ran with: its config argument, then its settings
record_kept() {
    printf '%s\n' "$1" >"$kept.config"
    printf '%s\n' "$2" >"$kept.settings"
}

refuse() {
    echo "$(basename "$0" .sh): $1" >&2
    exit 1
}
