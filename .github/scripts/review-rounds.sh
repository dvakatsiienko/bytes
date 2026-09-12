#!/usr/bin/env bash
# The review rounds already spent on this branch, read from the workflow run
# list rather than from the sticky comment: a run records its own head sha and
# its own start time, and the action overwrites that comment seconds later on
# every round.
#
# 🚨 The invariant this rests on: `review.yml` holds ONE job on ONE trigger, so
# «a successful run of review.yml» and «a round that reached the reviewer» are
# the same sentence. A workflow run concludes `success` when ANY job in it
# succeeds, so a second job on a second trigger in that file makes every one of
# its events a completed round. That is not hypothetical — the post-cap answer
# check was written into `review.yml` first, and two ordinary pushes would then
# have eaten the whole cap while spending zero reviews. It lives in
# `review-answer.yml` for that reason. An unrelated label still concludes
# `skipped`, not `success`, which is what keeps the count honest today.
#
# 📌 Rounds are counted per BRANCH, not per PR. A reused branch name would carry
# its old rounds into the next PR — left as is on purpose: branches here are one
# per assignment and deleted on merge, the repo takes no fork PRs, and the
# failure is on the safe side, capping the new PR early rather than reviewing
# more than it should. Narrowing by PR number would mean trusting
# `pull_requests[]` on a run, and an empty one there would UNDER-count, which
# fails open.
#
# A run that died on the cap, or one whose action refused itself, ends red and
# is not counted — correct, it spent nothing.
#
# Env: GH_TOKEN, REPO, BRANCH, GITHUB_OUTPUT
set -euo pipefail

# No `|| echo '[]'` here, and that is the same argument as the paragraph above:
# a swallowed api failure reports zero rounds, which leaves the cap unenforced
# and says nothing about it. Failing loudly spends no review and publishes no
# check, so the PR stays blocked — the safe side.
runs=$(gh api \
  "repos/$REPO/actions/workflows/review.yml/runs?branch=$BRANCH&status=completed&per_page=100" \
  --jq '[.workflow_runs[] | select(.conclusion == "success")] | sort_by(.run_number)')

count=$(jq 'length' <<<"$runs")

{
  echo "count=$count"
  echo "last=$(jq -r 'last | .head_sha // ""' <<<"$runs")"
  echo "at=$(jq -r 'last | .created_at // ""' <<<"$runs")"
} >> "$GITHUB_OUTPUT"

echo "$count completed review rounds on $BRANCH; last reviewed $(jq -r 'last | .head_sha // "none"' <<<"$runs")"
