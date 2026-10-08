#!/usr/bin/env bash
# Prints the app dirs a PR affects, one per line: turbo's affected graph
# against the PR's base, the same answer deploy-main.sh asks for, so a kit
# change previews every app that uses kit.
#
# 🚨 It runs in a step with NO secret. turbo reads the PR's own manifests and
# could delegate to a binary the PR commits under node_modules, so this step is
# where PR-controlled code could run — and there is nothing here to steal.
#
# Env: SRC (the PR checkout, full history), BASE (the PR's base sha)
set -euo pipefail

[ -n "${SRC:-}" ] && [ -d "$SRC" ] && [ -n "${BASE:-}" ] \
  || { echo "usage: SRC=<pr tree> BASE=<base sha> preview-apps.sh" >&2; exit 2; }

cd "$SRC"

# package name → app dir, for every app Vercel hosts in this tree.
apps=$(for f in apps/*/vercel.json; do
  dir=$(dirname "$f")
  jq -n --arg app "$(basename "$dir")" --arg pkg "$(jq -r '.name' "$dir/package.json")" '{key: $pkg, value: $app}'
done | jq -sc 'from_entries')

plan=$(TURBO_SCM_BASE="$BASE" turbo run build --affected --dry=json)
jq -r --argjson apps "$apps" \
  '[.tasks[] | select(.command != "<NONEXISTENT>") | $apps[.package] // empty] | unique | .[]' <<<"$plan"
