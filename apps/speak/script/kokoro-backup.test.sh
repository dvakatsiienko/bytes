#!/bin/sh
# kokoro's backup, candidate, switch and rollback in a scratch home: uv, the servers and the renders are stubs.
# usage: script/kokoro-backup.test.sh
#        script/kokoro-backup.test.sh --real  by hand, on a word: dima's own tool and model cloned to a scratch home, their server on :7395
here=$(cd "$(dirname "$0")" && pwd)
[ "${1:-}" = --real ] && exec "$here/lib/kokoro-real.sh"
. "$here/lib/daemon-scratch.sh"

mkdir -p "$root/wav"
node -e '
const { writeFileSync } = require("node:fs");
const wav = (name, seconds, peak) => {
  const count = Math.round(seconds * 24000);
  const out = Buffer.alloc(44 + count * 2);
  out.write("RIFF", 0); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(24000, 24); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i += 1) out.writeInt16LE(Math.round(Math.sin(i / 20) * peak * 32767), 44 + i * 2);
  writeFileSync(`${process.argv[1]}/${name}.wav`, out);
};
wav("good", 2, 0.3); wav("near", 2.2, 0.3); wav("silent", 2, 0.005); wav("half", 1, 0.3);
' "$root/wav"

rev1=a71e4d38
rev2=b82f5e49
blob() { # hub, rev, name, content
    sha=$(printf %s "$4" | shasum -a 256 | cut -d' ' -f1)
    store=blobs/$(printf %s "$sha" | cut -c1-2)
    mkdir -p "$1/blobs" "$1/snapshots/$2/voices" "$1/refs" "$1/../$store"
    printf %s "$4" >"$1/../$store/$sha"
    ln -sf "../../$store/$sha" "$1/blobs/$sha"
    up=..; case "$3" in */*) up=../.. ;; esac
    ln -sf "$up/../blobs/$sha" "$1/snapshots/$2/$3"
}
fill_hub() { # hub, rev, af_heart
    blob "$1" "$2" config.json '{}'
    blob "$1" "$2" kokoro-v1_0.safetensors model
    blob "$1" "$2" voices/af_heart.safetensors "$3"
    blob "$1" "$2" voices/af_bella.safetensors bella
    printf %s "$2" >"$1/refs/main"
}
# a python that serves: it says which tool it belongs to, and with what it was started
fill_tool() { # folder, version, where its commands go
    mkdir -p "$1/bin" "$3"
    ln -sf "$1/bin/mlx_audio.server" "$3/mlx_audio.server"
    printf 'misaki==0.9\nmlx-audio==%s\n' "$2" >"$1/packages"
    touch "$1/bin/mlx_audio.server"
    ln -sf python "$1/bin/python3"
    stub_file "$1/bin/python" '[ -f "$state/dies" ] && exit 1
echo "offline=$HF_HUB_OFFLINE hub=$HF_HUB_CACHE rev=$(cat "$HF_HUB_CACHE"/*/refs/main) $*" >>"$state/starts"
trap "rm -f \"$state/up\"; exit 0" TERM
echo "$0" >"$state/up"
left=2000; while [ "$left" -gt 0 ]; do left=$((left - 1)); /bin/sleep 0.01; done'
    stub_file "$1/bin/hf" '. "$state/hub.sh"; fill_hub "$HF_HUB_CACHE/models--mlx-community--Kokoro-82M-bf16" b82f5e49 heart-2'
    cat >"$1/uv-receipt.toml" <<TOML
