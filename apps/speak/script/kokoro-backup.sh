#!/bin/sh
# keeps kokoro's model and voices, tries a new mlx-audio beside the live one, and moves to it only after a passed check.
# no verb restarts the live server: a switch or a rollback counts from its next start, which is dima's word.
# usage: script/kokoro-backup.sh --backup
#        script/kokoro-backup.sh --candidate [--model] [--silent]  a backup, the newest mlx-audio beside the live one, the check; --model takes the hub's newest model too
#        script/kokoro-backup.sh --check [--silent]                the candidate's five voices against the backup's, the pairs, af_heart out loud
#        script/kokoro-backup.sh --switch [--unheard]              the live tool becomes the candidate; one whose af_heart was not played needs --unheard
#        script/kokoro-backup.sh --drop                            the candidate goes
#        script/kokoro-backup.sh --rollback <date>                 the live tool and the model as that backup found them
set -eu
here=$(cd "$(dirname "$0")" && pwd)
. "$here/lib/daemon-installed.sh"

voices='af_heart af_bella af_jessica af_nova af_alloy'
line='Kokoro reads this line twice, once from each version, so the two can be heard side by side.'
# the live server has 7385
url=http://127.0.0.1:7395
repo=mlx-community/Kokoro-82M-bf16
model=models--mlx-community--Kokoro-82M-bf16
hub="$HOME/.cache/huggingface/hub"
tool="$HOME/.local/share/uv/tools/mlx-audio"
bin="$HOME/.local/bin"
data="$HOME/.local/share/x-speak"
backups="$data/kokoro-backup"
# the tool's clones: a backup holds no link, a tool is full of them
clones="$data/kokoro-tool"
candidate="$data/kokoro-candidate"
new_tool="$candidate/tools/mlx-audio"
pairs="$data/kokoro-pairs"

scratch=$(mktemp -d "${TMPDIR:-/tmp}/kokoro-backup.XXXXXX")
server=
stop_server() {
    [ -n "$server" ] || return 0
    kill "$server" 2>/dev/null || true
    wait "$server" 2>/dev/null || true
    server=
}
# the backup a switch that is under way goes back to, however it ends
switching=
deaf() { trap '' HUP INT PIPE TERM; }
# a put back that began and did not end
undone=
leave() {
    deaf
    stop_server
    [ -z "$switching" ] || put_back "$switching" || true
    [ -z "$undone" ] || echo "kokoro-backup: not put back — --rollback $undone" >&2 || true
    # the tool that was there stays where it was moved to, until the one put back is whole
    [ -n "$undone" ] && [ -d "$scratch/old-tool" ] || rm -rf "$scratch"
    rmdir "$lock"
}
mkdir -p "$data"
# two runs at once share the port, the candidate and the clones
lock="$data/kokoro-backup.lock"
if ! mkdir "$lock" 2>/dev/null; then
    rmdir "$scratch"
    refuse "another run is under way; none running: rmdir $lock"
fi
trap leave EXIT
trap 'deaf; exit 130' HUP INT PIPE TERM

