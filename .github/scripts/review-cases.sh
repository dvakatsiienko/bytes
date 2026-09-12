#!/usr/bin/env bash
# Feeds `.github/review-gate.jq` saved api payloads and checks the verdict it
# returns. This is the only way the gate can be proven red before it is trusted
# green: a PR that edits a workflow already on the default branch makes the
# review action refuse itself, so the findings path can never be exercised on
# the PR that changes it.
#
# A case is one json file: `want` is the conclusion, `expect` any decision
# fields worth pinning, `args` the six jq arguments, `input` the payload.
# Delete the `verdict:` line out of `round-findings.json` and this goes red —
# that is the check that the test is testing something.
#
# 📌 The runner's jq is older than a mac's. jq 1.8 accepts `a + b` as an object
# value where 1.7 demands parentheses, so the suite passed locally and failed to
# compile in CI on the first run. The version is printed for that reason: when
# this goes red on a machine and green on another, the version line is the first
# thing to compare.
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
echo "  jq $(jq --version)"
prog="$here/review-gate.jq"
failed=0

for f in "$here"/review-cases/*.json; do
  name=$(basename "$f" .json)
  want=$(jq -r '.want' "$f")

  out=$(jq '.input' "$f" | jq \
    --arg mode "$(jq -r '.args.mode' "$f")" \
    --arg who "$(jq -r '.args.who' "$f")" \
    --arg author "$(jq -r '.args.author' "$f")" \
    --arg owner "$(jq -r '.args.owner' "$f")" \
    --arg since "$(jq -r '.args.since' "$f")" \
    --arg run "$(jq -r '.args.run' "$f")" \
    -f "$prog")

  got=$(jq -r '.conclusion' <<<"$out")
  wrong=$(jq -rn --argjson want "$(jq '.expect // {}' "$f")" --argjson got "$out" \
    '[$want | to_entries[] | select($got[.key] != .value) | "\(.key)=\($got[.key]) wanted \(.value)"] | join(", ")')

  if [ "$got" = "$want" ] && [ -z "$wrong" ]; then
    printf '  ok   %-24s %s\n' "$name" "$got"
  else
    printf '  FAIL %-24s %s\n' "$name" "${wrong:-conclusion=$got wanted $want}"
    failed=$((failed + 1))
  fi
done

[ "$failed" -eq 0 ] || { echo "::error::$failed review-gate case(s) failed"; exit 1; }
echo "review gate: every case returns the verdict it should"
