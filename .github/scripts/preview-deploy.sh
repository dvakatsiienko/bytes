#!/usr/bin/env bash
# Asks Vercel for a PREVIEW of each app named on stdin (one dir per line),
# built from the PR's commit on GitHub, waits for each to finish, and prints
# one `<app> <url> <state>` line per app. Previews are off by default since
# BYT-84 and come back on demand, by label, because each counts on the daily cap.
#
# 🚨 This step holds VERCEL_TOKEN, which can deploy production too, so nothing
# of the PR's is on this runner: no checkout, no CLI. The api's `gitSource`
# names the commit and Vercel fetches and builds it on its side. The `vercel`
# CLI was tried first and is out: `vercel deploy` compiles and runs a
# `vercel.ts` from the tree it uploads (the verifier proved it on #127).
#
# Env: VERCEL_TOKEN, REPO (owner/name), REF (the PR branch), SHA (its head)
set -euo pipefail

map="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vercel-projects.json"
[ -n "${VERCEL_TOKEN:-}" ] && [ -n "${REPO:-}" ] && [ -n "${REF:-}" ] && [ -n "${SHA:-}" ] \
  || { echo "usage: VERCEL_TOKEN=… REPO=<o/r> REF=<branch> SHA=<sha> preview-deploy.sh < apps" >&2; exit 2; }
org=$(jq -r '.org' "$map")

# The token reaches curl through a config on stdin, never through argv.
api() {
  curl -sS --config - "$@" <<<"header = \"Authorization: Bearer $VERCEL_TOKEN\""
}

failed=0
while read -r app; do
  [ -n "$app" ] || continue
  project=$(jq -r --arg a "$app" '.projects[$a] // empty' "$map")
  if [ -z "$project" ]; then
    echo "::error::$app is not in .github/vercel-projects.json" >&2
    failed=1
    continue
  fi
  body=$(jq -n --arg app "$app" --arg project "$project" --arg repo "$REPO" --arg ref "$REF" --arg sha "$SHA" \
    '{name: $app, project: $project,
      gitSource: {type: "github", org: ($repo | split("/")[0]), repo: ($repo | split("/")[1]), ref: $ref, sha: $sha}}')
  created=$(api -X POST -H 'Content-Type: application/json' -d "$body" \
    "https://api.vercel.com/v13/deployments?teamId=$org") || created='{}'
  id=$(jq -r '.id // empty' <<<"$created")
  if [ -z "$id" ]; then
    echo "::error::$app preview was refused: $(jq -r '.error.message // "no answer"' <<<"$created")" >&2
    failed=1
    continue
  fi

  # deadline: 60 polls × 10 s; a cv build measured ~40 s.
  state=QUEUED
  for _ in $(seq 60); do
    state=$(api "https://api.vercel.com/v13/deployments/$id?teamId=$org" | jq -r '.readyState // "UNKNOWN"') || state=UNKNOWN
    case "$state" in READY | ERROR | CANCELED) break ;; esac
    sleep 10
  done
  echo "$app https://$(jq -r '.url' <<<"$created") $state"
  [ "$state" = READY ] || failed=1
done
exit "$failed"