# the dates of the backups, oldest first; anything else in their folder is not this script's
dates() { ls -1 "$backups" 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{6}$' | sort || true; }
newest() { dates | tail -1; }
freeze() { uv pip freeze --quiet --python "$1/bin/python"; }
version() { sed -n 's/^mlx-audio==//p' "$1"; }
is_silent() { daemon_speaks && refuse 'x-speak is reading aloud now — wait for it to end'; return 0; }
answers() { curl -sf -m 1 -o /dev/null "$url/docs"; }
rev_of() { cat "$1/$model/refs/main"; }
candidate_hub() { if [ -d "$candidate/hub" ]; then echo "$candidate/hub"; else echo "$hub"; fi; }

# the five lines from one tool, its server on the scratch port, the saved model and no network
render() { # tool, hub, out
    is_silent
    if answers; then refuse "another server answers at $url"; fi
    mkdir -p "$3"
    # the python by name: a clone's own scripts name the folder they were installed to. the server makes a logs/ folder where it starts
    (cd "$scratch" && HF_HUB_OFFLINE=1 HF_HUB_CACHE="$2" PYTHONDONTWRITEBYTECODE=1 exec "$1/bin/python" "$1/bin/mlx_audio.server" --host 127.0.0.1 --port "${url##*:}") >"$data/kokoro-scratch.log" 2>&1 &
    server=$!
    tries=0
    until answers; do
        tries=$((tries + 1))
        kill -0 "$server" 2>/dev/null && [ "$tries" -le 240 ] || refuse "the server of $1 did not come up: $data/kokoro-scratch.log"
        sleep 0.5
    done
    for voice in $voices; do
        # his reads come first
        tries=0
        while daemon_speaks; do
            tries=$((tries + 1))
            [ "$tries" -le 600 ] || refuse 'x-speak read aloud for ten minutes'
            sleep 1
        done
        curl -sf -m 90 -o "$3/$voice.wav" "$url/v1/audio/speech" -H 'content-type: application/json' \
            -d "{\"input\":\"$line\",\"model\":\"$repo\",\"response_format\":\"wav\",\"voice\":\"$voice\"}" \
            || refuse "$voice was not rendered, $data/kokoro-scratch.log: $(tail -3 "$data/kokoro-scratch.log")"
    done
    stop_server
}

backup() {
    rev=$(rev_of "$hub")
    kept=$(newest)
    # a second one of the same tool would push the one before it out
    if is_live "$kept"; then
        echo "backup: $backups/$kept holds the live tool already"
        return 0
    fi
    snapshot="$hub/$model/snapshots/$rev"
    [ -n "$rev" ] && [ -d "$snapshot" ] || refuse "no saved model at $snapshot"
    date=$(date +%Y-%m-%dT%H%M%S)
    rm -rf "$scratch/backup"
    mkdir -p "$scratch/backup" "$backups" "$clones"
    # the files behind the links, two deep: a snapshot's into blobs/, and a blob's into the store every model shares
    cp -RLc "$snapshot" "$scratch/backup/snapshot"
    diff -rq "$snapshot" "$scratch/backup/snapshot" >&2 || refuse 'a copied file differs from the one it was copied from'
    cp "$hub/$model/refs/main" "$scratch/backup/refs-main"
    cp "$tool/uv-receipt.toml" "$scratch/backup/"
    freeze "$tool" >"$scratch/backup/freeze.txt"
    render "$tool" "$hub" "$scratch/backup/renders"
    rm -rf "$scratch/clone"
    cp -Rc "$tool" "$scratch/clone"
    mv "$scratch/clone" "$clones/$date"
    mv "$scratch/backup" "$backups/$date"
    dates | sort -r >"$scratch/dates"
    # the newest two for their voices, the newest two whole ones for the way back: the same two, but for a clone that is gone
    seen=0
    whole=0
    while read -r old; do
        seen=$((seen + 1))
        if [ "$whole" -lt 2 ] && is_whole "$old"; then
            whole=$((whole + 1))
        elif [ "$seen" -gt 2 ]; then
            rm -rf "${backups:?}/$old" "${clones:?}/$old"
        fi
    done <"$scratch/dates"
    echo "backup: $backups/$date — mlx-audio $(version "$backups/$date/freeze.txt"), model $rev"
}

# $1 is a backup with all its parts
is_whole() { dates | grep -qxF -- "$1" && [ -s "$backups/$1/refs-main" ] && [ -d "$backups/$1/snapshot" ] && [ -x "$clones/$1/bin/python" ]; }
# $1 holds the live tool and model
is_live() { is_whole "$1" && [ "$(freeze "$tool")" = "$(cat "$backups/$1/freeze.txt")" ] && [ "$(rev_of "$hub")" = "$(cat "$backups/$1/refs-main")" ]; }

# what a receipt asks for, one a line: name[extra], or name @ url. a switched tool's receipt also names its constraints, in a list of their own
requirements() {
    sed '/^]/q' "$1" | sed -nE -e 's/^ *\{ name = "([^"]+)", extras = \[([^]]*)\] \}.*/\1[\2]/p' -e 's/^ *\{ name = "([^"]+)", url = "([^"]+)" \}.*/\1 @ \2/p' \
        -e 's/^ *\{ name = "([^"]+)" \}.*/\1/p' | tr -d '"'
}
install_tool() { # receipt, the tools' folder, the commands' folder, more words for uv
    requirements "$1" >"$scratch/requirements"
    [ "$(wc -l <"$scratch/requirements")" -eq "$(sed '/^]/q' "$1" | grep -c '{ name = ')" ] || refuse "$1 asks for something in a shape not known here"
    # named, or uv would go where the shell's own variables say
    UV_TOOL_DIR=$2
    UV_TOOL_BIN_DIR=$3
    export UV_TOOL_DIR UV_TOOL_BIN_DIR
    shift 3
    first=$(head -1 "$scratch/requirements")
    sed 1d "$scratch/requirements" >"$scratch/with"
    uv tool install --quiet --force --python 3.12 --with-requirements "$scratch/with" "$@" "$first"
}

try_candidate() { # yes for a moved model, yes for no sound
    backup
    rm -rf "$candidate"
    mkdir -p "$candidate"
    install_tool "$tool/uv-receipt.toml" "$candidate/tools" "$candidate/bin"
    # its folder first: a download that is ended leaves a candidate with no model, never one with the live one
    [ -z "$1" ] || mkdir "$candidate/hub"
    if [ -n "$1" ] && ! HF_HUB_CACHE="$candidate/hub" "$new_tool/bin/hf" download "$repo" >/dev/null; then
        rm -rf "$candidate"
        refuse 'the new model did not come, so there is no candidate'
    fi
    check "$2"
}

# a render fails when it is silent (rms under 1 % of full scale) or more than 15 % off the backup's length
compare='
const { readFileSync } = require("node:fs");
const sound = (file) => {
  const bytes = readFileSync(file);
  const at = bytes.indexOf("data", 12, "latin1") + 8;
  const rate = bytes.readUInt32LE(24);
  let sum = 0;
  let count = 0;
  for (let i = at; i + 1 < bytes.length; i += 2) { sum += (bytes.readInt16LE(i) / 32768) ** 2; count += 1; }
  return { rms: count ? Math.sqrt(sum / count) : 0, seconds: count / rate };
};
const [before, after, ...voices] = process.argv.slice(1);
for (const voice of voices) {
  const [old, now] = [sound(`${before}/${voice}.wav`), sound(`${after}/${voice}.wav`)];
  const faults = [];
  if (now.rms < 0.01) faults.push("silent");
  if (!(Math.abs(now.seconds / old.seconds - 1) <= 0.15)) faults.push("its length is off");
  if (faults.length) process.exitCode = 1;
  console.log(`${voice}: ${faults.length ? `failed, ${faults.join(" and ")}` : "good"} — ${old.seconds.toFixed(1)} s → ${now.seconds.toFixed(1)} s`);
}
'
check() { # yes for no sound
    [ -d "$new_tool" ] || refuse 'no candidate: --candidate makes one'
    kept="$backups/$(newest)"
    rm -rf "$candidate/passed" "$candidate/heard" "$candidate/renders"
    freeze "$new_tool" >"$candidate/freeze.txt"
    old=$(version "$kept/freeze.txt")
    now=$(version "$candidate/freeze.txt")
    new_hub=$(candidate_hub)
    render "$new_tool" "$new_hub" "$candidate/renders"
    old="$old $(cut -c1-8 "$kept/refs-main")"
    now="$now $(rev_of "$new_hub" | cut -c1-8)"
    folder="$pairs/$old to $now"
    mkdir -p "$folder"
    failed=
    # shellcheck disable=SC2086 # a word a voice
    node -e "$compare" "$kept/renders" "$candidate/renders" $voices || failed=yes
    for voice in $voices; do
        cp "$kept/renders/$voice.wav" "$folder/$voice before $old.wav"
        cp "$candidate/renders/$voice.wav" "$folder/$voice after $now.wav"
    done
    if [ "$(rev_of "$new_hub")" != "$(cat "$kept/refs-main")" ]; then
        for file in "$kept"/snapshot/voices/*; do
            moved="$new_hub/$model/snapshots/$(rev_of "$new_hub")/voices/${file##*/}"
            if [ ! -f "$moved" ]; then
                echo "${file##*/}: failed, the new model has none"
                failed=yes
            elif ! cmp -s "$file" "$moved"; then
                echo "${file##*/}: changed, expected by the move"
            fi
        done
    fi
    echo "pairs: $folder"
    [ -z "$failed" ] || refuse 'the check failed, no switch'
    stamp >"$candidate/passed"
    echo "check: passed, $old → $now"
    [ -z "$1" ] || return 0
    if daemon_speaks; then
        echo 'af_heart was not played: x-speak is reading aloud now — --check plays it again'
    else
        afplay "$candidate/renders/af_heart.wav"
        stamp >"$candidate/heard"
    fi
}
# what was checked: the packages and the model, against which backup
stamp() { newest; cat "$candidate/freeze.txt"; rev_of "$(candidate_hub)"; }

