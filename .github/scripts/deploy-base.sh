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
# 📌 It fails OPEN: an api error answers `sha=` too. A red step would deploy
# nothing, and one extra build costs nothing against a stale production.
#
# Env: GH_TOKEN, REPO
set -uo pipefail

none() {
  echo "::warning::$1 — deploying every app" >&2
  echo "sha="
  exit 0
}

runs=$(gh api "repos/$REPO/actions/workflows/deploy.yml/runs?status=success&per_page=100" \
  --jq '.workflow_runs[] | select(.head_branch == "main" and .event != "workflow_dispatch") | "\(.id) \(.head_sha)"') \
  || none "could not list the Deploy runs"

while read -r id sha; do
  [ -n "$id" ] || continue
  # The job name is deploy.yml's `name:` for the deploy job; the two move together.
  deployed=$(gh api "repos/$REPO/actions/runs/$id/jobs" \
    --jq '[.jobs[] | select(.name == "deploy affected apps" and .conclusion == "success")] | length') \
    || none "could not read the jobs of Deploy run $id"
  if [ "$deployed" -gt 0 ]; then
    echo "sha=$sha"
    exit 0
  fi
done <<<"$runs"

none "no earlier Deploy that ran its deploy job"
