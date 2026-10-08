#!/usr/bin/env bash
# Prints `sha=<head of the last Deploy that really deployed>` for $GITHUB_OUTPUT,
# or `sha=` when there is none, which deploy-main.sh answers by deploying every app.
#
# Deploy runs after a green CI on main, so a push whose CI went red or was
# cancelled deploys nothing. Diffing against the push's own `before` would then
# lose that push's apps for good: the next green push diffs only itself. The
# last real deploy is the base that carries every skipped push forward.
#
# «Really deployed» means the deploy JOB succeeded, not the run: a run whose job
# was skipped by its `if:` can still read as a success, and counting one would
# move the base past apps that never shipped. A manual run deploys only what was
# picked, so it never counts either.
#
# Env: GH_TOKEN, REPO
set -euo pipefail

runs=$(gh api "repos/$REPO/actions/workflows/deploy.yml/runs?status=success&per_page=50" \
  --jq '.workflow_runs[] | select(.head_branch == "main" and .event != "workflow_dispatch") | "\(.id) \(.head_sha)"')

while read -r id sha; do
  [ -n "$id" ] || continue
  deployed=$(gh api "repos/$REPO/actions/runs/$id/jobs" \
    --jq '[.jobs[] | select(.name == "deploy affected apps" and .conclusion == "success")] | length')
  if [ "$deployed" -gt 0 ]; then
    echo "sha=$sha"
    exit 0
  fi
done <<<"$runs"

echo "::warning::no earlier Deploy that ran its deploy job — deploying every app" >&2
echo "sha="
