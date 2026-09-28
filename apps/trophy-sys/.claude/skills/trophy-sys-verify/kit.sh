#!/usr/bin/env bash
# kit.sh <verb> — the trophy-sys verify steps every verifier used to type by hand.
#   health <port>                 the api's store must be `file`; exit 1 on anything else
#   backup | restore              the tree's .trophy-*.json state, to and from $TMPDIR
#   fake dead-npsso [grant-days]  a dead fake npsso beside a grant with N days left (default 9)
#   login <port>                  signs the browser session in through POST /api/admin/login
#   essentials <port> <route…>    essentials + tab walk at 1280 and 390, one line per route
# Run from anywhere inside a worktree. Every write refuses the main checkout: its
# .trophy-*.json files are the owner's real state.
set -euo pipefail

app=$(git rev-parse --show-toplevel)/apps/trophy-sys
tree=$(git rev-parse --show-toplevel)
backup="${TMPDIR:-/tmp}/trophy-sys-verify-$(printf '%s' "${tree}" | shasum | cut -c1-8)"
essentials="${HOME}/frame/home/.claude/plugin-x/skills/browser-headless/essentials"
export AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION:-verify-trophy-sys}"

in_tree() {
  [ -f "${tree}/.worktree-offset" ] && return
  echo "kit: ${tree} is the main checkout — its state is the owner's, write nothing" >&2
  exit 1
}

case "${1:-}" in
  health)
    answer=$(curl -s "localhost:${2:?port}/api/health")
    echo "${answer}"
    [[ "${answer}" == *'"stateBackend":"file"'* ]] || { echo "kit: not the file store — stop and report" >&2; exit 1; }
    ;;
  backup)
    in_tree
    mkdir -p "${backup}"
    cp "${app}"/.trophy-*.json "${backup}/"
    echo "backed up $(ls -A "${backup}" | wc -l | tr -d ' ') files to ${backup}"
    ;;
  restore)
    in_tree
    cp "${backup}"/.trophy-*.json "${app}/"
    echo "restored from ${backup}"
    ;;
  fake)
    in_tree
    [ "${2:-}" = dead-npsso ] || { echo "kit: fake dead-npsso [grant-days]" >&2; exit 2; }
    days=${3:-9}
    now=$(($(date +%s) * 1000))
    saved=$((now - 20 * 86400000))
    token=$(printf 'F%.0s' $(seq 1 64))
    cd "${app}"
    jq -n --arg t "${token}" --argjson s "${saved}" '{savedAt: $s, token: $t}' > .trophy-npsso.json
    jq --arg t "${token}" --argjson d "${now}" --argjson s "${saved}" \
      '[.[] | select(.token != $t)] + [{diedAt: $d, savedAt: $s, token: $t}]' \
      .trophy-npsso-deaths.json > .kit.tmp && mv .kit.tmp .trophy-npsso-deaths.json
    # The tree's real grant token stays, so a psn refresh still succeeds and the
    # old grant keeps the app up — the state this recipe exists to show.
    grant=$(jq -r '.token // empty' .trophy-psn-grant.json 2>/dev/null || true)
    jq -n --arg t "${grant:-grant-${token}}" --argjson r "${now}" --argjson e $((days * 86400)) \
      '{expiresIn: $e, mintedAt: ($r - (10 * 86400000) + ($e * 1000)), mintedExpiresIn: 863999, refreshedAt: $r, token: $t}' \
      > .trophy-psn-grant.json
    echo "faked: npsso dead, grant ${days} days left — read it at /api/admin/token before any psn call"
    ;;
  login)
    creds=$(cd "${app}" && jq -n --arg e "$(sed -n 's/^ADMIN_EMAIL=//p' .env | tr -d '"')" \
      --arg p "$(sed -n 's/^ADMIN_PASSWORD=//p' .env | tr -d '"')" '{email: $e, password: $p}')
    agent-browser open "http://localhost:${2:?port}/console" >/dev/null
    agent-browser eval "(async () => (await fetch('/api/admin/login', { body: JSON.stringify(${creds}), credentials: 'same-origin', headers: { 'content-type': 'application/json' }, method: 'POST' })).status)()" \
      | grep -q 200 && echo "signed in" || { echo "kit: login refused" >&2; exit 1; }
    ;;
  essentials)
    port=${2:?port}
    shift 2
    for route in "$@"; do
      for width in 1280 390; do
        agent-browser set viewport "${width}" 800 >/dev/null
        agent-browser open "http://localhost:${port}${route}" >/dev/null
        agent-browser wait 4000 >/dev/null
        fails=$(agent-browser eval "$(cat "${essentials}/essentials.js")" | jq -rc 'fromjson? // . | .fail | to_entries | map(if .key == "axe" then (.value | map(sub("^[a-z]+ "; "")) | join(", ")) else "\(.key) ×\(.value | length)" end) | join(", ")')
        flags=$(bash "${essentials}/tab-walk.sh" | jq '.flags | length')
        echo "${route} @${width}: fail [${fails}] · tab-walk flags ${flags}"
      done
    done
    ;;
  *)
    sed -n '2,9p' "$0"
    exit 2
    ;;
esac
