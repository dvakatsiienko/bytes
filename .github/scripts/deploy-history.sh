#!/usr/bin/env bash
# Prints the newest 100 commits of <rev>'s history as a json array, each with its
# latest status per context. One graphql call, where the rest api takes one a commit.
# The time bound keeps a hung call inside deploy-read.sh's deadline.
#
# Env: GH_TOKEN (needs `statuses: read`), REPO
set -euo pipefail

timeout 60 gh api graphql -f owner="${REPO%/*}" -f name="${REPO#*/}" -f rev="$1" -f query='
  query($owner: String!, $name: String!, $rev: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: $rev) {
        ... on Commit {
          history(first: 100) {
            nodes { oid status { contexts { context state description createdAt targetUrl } } }
          }
        }
      }
    }
  }' | jq -ce '.data.repository.object.history.nodes | arrays'