[tool]
requirements = [
    { name = "mlx-audio", extras = ["server"] },
    { name = "misaki", extras = ["en"] },
    { name = "en-core-web-sm", url = "https://x.test/sm.whl" },
]
constraints = [
    { name = "addict", specifier = "==2.4.0" },
    { name = "spacy", url = "https://x.test/spacy.whl" },
]
entrypoints = [
    { name = "mlx_audio.server", install-path = "$3/mlx_audio.server", from = "mlx-audio" },
]
TOML
}
app() {
    setup
    hub="$HOME/.cache/huggingface/hub/models--mlx-community--Kokoro-82M-bf16"
    tool="$HOME/.local/share/uv/tools/mlx-audio"
    data="$HOME/.local/share/x-speak"
    echo 0.6.8 >"$state/newest"
    fill_hub "$hub" "$rev1" heart
    fill_tool "$tool" 0.6.6 "$HOME/.local/bin"
    tool_before=$(sum_of "$tool")
    stub date 'n=$(($(cat "$state/date" 2>/dev/null || echo 0) + 1)); echo "$n" >"$state/date"; echo "2026-11-25T00000$n"'
    stub afplay 'echo "${1##*/}" >>"$state/played"'
    stub curl 'for word in "$@"; do case "$last" in -o) out=$word ;; -d) body=$word ;; esac; last=$word; done
case "$*" in
*/docs*) [ -f "$state/up" ] || [ -f "$state/taken" ] ;;
*)
    voice=${body##*\"voice\":\"}; voice=${voice%%\"*}
    side=before; case "$(cat "$state/up")" in */kokoro-candidate/*) side=after ;; esac
    [ ! -f "$state/no-$voice" ] || exit 22
    cp "$wav/$(cat "$state/$side-$voice" 2>/dev/null || echo good).wav" "$out"
    [ -f "$state/reads-$side-$voice" ] && printf "{\"speaking\":true}" >"$state/status"
    : ;;
esac'
    stub uv 'case "$1 $2" in
"pip freeze") for tool in "$@"; do :; done; cat "${tool%/bin/python}/packages" ;;
"tool install")
    echo "$*" >>"$state/installs"
    dir=${UV_TOOL_DIR:-$HOME/.local/share/uv/tools}/mlx-audio; pin=
    for word in "$@"; do [ "$last" = --constraints ] && pin=$word; [ "$last" = --with-requirements ] && cat "$word" >>"$state/installs"; last=$word; done
    # as uv does: what the receipt there names goes first
    sed -n "s/.*install-path = \"\([^\"]*\)\".*/\1/p" "$dir/uv-receipt.toml" 2>/dev/null | while read -r command; do rm -f "$command"; done
    rm -rf "$dir"
    [ -z "$pin" ] || [ ! -f "$state/reads-in-install" ] || printf "{\"speaking\":true}" >"$state/status"
    [ -z "$pin" ] || [ ! -f "$state/ended-in-install" ] || { kill -TERM "$PPID"; exit 143; }
    [ -z "$pin" ] || [ ! -f "$state/install-fails" ] || exit 2
    . "$state/hub.sh"; fill_tool "$dir" "$(cat "$state/newest")" "${UV_TOOL_BIN_DIR:-$HOME/.local/bin}"
    [ -z "$pin" ] || cp "$pin" "$dir/packages"
    [ -z "$pin" ] || [ ! -f "$state/drifts" ] || echo drifted==1 >>"$dir/packages" ;;
esac'
    # the stubs make tools and hubs with the same words as this test
    sed -n '/^stub_file()/p' "$here/lib/daemon-scratch.sh" >"$state/hub.sh"
    sed -n '/^blob() {/,/^}/p; /^fill_hub() {/,/^}/p; /^fill_tool() {/,/^}/p' "$here/kokoro-backup.test.sh" >>"$state/hub.sh"
    wav="$root/wav"
    export wav
}
run() { out=$("$root/app/script/kokoro-backup.sh" "$@" 2>&1); code=$?; }
sum_of() { (cd "$1" && find . -type f -exec shasum {} + | sort | shasum); }
only() { ls -1 "$data/$1" 2>/dev/null | tr '\n' ' '; }
played() { cat "$state/played" 2>/dev/null || printf none; }
switched() { grep -c -- --constraints "$state/installs" 2>/dev/null || true; }
live() { sed -n 's/^mlx-audio==//p' "$tool/packages"; }
command_is() { readlink "$HOME/.local/bin/mlx_audio.server" | sed "s|^$tool/|live |"; }
same_tool() { [ "$(sum_of "$tool")" = "$tool_before" ] && echo same || echo moved; }

app; run --backup
kept="$data/kokoro-backup/2026-11-25T000001"
is 'a backup is made' "0 $(basename "$kept") " "$code $(only kokoro-backup)"
is 'it holds no link' '' "$(find "$kept" -type l)"
is 'each file hashes to its blob' "$(ls "$hub/blobs" | sort | tr '\n' ' ')" "$(find "$kept/snapshot" -type f -exec shasum -a 256 {} + | cut -d' ' -f1 | sort | tr '\n' ' ')"
is 'the model it names, the receipt, the packages beside them' "$rev1 same misaki==0.9 mlx-audio==0.6.6 " \
    "$(cat "$kept/refs-main") $(cmp -s "$kept/uv-receipt.toml" "$tool/uv-receipt.toml" && echo same) $(tr '\n' ' ' <"$kept/freeze.txt")"
