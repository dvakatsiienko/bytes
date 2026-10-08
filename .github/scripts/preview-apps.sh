#!/usr/bin/env bash
# Prints the Vercel apps a PR touches, one dir per line, from the PR's list of
# changed files as the GitHub api reports it.
#
# A file under `apps/<app>/` previews that app; one under `packages/` previews
# every app. Root files (the lockfile, a manifest, `.github/`) count only when
# nothing else did, and then every app is previewed — so an x-com-chat bump
# (its manifest + the lockfile) previews x-com-chat alone. That is coarser
# than turbo's graph, and it is chosen on purpose: turbo, run on the
# PR's tree, hands off to a binary the PR can commit under `node_modules`, and
# in a `pull_request_target` job that binary would share the runner with
# VERCEL_TOKEN (the verifier proved it on #127). A list of names from the api
# runs nothing. A preview is asked for by hand, so an extra one costs only quota.
#
# Env: GH_TOKEN, REPO, PR
set -euo pipefail

map="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vercel-projects.json"
[ -n "${REPO:-}" ] && [ -n "${PR:-}" ] || { echo "usage: REPO=<o/r> PR=<n> preview-apps.sh" >&2; exit 2; }

gh api "repos/$REPO/pulls/$PR/files" --paginate --jq '.[].filename' \
  | jq -Rnr --slurpfile map "$map" '
      ($map[0].projects | keys) as $apps
      | [inputs] as $files
      | ([$files[] | select(test("^apps/[^/]+/")) | capture("^apps/(?<a>[^/]+)/").a | select(IN($apps[]))] | unique) as $touched
      | if any($files[]; startswith("packages/")) or ($touched | length) == 0 then $apps[] else $touched[] end'
