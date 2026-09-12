#!/usr/bin/env bash
# Sourced by the two lanes that read a PR's comments. Not a script you run.
#
# 📌 `--paginate` emits ONE ARRAY PER PAGE, so anything reading `.[0]` silently
# sees only the first 30 comments — and a PR with two review rounds passes 30
# easily. `jq -s add` folds the pages into one array.
#
# Two fetchers, because an empty answer means opposite things in the two places
# they are used, and one helper for both is how a gate learns to lie.

# Swallows a failure into `[]`. Only safe where empty means «no proof a review
# happened», which fails CLOSED.
api() {
  gh api "repos/$REPO/$1" --paginate 2>/dev/null | jq -s 'add // []' || echo '[]'
}

# Refuses to invent an answer. Reading the finding threads is the other case:
# there, empty means «nothing unanswered», so a swallowed failure would mark a
# review clean without having read a single comment. Greptile found that.
apiStrict() {
  gh api "repos/$REPO/$1" --paginate | jq -s 'add // []'
}

# Every place a round may have written: the sticky comment, the inline threads,
# and a submitted review's body. The guard folds all three and so must anyone
# else reading a round's verdict — a verdict in a review body is invisible to a
# reader that only folds issue comments.
artifacts() {
  { api "issues/$1/comments"; api "pulls/$1/comments"; api "pulls/$1/reviews"; } | jq -s 'add // []'
}