is 'the five favourites, rendered' 'af_alloy.wav af_bella.wav af_heart.wav af_jessica.wav af_nova.wav ' "$(ls "$kept/renders" | tr '\n' ' ')"
is 'the saved model, offline, on a port of its own' "offline=1 hub=$HOME/.cache/huggingface/hub rev=$rev1 $tool/bin/mlx_audio.server --host 127.0.0.1 --port 7395" "$(cat "$state/starts")"
is 'its server is gone' no "$([ -f "$state/up" ] && echo yes || echo no)"
is 'the tool is cloned beside it, its links kept' "same $(readlink "$tool/bin/python3")" "$([ "$(sum_of "$data/kokoro-tool/2026-11-25T000001")" = "$tool_before" ] && echo same) $(readlink "$data/kokoro-tool/2026-11-25T000001/bin/python3")"
run --backup
is 'the live tool did not move: its backup stays the one' '0 2026-11-25T000001 ' "$code $(only kokoro-backup)"
for n in 2 3; do echo "other==$n" >>"$tool/packages"; run --backup; done
is 'a third backup: the newest two stay' '2026-11-25T000002 2026-11-25T000003 ' "$(only kokoro-backup)"
is 'and their tools' '2026-11-25T000002 2026-11-25T000003 ' "$(only kokoro-tool)"
app; touch "$state/no-af_nova"; run --backup
is 'a voice that does not render: no backup' '1 ' "$code $(only kokoro-backup)"
says 'and it names the voice' 'af_nova was not rendered'
is 'a failed backup leaves no server' no "$([ -f "$state/up" ] && echo yes || echo no)"
app; touch "$state/taken"; run --backup
is 'a port that is taken: no render from a stranger' '1 ' "$code $(only kokoro-backup)"
app; touch "$state/dies"; run --backup
is 'a server that dies at start: refused' '1 ' "$code $(only kokoro-backup)"
app; printf '{"speaking":true}' >"$state/status"; run --backup
is 'reading aloud: no server is started' '1 no' "$code $([ -f "$state/starts" ] && echo yes || echo no)"

app; echo near >"$state/after-af_bella"; run --candidate
is 'five good renders pass' '0 5' "$code $(echo "$out" | grep -c ': good')"
is 'the live tool is untouched' same "$(same_tool)"
is 'a candidate asks for what the live receipt does, and never its pins' "mlx-audio[server] misaki[en] en-core-web-sm @ https://x.test/sm.whl " \
    "$(sed -nE 's/^tool install .* ([^ ]+)$/\1/; p' "$state/installs" | tr '\n' ' ')"
is 'the candidate serves from its own folder' 1 "$(grep -cF " $data/kokoro-candidate/tools/mlx-audio/bin/mlx_audio.server --host" "$state/starts")"
is 'the pairs, by engine and model' 'af_heart after 0.6.8 a71e4d38.wav,af_heart before 0.6.6 a71e4d38.wav' "$(ls "$data/kokoro-pairs/0.6.6 a71e4d38 to 0.6.8 a71e4d38" | grep heart | paste -sd, -)"
is 'af_heart is played once' af_heart.wav "$(played)"
run --check --silent
is 'a silent check plays nothing more' '0 af_heart.wav' "$code $(played)"
echo other >"$data/kokoro-backup/2026-11-25T000001/snapshot/voices/af_heart.safetensors"; run --check --silent
is 'with no model move, no voice is compared' '0 0' "$code $(echo "$out" | grep -c changed)"
for fault in silent half; do
    app; echo "$fault" >"$state/after-af_nova"; run --candidate
    is "a $fault render is named, the good ones too" '1 af_nova: failed 4' "$code $(echo "$out" | grep -o 'af_nova: failed') $(echo "$out" | grep -c ': good')"
    is "a $fault render: nothing is played" none "$(played)"
    run --switch --unheard
    is "a $fault render: no switch" '1 0 0.6.6' "$code $(switched) $(live)"
done
app; touch "$state/reads-after-af_alloy"; run --candidate
is 'a read that starts before af_heart is played: nothing plays' '0 none' "$code $(played)"
says 'and the check says why' 'af_heart was not played: x-speak is reading aloud'
run --check
is 'reading aloud: no check' '1 none' "$code $(played)"
says 'and it says why' 'x-speak is reading aloud now'
app; run --candidate --model
is 'a moved model passes' 0 "$code"
says 'and its changed voice is the move' 'af_heart.safetensors: changed, expected by the move'
is 'a voice that did not change is not named' 0 "$(echo "$out" | grep -c bella.safetensors)"
is 'the live model stays' "$rev1" "$(cat "$hub/refs/main")"
app; run --candidate --silent --model
is 'no sound and a moved model, in either order' "0 none yes" "$code $(played) $([ -d "$data/kokoro-candidate/hub" ] && echo yes)"
rm "$data/kokoro-candidate/hub"/*/snapshots/*/voices/af_heart.safetensors; run --check --silent
is 'a voice the new model lost fails the check' '1 af_heart.safetensors: failed' "$code $(echo "$out" | grep -o 'af_heart.safetensors: failed')"
app; run --check
is 'no candidate: nothing to check' 1 "$code"

