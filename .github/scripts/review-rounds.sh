#!/usr/bin/env bash
# The review rounds already spent on this branch, read from the workflow run
# list rather than from the sticky comment: a run records its own head sha and
# its own start time, and the action overwrites that comment seconds later on
# every round.
#
# Both jobs in review.yml read this, which is why it is a file. The guard needs
# the count to enforce the cap and the last head to tell the reviewer what to
# re-read; the answer check needs the same count to know the cap is spent, plus
# when the last round started and which run wrote its comment.
#
# 📌 Rounds are counted per BRANCH, not per PR. A reused branch name would carry
# its old rounds into the next PR — left as is on purpose: branches here are one
# per assignment and deleted on merge, the repo takes no fork PRs, and the
# failure is on the safe side, capping the new PR early rather than reviewing
# more than it should. Narrowing by PR number would mean trusting
# `pull_requests[]` on a run, and an empty one there would UNDER-count, which
# fails open.
#
# A round is a run that REACHED the reviewer, whatever the reviewer then found.
# That is why the verdict lives in the `review:clean` check run and never in the
# job's own conclusion: a job that ends green means «this round ran». A run that
# died on the cap, or one whose action refused itself, ends red and is not
# counted — correct, it spent nothing.
#
# Env: GH_TOKEN, REPO, BRANCH, GITHUB_OUTPUT
set -euo pipefail

runs=$(gh api \
  "repos/$REPO/actions/workflows/review.yml/runs?branch=$BRANCH&status=completed&per_page=100" \
  --jq '[.workflow_runs[] | select(.conclusion == "success")] | sort_by(.run_number)' \
  2>/dev/null || echo '[]')

{
  echo "count=$(jq 'length' <<<"$runs")"
  echo "last=$(jq -r 'last | .head_sha // ""' <<<"$runs")"
  echo "at=$(jq -r 'last | .created_at // ""' <<<"$runs")"
  echo "url=$(jq -r 'last | .html_url // ""' <<<"$runs")"
} >> "$GITHUB_OUTPUT"

echo "$(jq 'length' <<<"$runs") completed review rounds on $BRANCH; last reviewed $(jq -r 'last | .head_sha // "none"' <<<"$runs")"
