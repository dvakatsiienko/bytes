# sourced by the script tests, with `here` set: a scratch home with a stub of every tool that would reach the mac
# (launchctl, lsof, nc, codesign, swiftc) on PATH, so the installed daemon is never touched
set -u
root=$(mktemp -d "${TMPDIR:-/tmp}/x-speak-test.XXXXXX") || exit 1
# a run that is ended early leaves its stubs: a script it left behind would find the mac's own launchctl without them
trap 'rm -rf "$root/a home" "$root/app" "$root/state"' EXIT
fails=0
count=0

# a fresh home with `old` installed and running, and the scripts beside a stub test run. the stubs are written over
setup() {
    rm -rf "$root/a home" "$root/app" "$root/state"
    mkdir -p "$root/a home/.local/libexec/x-speak" "$root/a home/.local/share/x-speak" "$root/a home/Library/LaunchAgents" \
        "$root/app/daemon" "$root/app/script" "$root/state" "$root/bin"
    HOME="$root/a home"
    export HOME
    libexec="$HOME/.local/libexec/x-speak"
    state="$root/state"
    export state libexec
    cp -R "$here"/. "$root/app/script/"
    stub_file "$root/app/script/daemon-test.sh" 'exit "$(cat "$state/test-exit" 2>/dev/null || echo 0)"'
    printf 'old' >"$libexec/x-speak"
    plist '/old/config.json'
    echo /old/config.json >"$state/argument"
    # both daemons read the settings at their own place, as after the move; `old` was installed knowing it
    place="$HOME/Library/Application Support/speak/config.json"
    mkdir -p "$(dirname "$place")"
    echo today >"$place"
    shasum -a 256 "$libexec/x-speak" | cut -d' ' -f1 >"$libexec/x-speak.readers"
    printf '{"speaking":false,"paused":false}' >"$state/status"
    started
    echo 'loaded /c.json — same' >"$state/settings"
    stub swiftc 'for last in "$@"; do :; done; [ -f "$state/compile-fails" ] && exit 1; cp "$state/next" "$last"'
    stub codesign 'case "$*" in *-r-*) [ -f "$state/no-grant" ] || echo "designated => the grant" ;; *--verify*) case "$*" in *"-R=the grant"*) ;; *) exit 1 ;; esac; for last in "$@"; do :; done; [ "$(cat "$last")" != unsigned ] ;; *) [ ! -f "$state/sign-fails" ] ;; esac'
    stub nc 'cat >/dev/null; [ -f "$state/status" ] && cat "$state/status"'
    stub sleep ':'
    stub mark 'echo "${1:-ok} $(shasum -a 256 "$libexec/x-speak" | cut -d" " -f1) 2026-11-23T10:00:01Z" >"$HOME/.local/share/x-speak/start-mark"'
    stub lsof '[ -f "$state/inode" ] && printf "p1\nftxt\ni9\nn/usr/lib/dyld\nftxt\ni%s\nn%s\n" "$(cat "$state/inode")" "$libexec/x-speak"'
    stub launchctl 'case "$1" in
        bootout) rm -f "$state/inode" ;;
        print) [ -f "$state/inode" ] && printf "\tstate = running\n\targuments = {\n\t\tx\n\t\t--config\n\t\t%s\n\t}\n\tpid = 1\n" "$(cat "$state/argument")" ;;
        bootstrap) plutil -extract ProgramArguments.2 raw "$HOME/Library/LaunchAgents/com.dima.x-speak.plist" >"$state/argument"; echo relaunch >>"$state/relaunches"; [ -f "$state/bootstrap-fails" ] && exit 5; [ -f "$state/bootstrap-refuses" ] && exit 3; stat -f %i "$libexec/x-speak" >"$state/inode"; [ -f "$state/other" ] && echo 7 >"$state/inode"
            # `old` is from before the start mark, `mute` hangs on its way up, `broken` never runs, `dying` dies once it is up
            case "$(cat "$libexec/x-speak")" in
                broken) rm -f "$state/inode" "$state/status" ;;
                dying) mark; rm -f "$state/inode" "$state/status" ;;
                old) [ -f "$state/dies" ] || printf "{\"speaking\":false}" >"$state/status" ;;
                mute) ;;
                # up, and then silent, or another binary
                unread) mark no-settings ;;
                keyless) mark no-f4 ;;
                silent) mark; rm -f "$state/status" ;;
                other) mark; echo 7 >"$state/inode" ;;
                *) mark ;;
            esac
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
content_of() { cat "$libexec/$1" 2>/dev/null || printf none; }
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
passed() { rm -rf "$root"; echo "$((count - fails))/$count $1 cases pass"; [ "$fails" -eq 0 ]; }
