#!/usr/bin/env bash
# The post-cap answer check. Publishes a green `review:clean` on the new head
# when the last review round's findings have all been answered, without running
# a reviewer — or publishes nothing at all.
#
# Never a red on a judgement. Every ordinary mid-work push reaches this, and a
# head with no check is already blocked, which is the safe default; painting
# those red would make a working PR look broken and teach everyone to ignore the
# colour. A read that fails is the one exception: no evidence means no green,
# and it says so by failing rather than by quietly declining.
#
# Env: GH_TOKEN, REPO, PR, OWNER, SHA, REVIEWER, APP, AUTHOR, LAST, SINCE
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=.github/scripts/review-api.sh
. "$here/review-api.sh"

threads=$(apiStrict "pulls/$PR/comments")

# All three endpoints, the same fold the round guard uses. A verdict written
# into a submitted review's body rather than the sticky comment is invisible to
# anything that folds only issue comments, and this check turns on that verdict.
arts=$(artifacts "$PR")

# The commits this push added on top of what the last round actually read. It is
# the checkable half of «the delta is the coder's fixes»: whether a commit fixes
# a finding or adds unreviewed work is not machine-decidable, but whose commit it
# is, is — and the sha range goes into the check's summary so Dima can read the
# other half himself.
#
# 📌 It tolerates its own failure rather than ending the lane red: a force-push
# away from the last reviewed head makes this 404, and «green or nothing» is
# this lane's contract. It is also unpaginated, so a delta past 250 commits
# would be truncated — the truncation can only ADD unseen commits, never remove
# an outsider's, so it fails toward publishing nothing.
delta=$(gh api "repos/$REPO/compare/$LAST...$SHA" \
  --jq '[.commits[] | {author: {login: (.author.login // "")}, sha: .sha}]') \
  || { echo "nothing published: the delta $LAST...$SHA could not be read"; exit 0; }

# Whether each commit in that window already carries a green. The decision is
# the jq's — this only fetches the fact, one call per commit, on a window that
# is a handful of commits by the time anyone is past the cap. A read that fails
# reports `granted: true`, so an unknown answer refuses rather than grants.
delta=$(jq -c '.[]' <<<"$delta" | while read -r c; do
  sha=$(jq -r '.sha' <<<"$c")
  n=$(gh api "repos/$REPO/commits/$sha/check-runs?check_name=review:clean" \
        --jq '[.check_runs[] | select(.conclusion == "success")] | length' 2>/dev/null) || n=1
  jq -c --argjson n "$n" '. + {granted: ($n > 0)}' <<<"$c"
done | jq -s '.')

decision=$(jq -n --argjson artifacts "$arts" --argjson threads "$threads" --argjson commits "$delta" \
    '{artifacts: $artifacts, threads: $threads, commits: $commits}' \
  | jq --arg mode answered --arg who "$REVIEWER" --arg app "$APP" --arg author "$AUTHOR" \
       --arg owner "$OWNER" --arg since "$SINCE" \
       -f "$here/../review-gate.jq")

conclusion=$(jq -r '.conclusion' <<<"$decision")
title=$(jq -r '.title' <<<"$decision")

if [ "$conclusion" != "success" ]; then
  echo "nothing published: $title"
  exit 0
fi

summary="$(jq -r '.summary' <<<"$decision")"$'\n\n'"The delta judged: \`$LAST\` → \`$SHA\`."

gh api "repos/$REPO/check-runs" -X POST \
  -f name='review:clean' \
  -f head_sha="$SHA" \
  -f status=completed \
  -f conclusion=success \
  -f output[title]="$title" \
  -f output[summary]="$summary" \
  --jq '.conclusion'
