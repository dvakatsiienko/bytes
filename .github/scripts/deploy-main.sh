#!/usr/bin/env bash
# Triggers a Vercel deploy hook for each app that needs one.
#
# Vercel's git integration is off (every `vercel.json` carries
# `git.deploymentEnabled: false`), so nothing deploys itself any more. This is
# the only thing that deploys production.
#
# Two ways in:
#   · a push to `main` — the app list comes from turbo's own task graph rather
#     than a path pattern, for the reason ci.yml's chromium step spells out: a
#     path list cannot know that a new package started depending on `kit`, and
#     turbo does.
#   · a manual run — the app list is whatever was picked in the UI. This is the
#     replacement for the Vercel dashboard's Redeploy button, which is the only
#     other way to deploy now that the git integration is off.
#
# Env: BASE (the sha to diff against, push only), REQUESTED (the chosen app or
# `all`, manual only), HOOKS (the VERCEL_DEPLOY_HOOKS secret),
# GITHUB_STEP_SUMMARY. It writes no step output — nothing downstream reads one.
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
all_apps=$(jq -r 'to_entries | map(.value) | sort | .[]' <<<"$deployable")
echo "vercel apps: $(tr '\n' ' ' <<<"$all_apps")"

if [ -n "${REQUESTED:-}" ]; then
  # A manual run. The workflow's dropdown has to spell the app names out —
  # GitHub will not accept a computed `choice` list — so the literal list there
  # is a convenience and THIS is the authority. A seventh app, or a renamed
  # one, fails here loudly instead of quietly deploying nothing.
  if [ "$REQUESTED" = "all" ]; then
    apps=$all_apps
    echo "manual run: every app"
  elif grep -qx "$REQUESTED" <<<"$all_apps"; then
    apps=$REQUESTED
    echo "manual run: $REQUESTED"
  else
    echo "::error::'$REQUESTED' is not one of this repo's Vercel apps — the workflow's dropdown has drifted from apps/*/vercel.json"
    exit 1
  fi
else
  # A push. A base that git cannot resolve — the all-zero sha of a first push, a
  # force-push past the ref, a truncated clone — is not a reason to deploy
  # nothing; it is a reason to deploy everything, because the cost of one extra
  # build is nothing against a production that silently never updates.
  if [ -n "${BASE:-}" ] && git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
    echo "diffed against $BASE"

    # 📌 No workspace install. Measured on BYT-84: turbo answers
    # `--affected --dry=json` from the manifests and the lockfile alone, and
    # returns the IDENTICAL package list it returns after a full install — the
    # graph is all it needs. That removes `pnpm/action-setup` (4-6 s), the pnpm
    # cache restore, and `pnpm install` (12-14 s) from the only job standing
    # between a merge and production.
    #
    # The version is read from the manifest rather than written here, so it
    # cannot drift from the turbo the rest of the repo runs.
    turbo_v=$(jq -r '.devDependencies.turbo // empty' package.json)
    if [ -z "$turbo_v" ]; then
      echo "::error::the root package.json no longer pins turbo in devDependencies"
      exit 1
    fi
    # 🚨 An EXACT version, or nothing. `.npmrc` sets `save-exact = true`, so this
    # field reads `2.10.12` today — but if a range ever lands in it, `npx` picks
    # the newest match and an untested turbo decides what production deploys.
    # A reviewer spotted that the empty-check alone was one arm short.
    case "$turbo_v" in
      [0-9]*.[0-9]*.[0-9]*) : ;;
      *)
        echo "::error::turbo is pinned as '$turbo_v', not an exact version — npx would resolve a turbo this repo never tested, and that turbo decides what deploys"
        exit 1 ;;
    esac
    # 🚨 `TURBO_SCM_BASE` is not optional. Without it turbo cannot resolve a
    # base ref, falls back to «assuming all files have changed», and every push
    # deploys all six apps — the affected list silently stops meaning anything.
    # It is the same trap ci.yml's own env block is written about, and dropping
    # this prefix while rewriting the call is exactly how it comes back.
    plan=$(TURBO_SCM_BASE="$BASE" npx --yes "turbo@$turbo_v" run build --affected --dry=json)
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
  # commit used to spend.
  #
  # 🚨 The class of root file that changes a BUILD without moving a manifest is
  # not hypothetical, and it had two named members in this repo: `.npmrc` and
  # `pnpm-workspace.yaml`. A commit touching only one of them answered «nothing
  # affected» and exited 0 green — so the very commit repairing a broken Vercel
  # install would have deployed nothing, in a line that reads like the saving
  # this job is proud of. Both are now `globalDependencies` in `turbo.jsonc`,
  # which fixes it through turbo's own mechanism rather than a path list here
  # that would go stale. A reviewer caught it; the measurement is on that key.
  #
  # 📌 `--affected` is package-level, not inputs-level, so the `transit`
  # exclusions do not reach it: editing `apps/cv/CLAUDE.md` still deploys `cv`.
  # Wasteful, never wrong, and not worth a path list to avoid.
  apps=$(
    while IFS= read -r pkg; do
      [ -n "$pkg" ] || continue
      jq -r --arg pkg "$pkg" '.[$pkg] // empty' <<<"$deployable"
    done <<<"$affected" | sort -u
  )