is_stamped() { [ -f "$candidate/$1" ] && [ "$(cat "$candidate/$1")" = "$(stamp)" ]; }

switch() { # yes for one that was not heard
    is_stamped passed || refuse 'no passed check of this candidate: --check'
    [ -n "$1" ] || is_stamped heard || refuse 'its af_heart was not played: --check plays it, --switch --unheard goes without'
    kept=$(newest)
    is_live "$kept" || refuse 'no whole backup of the live tool as it is now: --candidate again'
    # uv deletes the commands a receipt names, wherever they are: a copied tool's are another tool's
    if sed -n 's/.*install-path = "\([^"]*\)".*/\1/p' "$tool/uv-receipt.toml" | grep -qvF "$bin/"; then
        refuse "the receipt of $tool names commands outside $bin, and the install would delete them"
    fi
    rev=$(rev_of "$(candidate_hub)")
    # the files behind its links, whole before anything moves
    if [ "$rev" != "$(rev_of "$hub")" ]; then cp -RLc "$candidate/hub/$model/snapshots/$rev" "$scratch/new-snapshot"; fi
    is_silent
    echo "switching; cut off before its last line: --rollback $kept"
    switching=$kept
    if ! install_tool "$new_tool/uv-receipt.toml" "${tool%/*}" "$bin" --constraints "$candidate/freeze.txt" \
        || [ "$(freeze "$tool")" != "$(cat "$candidate/freeze.txt")" ] || ! [ "$bin/mlx_audio.server" -ef "$tool/bin/mlx_audio.server" ]; then
        refuse 'the live tool is not the checked one, it goes back'
    fi
    if [ -d "$scratch/new-snapshot" ]; then
        # one of that name is no live one
        rm -rf "$hub/$model/snapshots/$rev"
        mv "$scratch/new-snapshot" "$hub/$model/snapshots/$rev"
        printf %s "$rev" >"$hub/$model/refs/main"
    fi
    switching=
    echo "switched: mlx-audio $(version "$candidate/freeze.txt"), from the live server's next start. back: --rollback $kept"
}

