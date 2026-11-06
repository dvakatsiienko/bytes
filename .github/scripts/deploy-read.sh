#!/usr/bin/env bash
# Reds the run unless every app the hooks fired for reached Ready. A hook only
# queues a build, so without this read Deploy stayed green over 6 errored
# production deploys on 2026-11-04.
#
# A hook builds the branch tip, not the commit that fired it, so an overlapping
# push's status lands on a later commit. For each app the newest commit from
# main's tip back to $COMMIT holding a status newer than the fire decides.
#
# A run past the deadline is red, unless the app has no status and main has moved
# past $COMMIT: then a later run owns it, and its base still holds the retry.
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

# One tab-separated line per app: its word, then its Vercel url. A cancel on an
# older commit than main's tip reads as no status: the later push replaced it.
verdicts() {
  local app
  for app in $APPS; do
    printf '%s\t' "$app"
    jq -r --arg commit "$COMMIT" --arg since "$FIRED_AT" --arg context "Vercel – $app" '
      .[0].oid as $tip
      | (map(.oid) | index($commit)) as $i
      | (if $i then .[:$i + 1] else . end)
      | [.[] | .oid as $oid | .status.contexts[]?
          | select(.context == $context and .createdAt >= $since) | . + {oid: $oid}][0] as $s
      | if $s == null then "none\t-"
        elif $s.state == "SUCCESS" then "ready\t\($s.targetUrl)"
        elif ($s.state == "FAILURE" or $s.state == "ERROR") then
          if ($s.description | ascii_downcase | contains("cancel")) | not then "error\t\($s.targetUrl)"
          elif $s.oid == $tip then "canceled\t\($s.targetUrl)"
          else "none\t-" end
        else "building\t\($s.targetUrl)" end' <<<"$nodes"
  done
}

tip=""
latest=""
while :; do
  if nodes=$("$here/deploy-history.sh" main); then
    tip=$(jq -r '.[0].oid' <<<"$nodes")
    latest=$(verdicts)
    grep -qE $'\t(none|building)\t' <<<"$latest" || break
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
    canceled) fail "$app — Canceled: its production deploy was canceled $url" ;;
    building) fail "$app — still building at the ${deadline}s deadline $url" ;;
    none)
      if [ "$tip" = "$COMMIT" ]; then
        fail "$app — no record: no Vercel status by the ${deadline}s deadline"
      else
        report "$app — superseded: no status here, and main has moved past this commit"
      fi
      ;;
  esac
done <<<"$latest"
exit "$red"
