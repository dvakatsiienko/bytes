#!/usr/bin/env bash
# What a green `review:clean` means: a review ran on this head, the reviewer
# said itself that the head is clean, and nothing it found is sitting unanswered.
#
# Three failure modes, the first two measured on #70 and #72, the third on #76:
#
# 1. The action can stand down and still leave its step successful — it does
#    that on any PR that edits a workflow already on the default branch. The job
#    went green with no review posted at all, a gate that passes empty.
# 2. A review that posts findings is not a clean review, and a check that goes
#    green anyway says the opposite of what happened.
# 3. Counting unanswered inline threads is not the same as counting findings.
#    #76 landed six findings — one a production break — in the sticky comment
#    and opened no inline thread at all, so the count was zero and the check went
#    green over a review that had just said no. That is why the reviewer now
#    asserts its own verdict and this guard requires it: a round whose comment
#    carries no `verdict:` line is red too, because what it concluded is then
#    unknown, and unknown is not clean.
#
# An ANSWERED thread counts as handled, deliberately. A finding the coder
# declines with a reason is work Dima reads in the PR, not a reason to block
# correct code — without that rule, one disagreement plus the two-round cap is a
# deadlock with no way out.
#
# 📌 This exits 0 on almost every path. The verdict is the check run; the job's
# own conclusion means «the round ran», which is what the rounds count reads. A
# review that found things still ran, so it exits 0 and counts. The exception is
# a stand-down with nothing posted at all — no reviewer was spent, so that one
# exits 1 and does not count.
#
# Env: GH_TOKEN, REPO, PR, OWNER, CHECK, REVIEWER, AUTHOR, RUN, SINCE,
#      GITHUB_OUTPUT
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=.github/scripts/review-api.sh
. "$here/review-api.sh"

# Writing the step output next to the PATCH is what lets the workflow's cleanup
# step know a verdict was delivered without asking the api a second time.
#
# 📌 The patch must not be fatal, for the same reason the cleanup step is not:
# it is a network call, it is the last thing a spent round does, and under
# `set -e` a transient 5xx would end the run red — which un-counts a round that
# was actually spent and buys a free extra one. `delivered` is written only when
# the verdict really landed, so a failure here hands the check to the cleanup
# step, which closes it red. The reviewer caught this one on itself.
publish() {
  if gh api "repos/$REPO/check-runs/$CHECK" -X PATCH \
    -f status=completed -f conclusion="$1" \
    -f output[title]="$2" -f output[summary]="$3" --jq '.conclusion'; then
    echo "delivered=yes" >> "$GITHUB_OUTPUT"
  else
    echo "::warning::could not write the verdict — the cleanup step closes the check instead"
  fi
}

# A stand-down counts zero artifacts by construction rather than luck.
# `track_progress: true` on a `pull_request` event forces tag mode, and tag mode
# writes the comment only after the trigger check and the human-actor check have
# both passed — a refusal writes nothing, so no body can carry this run's link.
# The retry is for the api settling after a real post, not for a refusal.
for attempt in 1 2 3; do
  if ! threads=$(apiStrict "pulls/$PR/comments"); then
    publish failure 'could not read the review threads' \
      'The api call that lists the review comments failed, so whether any finding is unanswered is unknown. An unknown state is not a clean review. Re-apply the label to try again.'
    echo "::warning::could not read the threads — review:clean is red"
    exit 0
  fi

  arts=$(artifacts "$PR")

  decision=$(jq -n --argjson artifacts "$arts" --argjson threads "$threads" \
      '{artifacts: $artifacts, threads: $threads}' \
    | jq --arg mode round --arg who "$REVIEWER" --arg author "$AUTHOR" \
         --arg owner "$OWNER" --arg since "$SINCE" --arg run "$RUN" \
         -f "$here/../review-gate.jq")

  if [ "$(jq -r '.posted' <<<"$decision")" -gt 0 ]; then break; fi
  if [ "$attempt" -lt 3 ]; then
    echo "no review artifact yet (attempt $attempt), waiting for the api to settle"
    sleep 10
  fi
done

jq -r '"posted=\(.posted)  verdict=\(.verdict // "absent")  unanswered=\(.open)"' <<<"$decision"

conclusion=$(jq -r '.conclusion' <<<"$decision")
title=$(jq -r '.title' <<<"$decision")
publish "$conclusion" "$title" "$(jq -r '.summary' <<<"$decision")"

if [ "$conclusion" != "success" ]; then
  echo "::warning::$title — review:clean is red"
fi

# The ONE path that ends the job red on purpose. A stand-down spent no reviewer,
# so it must not eat a round: on a PR that edits a workflow already on the
# default branch the action refuses itself every time, and two labels would
# otherwise burn the whole cap on zero reviews. CodeRabbit caught this.
if [ "$(jq -r '.standdown' <<<"$decision")" = "true" ]; then
  echo "::error::no review artifact posted — review:clean is red"
  exit 1
fi
