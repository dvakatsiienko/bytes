# sourced by the script tests, with `here` set: a scratch home with a stub of every tool that would reach the mac
# (launchctl, lsof, nc, codesign, swiftc) on PATH, so the installed daemon is never touched
set -u
root=$(mktemp -d "${TMPDIR:-/tmp}/x-speak-test.XXXXXX")
trap 'rm -rf "$root"' EXIT
fails=0
count=0

# a fresh home with `old` installed and running, and the scripts beside a stub test run
setup() {
    rm -rf "$root/home" "$root/app" "$root/state" "$root/bin"
    mkdir -p "$root/home/.local/libexec/x-speak" "$root/home/.local/share/x-speak" "$root/home/Library/LaunchAgents" \
        "$root/app/daemon" "$root/app/script" "$root/state" "$root/bin"
    HOME="$root/home"
    export HOME
    libexec="$HOME/.local/libexec/x-speak"
    state="$root/state"
    export state libexec
    cp "$here"/*.sh "$root/app/script/"
    stub_file "$root/app/script/daemon-test.sh" 'exit "$(cat "$state/test-exit" 2>/dev/null || echo 0)"'
    printf 'old' >"$libexec/x-speak"
    plist '/old/config.json'
    printf '{"speaking":false,"paused":false}' >"$state/status"
    started
    echo 'loaded /c.json — same' >"$state/settings"
    stub swiftc 'for last in "$@"; do :; done; [ -f "$state/compile-fails" ] && exit 1; cp "$state/next" "$last"'
    stub codesign 'case "$*" in *--verify*) for last in "$@"; do :; done; [ "$(cat "$last")" != unsigned ] ;; *) [ ! -f "$state/sign-fails" ] ;; esac'
    stub nc 'cat >/dev/null; [ -f "$state/status" ] && cat "$state/status"'
    stub sleep ':'
    stub lsof '[ -f "$state/inode" ] && printf "x-speak 1 me txt REG 1,15 5 %s %s\n" "$(cat "$state/inode")" "$libexec/x-speak"'
    stub launchctl 'case "$1" in
        bootout) rm -f "$state/inode" ;;
        print) [ -f "$state/inode" ] && printf "\tstate = running\n\tpid = 1\n" ;;
        bootstrap) echo relaunch >>"$state/relaunches"; [ -f "$state/bootstrap-fails" ] && exit 5; stat -f %i "$libexec/x-speak" >"$state/inode"; [ -f "$state/other" ] && echo 7 >"$state/inode"
            [ -f "$state/dies" ] && rm -f "$state/status"
            echo "2026-11-23 10:00:01.000 config: $(cat "$state/settings")" >>"$HOME/.local/share/x-speak/daemon.err.log" ;;
    esac'
    echo '2026-11-23 10:00:00.000 config: loaded /c.json — same' >"$HOME/.local/share/x-speak/daemon.err.log"
    PATH="$root/bin:$real_path"
    export PATH
}
real_path=$PATH
stub() { stub_file "$root/bin/$1" "$2"; }
stub_file() { printf '#!/bin/sh\n%s\n' "$2" >"$1" && chmod +x "$1"; }
started() { stat -f %i "$libexec/x-speak" >"$state/inode"; }
plist() {
    printf '<?xml version="1.0"?><plist version="1.0"><dict><key>ProgramArguments</key><array><string>x</string><string>--config</string><string>%s</string></array></dict></plist>' "$1" \
        >"$HOME/Library/LaunchAgents/com.dima.x-speak.plist"
}
bytes() { cat "$libexec/$1" 2>/dev/null || printf none; }
relaunches() { [ ! -f "$state/relaunches" ] || wc -l <"$state/relaunches" | tr -d ' '; }
is() { # name, want, got
    count=$((count + 1))
    [ "$2" = "$3" ] && return
    fails=$((fails + 1))
    printf '✗ %s\n  want %s\n  got  %s\n' "$1" "$2" "$3"
}
says() { # name, part of the last output
    count=$((count + 1))
    case "$out" in *"$2"*) return ;; esac
    fails=$((fails + 1))
    printf '✗ %s\n  want a line with %s\n  got  %s\n' "$1" "$2" "$out"
}
passed() { echo "$((count - fails))/$count $1 cases pass"; [ "$fails" -eq 0 ]; }