rollback() {
    is_whole "$1" || refuse "no whole backup «$1»; there are: $(dates | tr '\n' ' ')"
    is_silent
    put_back "$1"
}
# no read and no signal holds it back: it ends a switch that broke off. both copies are whole before anything moves
put_back() {
    deaf
    undone=$1
    rev=$(cat "$backups/$1/refs-main")
    snapshot="$hub/$model/snapshots/$rev"
    rm -rf "$scratch/tool" "$scratch/snapshot"
    cp -Rc "$clones/$1" "$scratch/tool" && cp -Rc "$backups/$1/snapshot" "$scratch/snapshot" || return 1
    mkdir -p "$bin" "$hub/$model/snapshots" "$hub/$model/refs" || return 1
    [ ! -d "$tool" ] || mv "$tool" "$scratch/old-tool" || return 1
    mv "$scratch/tool" "$tool" || return 1
    # its commands, which an install that broke off took away
    sed -nE 's/^ *\{ name = "([^"]+)", install-path = .*/\1/p' "$tool/uv-receipt.toml" | while read -r name; do ln -sf "$tool/bin/$name" "$bin/$name"; done || return 1
    if ! diff -rq "$scratch/snapshot" "$snapshot" >/dev/null 2>&1; then
        [ ! -d "$snapshot" ] || mv "$snapshot" "$scratch/old-snapshot" || return 1
        mv "$scratch/snapshot" "$snapshot" || return 1
    fi
    cp "$backups/$1/refs-main" "$hub/$model/refs/main" || return 1
    undone=
    echo "rolled back: mlx-audio $(version "$backups/$1/freeze.txt"), model $rev, from the live server's next start" || true
}

verb=${1:-}
[ $# -eq 0 ] || shift
date=
moves_model=
without_sound=
unheard=
for word in "$@"; do
    case "$verb $word" in
    '--candidate --model') moves_model=yes ;;
    '--candidate --silent' | '--check --silent') without_sound=yes ;;
    '--switch --unheard') unheard=yes ;;
    '--rollback '[0-9]*) date=$word ;;
    *) verb=usage ;;
    esac
done
case "$verb" in
--backup) backup ;;
--candidate) try_candidate "$moves_model" "$without_sound" ;;
--check) check "$without_sound" ;;
--switch) switch "$unheard" ;;
--drop) rm -rf "$candidate" ;;
--rollback) rollback "$date" ;;
*) refuse 'usage: --backup, --candidate [--model] [--silent], --check [--silent], --switch [--unheard], --drop, --rollback <date>' ;;
esac
