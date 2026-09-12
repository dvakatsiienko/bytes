#!/usr/bin/env bash
# What this push or PR touched, and the vercel apps worth a clean-clone install.
# One read, so the jobs that need it do not each re-derive it.
#
# 📌 Only what a JOB has to decide before it starts lives here. A service
# container and a matrix are both fixed at job-definition time, so `financial`
# and the app list are read from paths. Everything a STEP decides is better
# asked of turbo after the install, where the answer is exact rather than a path
# guess — see the chromium step in ci.yml.
#
# The `financial` test is deliberately wide: its build is affected by its own
# app, by any shared package it consumes, and by a lockfile move. Over-matching
# costs one skipped-container job's worth of nothing; under-matching costs a
# build that fails looking for a database. Wrong on the safe side, on purpose.
#
# Env: BASE (the ref or sha to diff against), GITHUB_OUTPUT
set -euo pipefail

if [ -n "${BASE:-}" ] && git rev-parse --verify --quiet "$BASE" >/dev/null; then
  files=$(git diff --name-only "$BASE"...HEAD)
  echo "diffed against $BASE"
else
  # A push to main with no usable base, or a first commit: assume everything
  # changed. The riders then run, which is exactly what they did before.
  files=$(git ls-files)
  echo "no usable base — treating every file as changed"
fi

has() { grep -qE "$1" <<<"$files"; }

{
  has '^renovate\.json$'                              && echo "renovate=true" || echo "renovate=false"
  # 📌 Root `turbo.jsonc` is in the list because `apps/financial/turbo.jsonc`
  # extends `//` — a change to the inherited `build` task reaches this app's
  # build, and the check job now excludes `financial` explicitly, so missing it
  # would let a broken financial build merge untested. Greptile found that.
  # This job's own definition is in the list for the same reason the install
  # matrix's is: a change to the job should be exercised by the PR that makes it.
  has '^(apps/financial/|packages/|pnpm-lock\.yaml$|pnpm-workspace\.yaml$|package\.json$|turbo\.jsonc$|\.github/(workflows/ci\.yml|scripts/ci-changes\.sh)$)' \
                                                      && echo "financial=true" || echo "financial=false"
  # A manifest or the lockfile is the only thing that can change what a filtered
  # install resolves — plus the definition of the job that checks it, so a change
  # to the matrix is exercised by the PR that makes it rather than one merge
  # later. That rule paid for itself immediately: this script's own first PR
  # touched no manifest at all.
  # 📌 `.npmrc` is in the list and it is not padding. CLAUDE.md names its
  # `public-hoist-pattern[]` as THE fix for «a tool that resolves its plugins
  # from its own package location fails in pnpm's strict store» — which is
  # exactly the failure `vercel-install` exists to catch. An `.npmrc` edit moves
  # no manifest and no lockfile, so without this the one job that would prove it
  # is the one job that skips.
  has '(^|/)package\.json$|^pnpm-lock\.yaml$|^pnpm-workspace\.yaml$|^\.npmrc$|(^|/)vercel\.json$|^\.github/(workflows/ci\.yml|scripts/ci-changes\.sh)$' \
                                                      && echo "installs=true" || echo "installs=false"
} >> "$GITHUB_OUTPUT"

# The apps a clean-clone install is worth running for are the ones Vercel
# actually deploys, and both commands are the ones Vercel actually runs — all
# read from `vercel.json` rather than listed here, so this cannot drift from
# what production does.
#
# 📌 `buildCommand` included, and the first version of this got it wrong: it
# read only `installCommand` and hardcoded `pnpm run build`, while claiming in
# this very comment that both came from the file. `apps/trophy-sys/vercel.json`
# already sets `"buildCommand": "pnpm build"` — equivalent today, silently
# divergent the day it stops being. A comment that overstates what the code does
# is the failure this repo's CLAUDE.md exists to prevent, and it was caught in
# review rather than by the code.
#
# `buildable` is false where a build needs something no container can stand in
# for. `x-com-chat` calls preloadQuery against Convex while Next prerenders, so
# it needs a reachable deployment; a URL string is not enough. It still proves
# its filtered install resolves, which is the thing this job exists to catch.
#
# 📌 The same app is excluded a second time, in `ci.yml`'s build filter, for the
# same reason. Two places, deliberately: the filter there also drops `financial`,
# which builds here — so one list cannot serve both. A seventh app that cannot
# build in CI needs editing in both spots, and each says so.
apps=$(for f in apps/*/vercel.json; do
  dir=$(dirname "$f")
  name=$(jq -r '.name' "$dir/package.json")
  install=$(jq -r '.installCommand // empty' "$f")
  [ -n "$install" ] || continue
  # 📌 The fallback is what these apps resolve to, not «Vercel's default» —
  # Vercel's real default is derived from the framework preset, and it lands on
  # `pnpm run build` here only because every app happens to define that script.
  # Saying the first thing was the same overstatement this file was just fixed
  # for, one comment further down.
  build=$(jq -r '.buildCommand // "pnpm run build"' "$f")
  jq -n --arg dir "$dir" --arg name "$name" --arg install "$install" --arg build "$build" \
    '{dir: $dir, name: $name, install: $install, build: $build,
      buildable: ($name != "x-com-chat")}'
done | jq -sc 'sort_by(.name)')

echo "apps=$apps" >> "$GITHUB_OUTPUT"
echo "$apps" | jq -r '.[] | "  \(.name): \(.install) → \(if .buildable then .build else "(install only)" end)"'
