#!/usr/bin/env bash
# Runs the real `review-guard.sh` against a ~3 MB review payload, through a fake
# `gh` on PATH, and checks that the verdict still lands on the check run.
#
# #84 was reviewed so thoroughly that the guard died on `jq: Argument list too
# long` — it passed both payloads to jq as argv — and the cleanup step closed
# `review:clean` red over a clean verdict. Linux caps one argument at 128 KB, a
# mac the whole argv at 1 MB; 3 MB breaks both. Put the payloads back on jq's
# argv and this goes red.
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
case="$here/../review-cases/round-clean.json"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

jq '.input.threads' "$case" > "$work/threads.json"
jq '.input.artifacts + [range(3000) | {
      id: (100000 + .), user: {login: "dvakatsiienko", type: "User"},
      created_at: "2026-09-11T16:00:00Z", body: ("x" * 1000)}]' \
  "$case" > "$work/issues.json"

mkdir "$work/bin"
cat > "$work/bin/gh" <<'GH'
#!/usr/bin/env bash
case "$2" in
  */issues/*/comments) cat "$WORK/issues.json" ;;
  */pulls/*/comments) cat "$WORK/threads.json" ;;
  */pulls/*/reviews) echo '[]' ;;
  */check-runs/*) printf '%s\n' "$@" > "$WORK/patch.txt"; echo patched ;;
  *) echo "fake gh: unexpected call $*" >&2; exit 1 ;;
esac
GH
chmod +x "$work/bin/gh"

: > "$work/output"
args() { jq -r ".args.$1" "$case"; }
WORK=$work PATH="$work/bin:$PATH" GITHUB_OUTPUT="$work/output" \
  GH_TOKEN=fake REPO=o/r PR=1 CHECK=1 OWNER="$(args owner)" \
  REVIEWER="$(args who)" APP="$(args app)" AUTHOR="$(args author)" SINCE="$(args since)" \
  "$here/review-guard.sh" > "$work/log" 2>&1 || true

echo "  payload $(wc -c < "$work/issues.json" | tr -d ' ') bytes"
if grep -qx 'conclusion=success' "$work/patch.txt" 2>/dev/null && grep -qx 'delivered=yes' "$work/output"; then
  echo "review guard: a 3 MB payload still publishes its verdict"
else
  sed 's/^/  /' "$work/log"
  echo "::error::the review guard did not publish its verdict on a 3 MB payload"
  exit 1
fi