fi

summary() { [ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '%s\n' "$1" >> "$GITHUB_STEP_SUMMARY"; return 0; }

if [ -z "$apps" ]; then
  echo "nothing affected that Vercel deploys — no hooks fired"
  summary "### No deployment"
  summary ""
  summary "This push changed nothing any Vercel app builds from, so no deploy hook was fired."
  exit 0
fi

echo "to deploy:$(printf ' %s' $apps)"

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

summary "### Deployments triggered"
summary ""
summary "| App | Vercel job | State |"
summary "| --- | --- | --- |"

failed=""
while IFS= read -r app; do
  # Already masked in the pass above, and a mask holds for the whole job.
  url=$(jq -r --arg app "$app" '.[$app]' <<<"$HOOKS")
  # 📌 A reply with no job id counts as a FAILURE for this app, never as a
  # success with a blank id printed beside it. A 200 carrying an empty or
  # non-json body proves nothing was queued, and «deployed» is the one thing
  # that must not be reported about it.
  #
  # The check is explicit because `set -e` does not make it for us: a `jq`
  # that fails inside a command substitution leaves the enclosing command's
  # exit status alone, so the loop would sail on printing blanks. Measured,
  # not assumed — a reviewer read this the other way round.
  if reply=$(curl -fsS --max-time 30 -X POST "$url"); then
    if job=$(jq -er '.job.id' <<<"$reply" 2>/dev/null); then
      state=$(jq -r '.job.state // "?"' <<<"$reply")
      echo "$app → $job"
      summary "| \`$app\` | \`$job\` | $state |"
    else
      echo "::error::$app — the hook answered without a job id, so nothing is known to be queued"
      summary "| \`$app\` | — | **no job id in the reply** |"
      failed="$failed $app"
    fi
  else
    echo "::error::$app — the deploy hook did not accept the request"
    summary "| \`$app\` | — | **the hook refused the request** |"
    failed="$failed $app"
  fi
done <<<"$apps"

# 📌 No deployment url in this table, and it is not an oversight. A deploy hook
# answers with a job id and nothing else, and turning one into a deployment url
# needs an authenticated Vercel API call — so it would mean putting a
# `VERCEL_TOKEN` in this repo purely to decorate a summary. The job id is what
# Vercel's own dashboard shows against the deployment it started, which is
# enough to match a row here to a build there.
summary ""
summary "Builds and logs live in the Vercel dashboard; the job id above identifies the deployment each hook started."
# 📌 Re-running a partly failed job re-fires the hooks that already succeeded,
# because there is no per-app record of what got through — up to five redundant
# CREATED deployments against the very budget this job exists to protect. Not
# worth the state needed to make it idempotent, but worth knowing before anyone
# reaches for Re-run: the manual `workflow_dispatch` above deploys ONE app, and
# that is the cheaper repair.
summary ""
summary "> Re-running this job re-fires every hook listed above. To repair a single app, run the **Deploy** workflow manually and choose just that one."

if [ -n "$failed" ]; then
  echo "::error::deploy hooks failed for:$failed"
  exit 1
fi
