# sourced by the build and the rollback: what is installed, what is running, what it answers
install_dir="$HOME/.local/libexec/x-speak"
installed="$install_dir/x-speak"
kept="$install_dir/x-speak.prev"
label=com.dima.x-speak

daemon_status() {
    printf '%s\n' '{"op":"status"}' | nc -U -w 2 "$HOME/.local/share/x-speak/control.sock" 2>/dev/null || true
}

# the inode of the binary launchd's process runs: a build replaces the file, and the process keeps the old one open
running_inode() {
    pid=$(launchctl print "gui/$(id -u)/$label" 2>/dev/null | awk '/^\tpid = /{print $3}')
    [ -n "$pid" ] || return 0
    lsof -a -p "$pid" -d txt 2>/dev/null | awk -v path="$installed" '$NF == path {print $(NF - 1); exit}'
}

config_argument() {
    args="$HOME/Library/LaunchAgents/$label.plist"
    i=0
    while word=$(plutil -extract "ProgramArguments.$i" raw "$args" 2>/dev/null); do
        i=$((i + 1))
        [ "$word" = --config ] && plutil -extract "ProgramArguments.$i" raw "$args" && return 0
    done
    return 0
}