app; run --candidate --silent; run --switch
is 'a candidate nobody could hear: no switch' '1 0.6.6' "$code $(live)"
run --switch --unheard
is 'and one on a word' '0 0.6.8' "$code $(live)"
app; run --candidate; run --switch
is 'its command is the live one' 'live bin/mlx_audio.server' "$(command_is)"
run --candidate --silent; run --candidate --silent
is 'the way back outlives the candidates after it' yes "$([ -d "$data/kokoro-backup/2026-11-25T000001" ] && echo yes)"
app; run --candidate; run --switch
is 'a checked candidate becomes the live tool' '0 0.6.8' "$code $(live)"
is 'the switch installs what was heard' "misaki==0.9 mlx-audio==0.6.8 " "$(tr '\n' ' ' <"$tool/packages")"
run --rollback 2026-11-25T000001
is 'a rollback puts the whole tool back' '0 same' "$code $(same_tool)"
rm "$HOME/.local/bin/mlx_audio.server"; run --rollback 2026-11-25T000001
is 'and its commands' 'live bin/mlx_audio.server' "$(command_is)"
app; run --candidate; mkdir "$root/elsewhere"; touch "$root/elsewhere/mlx_audio.server"
sed "s|install-path = \"[^\"]*\"|install-path = \"$root/elsewhere/mlx_audio.server\"|" "$tool/uv-receipt.toml" >"$state/receipt"; cp "$state/receipt" "$tool/uv-receipt.toml"; run --switch
is 'a receipt that names commands elsewhere, as a copied tool has: no install' '1 0 there' "$code $(switched) $([ -f "$root/elsewhere/mlx_audio.server" ] && echo there)"
says 'and it says which tool' 'names commands outside'
rm -rf "$root/elsewhere"
for end in install-fails ended-in-install; do
    app; run --candidate; touch "$state/$end" "$state/reads-in-install"; run --switch
    is "$end, with a read begun meanwhile: all of it is put back" 'same live bin/mlx_audio.server' "$(same_tool) $(command_is)"
    is "$end: is an error" yes "$([ "$code" -ne 0 ] && echo yes)"
done
app; run --candidate; echo other==1 >>"$data/kokoro-candidate/tools/mlx-audio/packages"; run --check --silent; echo mlx==9 >>"$data/kokoro-candidate/freeze.txt"; run --switch --unheard
is 'a candidate that is not the checked one: no switch' '1 0.6.6' "$code $(live)"
app; run --candidate; echo newer==1 >>"$tool/packages"; run --switch
is 'a live tool that moved since its backup: no switch' '1 0' "$code $(switched)"
app; run --candidate; touch "$state/drifts"; run --switch
is 'an install that is not the checked one is put back' '1 same' "$code $(same_tool)"
app; run --candidate; printf '{"speaking":true}' >"$state/status"; run --switch
is 'reading aloud: no switch' '1 0.6.6' "$code $(live)"
run --rollback 2026-11-25T000001
is 'reading aloud: no rollback' 1 "$code"
app; run --candidate --model; run --switch
is 'a moved model is the live one after a switch' "0 $rev2 heart-2" "$code $(cat "$hub/refs/main") $(cat "$hub/snapshots/$rev2/voices/af_heart.safetensors")"
rm -rf "$hub/snapshots/$rev1"; run --rollback 2026-11-25T000001
is 'a rollback brings the old model back, whole' "0 $rev1 heart same" "$code $(cat "$hub/refs/main") $(cat "$hub/snapshots/$rev1/voices/af_heart.safetensors") $(same_tool)"
app; run --backup; run --rollback 2026-11-24T000000
is 'an unknown date: refused' '1 same' "$code $(same_tool)"
says 'and it names the ones there are' '2026-11-25T000001'
run --rollback
is 'no date: refused' '1 same' "$code $(same_tool)"
run --rollback ../kokoro-backup
is 'a path is no date' '1 same' "$code $(same_tool)"
app; run --candidate; run --drop
is 'a dropped candidate leaves the live tool and the backup' '0 no same 2026-11-25T000001 ' "$code $([ -d "$data/kokoro-candidate" ] && echo yes || echo no) $(same_tool) $(only kokoro-backup)"
for word in '' --restart; do
    app; run $word
    is "«${word}» is no verb" 1 "$code"
    says "«${word}»: says how" usage
done
passed kokoro
