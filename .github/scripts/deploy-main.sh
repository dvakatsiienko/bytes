#!/usr/bin/env bash
# Triggers a Vercel deploy hook for each app this push actually touched.
#
# Vercel's git integration is off (every `vercel.json` carries
# `git.deploymentEnabled: false`), so nothing deploys itself any more. This is
# the only thing that deploys production.
#
# The app list comes from turbo's own task graph rather than a path pattern,
# for the reason ci.yml's chromium step spells out: a path list cannot know
# that a new package started depending on `kit`, and turbo does.
#
# Env: BASE (the sha to diff against), HOOKS (the VERCEL_DEPLOY_HOOKS secret).
# It writes no step output — nothing downstream reads one.
#
# 🚨 Every hook url is a bearer credential — anyone holding one can deploy the
# project. GitHub masks a secret's exact string, NOT a value parsed out of it,
# so each url is registered with `::add-mask::` the moment it is extracted.
# Nothing in here may echo a url.
set -euo pipefail

# The runner ships jq 1.7 and this mac 1.8. Print it, because a program that
# parses here and not there is a class this repo has already been bitten by.
jq --version

if [ -z "${HOOKS:-}" ]; then
  echo "::error::VERCEL_DEPLOY_HOOKS is empty or unset — nothing can deploy"
  exit 1
fi
if ! jq -e 'type == "object"' <<<"$HOOKS" >/dev/null 2>&1; then
  echo "::error::VERCEL_DEPLOY_HOOKS is not a json object"
  exit 1
fi

# Which apps does Vercel deploy, and what does each one's package call itself?
# Both read from the files, so this cannot drift from reality the way a list
# written here would. The directory name is the key in the secret; the package
# name is what turbo answers with, and the two genuinely differ —
# `apps/space-explorer-ui` is the package `@space-explorer/ui`.
#
# 🚨 Checked in a loop of its own, BEFORE the map is built, because the failure
# is silent otherwise: a `jq` that cannot read a manifest fails inside an
# argument substitution, where `set -e` does not see it, and hands back an empty
# string. The app would then sit in the map under the key `""`, match nothing
# turbo ever reports, never deploy — and the job would still exit 0 green. An
# `exit` inside the substitution below would leave the same subshell, so the
# guard cannot live there.
for f in apps/*/vercel.json; do
  dir=$(dirname "$f")
  if ! jq -e '.name | type == "string" and length > 0' "$dir/package.json" >/dev/null 2>&1; then
    echo "::error::$dir/package.json has no usable \"name\" — $(basename "$dir") could not be matched to what turbo reports, and would be skipped without a word"
    exit 1
  fi
done

deployable=$(
  for f in apps/*/vercel.json; do
    dir=$(dirname "$f")
    jq -n --arg app "$(basename "$dir")" --arg pkg "$(jq -r '.name' "$dir/package.json")" \
      '{key: $pkg, value: $app}'
  done | jq -sc 'from_entries'
)
echo "vercel apps: $(jq -r 'to_entries | map(.value) | sort | join(", ")' <<<"$deployable")"

# What this push touched. A base that git cannot resolve — the all-zero sha of
# a first push, a force-push past the ref, a truncated clone — is not a reason
# to deploy nothing; it is a reason to deploy everything, because the cost of
# one extra build is nothing against a production that silently never updates.
if [ -n "${BASE:-}" ] && git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
  echo "diffed against $BASE"
  plan=$(TURBO_SCM_BASE="$BASE" pnpm turbo run build --affected --dry=json)
  affected=$(jq -r '[.tasks[] | select(.command != "<NONEXISTENT>") | .package] | unique | .[]' <<<"$plan")
else
  echo "no usable base (${BASE:-unset}) — deploying every app"
  affected=$(jq -r 'to_entries | .[] | .key' <<<"$deployable")
fi

# 📌 Measured on BYT-84, because the answer is not the obvious one and the
# whole job rests on it:
#   · a change to a root MANIFEST or the lockfile marks every package affected
#     — a renovate automerge that moves only `package.json` + `pnpm-lock.yaml`
#     listed all eight buildable packages, so a bump does reach production;
#   · a change to a root file carrying no dependencies — `CLAUDE.md`,
#     `.node-version` — marks NOTHING affected, and deploys nothing.
# The second one is the win, not a gap: that is the six deployments a docs
# commit used to spend. A root file that changes what Vercel builds without
# moving a manifest would be missed; redeploy from the Vercel dashboard if it
# ever happens.
apps=$(
  while IFS= read -r pkg; do
    [ -n "$pkg" ] || continue
    jq -r --arg pkg "$pkg" '.[$pkg] // empty' <<<"$deployable"
  done <<<"$affected" | sort -u
)

if [ -z "$apps" ]; then
  echo "nothing affected that Vercel deploys — no hooks fired"
  exit 0
fi

echo "to deploy: $(tr '\n' ' ' <<<"$apps")"

# Resolve every url BEFORE firing any of them, so a missing key fails the whole
# job instead of leaving production half-deployed.
missing=""
while IFS= read -r app; do
  url=$(jq -r --arg app "$app" '.[$app] // empty' <<<"$HOOKS")
  if [ -z "$url" ]; then
    missing="$missing $app"
  else
    echo "::add-mask::$url"
  fi
done <<<"$apps"

if [ -n "$missing" ]; then
  echo "::error::VERCEL_DEPLOY_HOOKS has no url for:$missing"
  exit 1
fi

failed=""
while IFS= read -r app; do
  # Already masked in the pass above, and a mask holds for the whole job.
  url=$(jq -r --arg app "$app" '.[$app]' <<<"$HOOKS")
  # The response is `{"job":{"id":…,"state":"PENDING"}}`. Printing the job id
  # is what makes a run traceable to a deployment; the url never appears.
  #
  # 📌 Bounded, and deliberately not retried. An unbounded POST that stalls on
  # app 2 of 6 never fires 3 through 6 and burns the job's whole timeout, which
  # leaves production genuinely half-deployed with no per-app error to read. A
  # retry is the wrong repair here: a repeated POST is a second CREATED
  # deployment, and the per-day count of those is the thing this job exists to
  # protect.
  if reply=$(curl -fsS --max-time 30 -X POST "$url"); then
    echo "$app → $(jq -r '.job.id // "no job id in the reply"' <<<"$reply")"
  else
    echo "::error::$app — the deploy hook did not accept the request"
    failed="$failed $app"
  fi
done <<<"$apps"

if [ -n "$failed" ]; then
  echo "::error::deploy hooks failed for:$failed"
  exit 1
fi
