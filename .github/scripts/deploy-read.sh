#!/usr/bin/env bash
# Reds the run unless every app the hooks fired for reached Ready. A hook only
# queues a build, so without this read Deploy stayed green over 6 errored
# production deploys on 2026-11-04.
#
# A hook builds the branch tip, not the commit that fired it, so an overlapping
# push's status lands on a later commit. For each app the newest status from
# main's tip back to $COMMIT decides, among builds that began after the fire: a
# build's `pending` row is its start, so an older build finishing now never counts.
#
# A run past the deadline is red, unless a push's app has no status and a later
# Deploy run really ran: then that run owns it, and the base still holds the retry.
#
# A cancel waits for the deadline too: Vercel may cancel one of two overlapping
# builds of a commit while the other reaches Ready.
#
# Env: GH_TOKEN, REPO, COMMIT, APPS (space separated), FIRED_AT,
# DEADLINE_SECONDS (under the job's 15 min), POLL_SECONDS, GITHUB_STEP_SUMMARY
set -uo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
deadline=${DEADLINE_SECONDS:-720}
poll=${POLL_SECONDS:-20}

report() {
  echo "$1"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then printf -- '- %s\n' "$1" >>"$GITHUB_STEP_SUMMARY"; fi
}

if [ -z "${APPS:-}" ]; then
  echo "nothing deployed — no vercel read"
  exit 0
fi

# Every status row from main's tip back to $COMMIT, newest commit first.
read_rows() {
  local nodes oid
  nodes=$("$here/deploy-history.sh" main) || return 1
  later=$(jq -c --arg commit "$COMMIT" 'map(.oid) | .[:index($commit)]' <<<"$nodes")
  rows=$(
    for oid in $(jq -r --arg commit "$COMMIT" \
      'map(.oid) | (index($commit)) as $i | if $i then .[:$i + 1][] else $commit end' <<<"$nodes"); do
      timeout 60 gh api "repos/$REPO/commits/$oid/statuses?per_page=100" || exit 1
    done | jq -cs 'add // []'
  )
}

# A red CI's Deploy run exists too, skipped, and it retries nothing.
later_deploy_ran() {
  timeout 60 gh api "repos/$REPO/actions/workflows/deploy.yml/runs?per_page=30" |
    jq -e --argjson later "$later" 'any(.workflow_runs[];
      (.display_title | ltrimstr("deploy ")) as $sha
      | .conclusion != "skipped" and .conclusion != "cancelled" and any($later[]; . == $sha))' >/dev/null
}

# One tab-separated line per app: its name, its word, its Vercel url.
verdicts() {
  local app line
  for app in $APPS; do
    line=$(jq -r --arg since "$FIRED_AT" --arg context "Vercel – $app" '
      map(select(.context == $context and .created_at >= $since)) as $rows
      | ($rows | map(select(.state == "pending") | .target_url)) as $own
      | ($rows | map(select(.target_url as $url | any($own[]; . == $url))))[0] as $s
      | if $s == null then "none\t-"
        elif $s.state == "success" then "ready\t\($s.target_url)"
        elif ($s.state == "failure" or $s.state == "error") then
          if ($s.description // "" | ascii_downcase | contains("cancel"))
          then "canceled\t\($s.target_url)" else "error\t\($s.target_url)" end
        else "building\t\($s.target_url)" end' <<<"$rows") || line=$'unreadable\t-'
    printf '%s\t%s\n' "$app" "$line"
  done
}

later="[]"
rows=""
latest=""
while :; do
  if read_rows; then
    latest=$(verdicts)
    grep -qE $'\t(none|building|canceled)\t' <<<"$latest" || break
  else
    echo "::warning::could not read the Vercel statuses, trying again"
  fi
  [ "$SECONDS" -lt "$deadline" ] || break
  sleep "$poll"
done

if [ -z "$latest" ]; then
  echo "::error::could not read the Vercel statuses for $APPS by the deadline"
  exit 1
fi

red=0
fail() {
  echo "::error::$1"
  report "$1"
  red=1
}
while IFS=$'\t' read -r app word url; do
  case "$word" in
    ready) report "$app — Ready $url" ;;
    error) fail "$app — Error: its production deploy failed $url" ;;
    canceled) fail "$app — Canceled: its production deploy was canceled, and nothing replaced it by the ${deadline}s deadline $url" ;;
    building) fail "$app — still building at the ${deadline}s deadline $url" ;;
    none)
      if [ "${GITHUB_EVENT_NAME:-}" != workflow_dispatch ] && later_deploy_ran; then
        report "$app — superseded: no status here, and a later Deploy run owns it"
      else
        fail "$app — no record: no Vercel status by the ${deadline}s deadline"
      fi
      ;;
    *) fail "$app — unreadable: its Vercel status could not be read" ;;
  esac
done <<<"$latest"
exit "$red"
