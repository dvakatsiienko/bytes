#!/usr/bin/env bash
# Prints `bases=<json>` for $GITHUB_OUTPUT: each Vercel app's last Ready commit on
# the history of $COMMIT, `{"cv":"<sha>"}`. An app it does not name has no known
# base, and deploy-main.sh deploys it.
#
# Each app keeps its own base, so a failed app retries on the next push, and a
# healthy app does not redeploy. A push that deployed nothing, or a red or
# cancelled CI, moves no base, so those apps ride on the next green push.
#
# 📌 It fails OPEN: an api error answers `bases={}`. A red step would deploy
# nothing, and one extra build costs nothing against a stale production.
#
# Env: GH_TOKEN, REPO, COMMIT
set -uo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if ! nodes=$("$here/deploy-history.sh" "$COMMIT"); then
  echo "::warning::could not read the Vercel statuses — deploying every app" >&2
  echo 'bases={}'
  exit 0
fi

# Newest first, so the first success an app meets is its base.
bases=$(jq -c 'reduce (.[] | .oid as $oid | .status.contexts[]?
    | select(.state == "SUCCESS" and (.context | startswith("Vercel – ")))
    | {app: (.context | ltrimstr("Vercel – ")), oid: $oid}) as $ready
  ({}; .[$ready.app] //= $ready.oid)' <<<"$nodes")
echo "bases=$bases"
