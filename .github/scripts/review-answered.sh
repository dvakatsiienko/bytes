#!/usr/bin/env bash
# The post-cap answer check. Publishes a green `review:clean` on the new head
# when the last review round's findings have all been answered, without running
# a reviewer — or publishes nothing at all.
#
# Never a red. Every ordinary mid-work push reaches this, and a head with no
# check is already blocked, which is the safe default; painting those red would
# make a working PR look broken and teach everyone to ignore the colour. That is
# also why a failed read exits 0: no evidence means no green, and no green means
# the merge stays blocked.
#
# Env: GH_TOKEN, REPO, PR, OWNER, SHA, REVIEWER, AUTHOR, LAST, SINCE, RUN
set -euo pipefail

api() { gh api "repos/$REPO/$1" --paginate | jq -s 'add // []'; }

threads=$(api "pulls/$PR/comments") || { echo "could not read the review threads; nothing published"; exit 0; }
comments=$(api "issues/$PR/comments") || { echo "could not read the comments; nothing published"; exit 0; }

# The commits this push added on top of what the last round actually read. It is
# the checkable half of «the delta is the coder's fixes»: whether a commit fixes
# a finding or adds unreviewed work is not machine-decidable, but whose commit it
# is, is — and the sha range goes into the check's summary so Dima can read the
# other half himself.
delta=$(gh api "repos/$REPO/compare/$LAST...$SHA" \
  --jq '[.commits[] | {author: {login: (.author.login // "")}, sha: .sha}]') \
  || { echo "could not read the delta; nothing published"; exit 0; }

decision=$(jq -n --argjson artifacts "$comments" --argjson threads "$threads" --argjson commits "$delta" \
    '{artifacts: $artifacts, threads: $threads, commits: $commits}' \
  | jq --arg mode answered --arg who "$REVIEWER" --arg author "$AUTHOR" \
       --arg owner "$OWNER" --arg since "$SINCE" --arg run "$RUN" \
       -f .github/review-gate.jq)

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
