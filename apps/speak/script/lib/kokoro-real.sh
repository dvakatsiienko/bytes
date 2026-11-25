#!/bin/sh
# kokoro-backup.test.sh --real: dima's own tool and model, a real server on :7395, no sound. by hand, on a word.
set -eu
here=$(cd "$(dirname "$0")/.." && pwd)
. "$here/lib/daemon-installed.sh"
daemon_speaks && refuse 'x-speak is reading aloud now — wait for it to end'
url=http://127.0.0.1:7395
curl -sf -m 1 -o /dev/null "$url/docs" && refuse "another server answers at $url"
# a short path: espeak keeps 160 letters of the one to its data, and the tool holds that
root=$(mktemp -d /tmp/kokoro.XXXXXX)
server=
trap '[ -z "$server" ] || kill "$server" 2>/dev/null || true; rm -rf "$root"' EXIT
tool="$HOME/.local/share/uv/tools/mlx-audio"
hub="$HOME/.cache/huggingface/hub"
model=models--mlx-community--Kokoro-82M-bf16
receipt() { sha_of "$tool/uv-receipt.toml"; }
hub_sum() { find "$hub" \( -type f -o -type l \) -exec stat -f '%N %z %m' {} + | sort | shasum; }
commands() { find "$HOME/.local/bin" -exec stat -f '%N %Y %m' {} + | sort | shasum; }
receipt_before=$(receipt)
hub_before=$(hub_sum)

# the live tool, in the environment the core builds, with no network but this mac
printf 'print(Kokoro.serverEnvironment.map { "\\($0)=\\($1)" }.joined(separator: " "))\n' >"$root/main.swift"
swiftc -swift-version 5 "$here"/../daemon/core/*.swift "$root/main.swift" -o "$root/environment"
environment=$("$root/environment")
box='(version 1)(allow default)(deny network-outbound)(allow network-outbound (remote ip "localhost:*"))'
! sandbox-exec -p "$box" curl -sf -m 5 -o /dev/null https://huggingface.co || refuse 'the box lets the network through'
# shellcheck disable=SC2086 # one word a variable
(cd "$root" && exec env $environment PYTHONDONTWRITEBYTECODE=1 sandbox-exec -p "$box" "$HOME/.local/bin/mlx_audio.server" --host 127.0.0.1 --port 7395) >"$root/server.log" 2>&1 &
server=$!
tries=0
until curl -sf -m 1 -o /dev/null "$url/docs"; do
    tries=$((tries + 1))
    [ "$tries" -le 120 ] || refuse "no answer: $(tail -3 "$root/server.log")"
    sleep 0.5
done
curl -sf -m 90 -o "$root/line.pcm" "$url/v1/audio/speech" -H 'content-type: application/json' \
    -d '{"input":"The quick brown fox jumps over the lazy dog.","model":"mlx-community/Kokoro-82M-bf16","response_format":"pcm","voice":"af_heart"}'
kill "$server"
wait "$server" 2>/dev/null || true
server=
[ "$hub_before" = "$(hub_sum)" ] || refuse 'the cache changed'
echo "✅ offline: «${environment}», no network, $(stat -f %z "$root/line.pcm") bytes of af_heart, nothing fetched"

# a backup of a clone, the clone spoiled, and the rollback's own tool asked for the voices again
home="$root/h"
mkdir -p "$home/.local/share/uv/tools" "$home/.cache/huggingface/hub" "$home/.local/share/x-speak"
cp -Rc "$tool" "$home/.local/share/uv/tools/mlx-audio"
# the model's blobs are links into a store every model shares
cp -Rc "$hub/$model" "$hub/blobs" "$home/.cache/huggingface/hub/"
# a copied receipt names the live commands, and uv deletes what a receipt names
sed "s|install-path = \"$HOME/|install-path = \"$home/|" "$tool/uv-receipt.toml" >"$home/.local/share/uv/tools/mlx-audio/uv-receipt.toml"
export UV_TOOL_DIR="$home/.local/share/uv/tools" UV_TOOL_BIN_DIR="$home/.local/bin"
commands_before=$(commands)
# dima's own reads still come first
ln -s "$HOME/.local/share/x-speak/control.sock" "$home/.local/share/x-speak/control.sock"
kokoro() { HOME="$home" "$here/kokoro-backup.sh" "$@"; }
kokoro --backup
date=$(ls -1 "$home/.local/share/x-speak/kokoro-backup")
rm -rf "$home/.local/share/uv/tools/mlx-audio/lib" "$home/.cache/huggingface/hub/$model/snapshots"
printf nowhere >"$home/.cache/huggingface/hub/$model/refs/main"
! kokoro --backup 2>/dev/null || refuse 'a spoiled tool still made a backup'
kokoro --rollback "$date"
# a backup of a tool it holds already renders nothing
rm -rf "$home/.local/share/x-speak/kokoro-backup"
kokoro --backup
[ "$receipt_before" = "$(receipt)" ] || refuse "the live tool's receipt changed"
[ "$commands_before" = "$(commands)" ] || refuse "$HOME/.local/bin changed"
echo "✅ rollback: the cloned tool renders from $(cat "$home/.cache/huggingface/hub/$model/refs/main"), the live receipt is the same"
