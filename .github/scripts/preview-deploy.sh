#!/usr/bin/env bash
# Deploys a Vercel PREVIEW of each app named on stdin (one dir per line) and
# prints one `<app> <url>` line per app. Vercel builds and hosts; this only
# uploads the PR's tree. Previews are off by default since BYT-84 and come back
# on demand, by label, because each one counts on the hobby plan's daily cap.
#
# 🚨 This step holds VERCEL_TOKEN, which can deploy production too. The only
# program it runs is the `vercel` CLI, installed from main's checkout before
# the PR tree was touched; `vercel deploy` reads the PR's files and uploads
# them, it builds nothing here. The app names on stdin come from the api
# (`preview-apps.sh`) and are used only after matching a key in the map.
#
# Env: VERCEL_TOKEN, SRC (the PR checkout)
set -euo pipefail

map="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/vercel-projects.json"
[ -n "${SRC:-}" ] && [ -d "$SRC" ] || { echo "usage: SRC=<pr tree> preview-deploy.sh < apps" >&2; exit 2; }
cd "$SRC"

org=$(jq -r '.org' "$map")
failed=0
while read -r app; do
  [ -n "$app" ] || continue
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
    vercel deploy --yes 2>"${RUNNER_TEMP:-/tmp}/vercel-$app.log") || true
  url=$(jq -r 'select(.status == "ok") | .deployment.url // empty' <<<"$out" 2>/dev/null || true)
  if [ -n "$url" ]; then
    echo "$app $url"
  else
    echo "::error::$app preview failed: $(tail -3 "${RUNNER_TEMP:-/tmp}/vercel-$app.log" | tr '\n' ' ')" >&2
    failed=1
  fi
done
exit "$failed"
