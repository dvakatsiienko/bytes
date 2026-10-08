#!/usr/bin/env bash
# Deploys a Vercel PREVIEW of every app a PR affects and prints one
# `<app> <url>` line per app on stdout. Vercel builds and hosts; this only
# uploads. Previews are off by default since BYT-84 and come back on demand,
# by label, because each one counts against the hobby plan's daily cap.
#
# 🚨 It runs from main's copy (`preview.yml` is `pull_request_target`), and the
# PR's tree sits in $SRC as DATA. Nothing from $SRC executes on the runner:
# turbo answers `--dry` from the manifests, and `vercel deploy` uploads the tree
# for Vercel to build. That is what keeps VERCEL_TOKEN, which can also deploy
# production, out of reach of a PR that rewrites this file. The turbo version
# is read from main's manifest for the same reason.
#
# The app list is turbo's affected graph against the PR's base, the same answer
# deploy-main.sh asks for, so a kit change previews every app that uses kit.
#
# Env: VERCEL_TOKEN, SRC (the PR checkout, full history), BASE (the PR's base
# sha), VERCEL_CLI (exact version)
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
map="$here/vercel-projects.json"
turbo_v=$(jq -r '.devDependencies.turbo // empty' "$here/../package.json")
[ -n "$turbo_v" ] || { echo "::error::main's package.json pins no turbo" >&2; exit 1; }
[ -n "${SRC:-}" ] && [ -d "$SRC" ] && [ -n "${BASE:-}" ] && [ -n "${VERCEL_CLI:-}" ] \
  || { echo "usage: SRC=<pr tree> BASE=<base sha> VERCEL_CLI=<version> preview.sh" >&2; exit 2; }

cd "$SRC"

# package name → app dir, for every app Vercel hosts in this tree.
apps=$(for f in apps/*/vercel.json; do
  dir=$(dirname "$f")
  jq -n --arg app "$(basename "$dir")" --arg pkg "$(jq -r '.name' "$dir/package.json")" '{key: $pkg, value: $app}'
done | jq -sc 'from_entries')

plan=$(TURBO_SCM_BASE="$BASE" npx --yes "turbo@$turbo_v" run build --affected --dry=json)
affected=$(jq -r --argjson apps "$apps" \
  '[.tasks[] | select(.command != "<NONEXISTENT>") | $apps[.package] // empty] | unique | .[]' <<<"$plan")

if [ -z "$affected" ]; then
  echo "no app affected" >&2
  exit 0
fi

org=$(jq -r '.org' "$map")
failed=0
for app in $affected; do
  project=$(jq -r --arg a "$app" '.projects[$a] // empty' "$map")
  if [ -z "$project" ]; then
    echo "::error::$app has a vercel.json but no project id in .github/vercel-projects.json" >&2
    failed=1
    continue
  fi
  # From the repo root: each project's Root Directory is `apps/<app>`, and a
  # deploy from inside the app dir dies on «Root Directory does not exist».
  #
  # 📌 With no terminal the CLI prints a JSON object on stdout, not the bare url
  # its docs show (measured with 60.1.3): `.deployment.url`, `.status`.
  out=$(VERCEL_ORG_ID="$org" VERCEL_PROJECT_ID="$project" \
    npx --yes "vercel@$VERCEL_CLI" deploy --yes 2>"$RUNNER_TEMP/vercel-$app.log") || true
  url=$(jq -r 'select(.status == "ok") | .deployment.url // empty' <<<"$out" 2>/dev/null || true)
  if [ -n "$url" ]; then
    echo "$app $url"
  else
    echo "::error::$app preview failed: $(tail -3 "$RUNNER_TEMP/vercel-$app.log" | tr '\n' ' ')" >&2
    failed=1
  fi
done
exit "$failed"
