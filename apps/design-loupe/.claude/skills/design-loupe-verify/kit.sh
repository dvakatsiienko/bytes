#!/usr/bin/env bash
# kit.sh <verb> — design-loupe's verify steps, one line per ftr check.
#   start [port]        a private copy of fixtures/speak and a server on it (default 5291);
#                       prints `job=<dir> port=<port> pid=<pid>` — keep them for walk and stop
#   walk <port> <job>   drives every FTR.md line on that server and job: `✅ <line>` or `🐞 <line> — why`;
#                       exit 1 on any 🐞
#   essentials <port> [#hash…]    x:browser-headless essentials at 1280 and 390, with the app's allows
#   probe <port> <name> [#hash]   opens the page at the hash, prints probes/<name>.js, shoots it
#   stop <pid> <job>    stops that server and trashes the copy
# Run from anywhere inside a checkout. Nothing here writes the studio job or fixtures/speak itself.
set -uo pipefail

app=$(git rev-parse --show-toplevel)/apps/design-loupe
kit=$(cd "$(dirname "$0")" && pwd)
export AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION:-verify-design-loupe}"
fails=0

pass() { echo "✅ $1"; }
fail() { echo "🐞 $1 — $2"; fails=$((fails + 1)); }
js() { agent-browser eval "$(cat "${kit}/probes/$1.js")" | tr -d '\\' | sed -e 's/^"//' -e 's/"$//'; }
key() { agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: '$1' })); return 1; })()" >/dev/null; }
go() { agent-browser eval "(() => { location.hash = '$1'; return 1; })()" >/dev/null; sleep 1; }
api() { curl -s "localhost:${port}/api/job" | jq -r "$1"; }
title() { agent-browser get title; }

case "${1:-}" in
  start)
    port=${2:-5291}
    if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null; then echo "kit: port ${port} is taken" >&2; exit 2; fi
    [ -f "${app}/.runtime/dc-runtime.js" ] || { echo "kit: no .runtime/dc-runtime.js — AGENTS.md: the runtime" >&2; exit 2; }
    [ -d "${app}/fixtures/speak/boards" ] || (cd "${app}" && node scripts/loupe-fixture.ts >/dev/null)
    job=$(mktemp -d)/speak
    rsync -a --exclude answers.json "${app}/fixtures/speak/" "${job}/"
    cd "${app}" || exit 2
    LOUPE_JOB="${job}" PORT="${port}" timeout 3600 node_modules/.bin/vite > "${job}/../dev.log" 2>&1 &
    pid=$!
    for _ in $(seq 1 60); do curl -sf "localhost:${port}/api/job" >/dev/null && break; sleep 0.25; done
    curl -sf "localhost:${port}/api/job" >/dev/null || { echo "kit: the server did not answer — ${job}/../dev.log" >&2; exit 1; }
    echo "job=${job} port=${port} pid=${pid}"
    ;;

  walk)
    port=${2:?port}
    job=${3:?job}
    url="http://localhost:${port}"
    agent-browser close >/dev/null 2>&1
    agent-browser set viewport 1440 900 >/dev/null

    # 🧭 the open count — before anything is answered
    agent-browser open "${url}/#ask-2" >/dev/null
    agent-browser wait '[data-ring="ask-2"]' >/dev/null
    sleep 1.5
    [ "$(title)" = '(3) speak · loupe' ] && [ "$(js favicon)" = 3 ] \
      && pass 'the open count: 3 open → (3) speak · loupe, favicon 3' \
      || fail 'the open count' "title «$(title)», favicon «$(js favicon)»"

    # 🧭 one push per round — first, while every ask is open
    first=$(cd "${app}" && PORT="${port}" node scripts/loupe.ts round "${job}" 2>&1)
    second=$(cd "${app}" && PORT="${port}" node scripts/loupe.ts round "${job}" 2>&1)
    code=$?
    [ "$(printf '%s\n' "${first}" | wc -l | tr -d ' ')" = 1 ] && [[ "${first}" == *'3 asks'* ]] && [ "${code}" = 1 ] \
      && pass "one push per round: «${first}», a second call refused" \
      || fail 'one push per round' "first «${first}», second «${second}» (exit ${code})"

    # 🧭 a deep link opens an ask at its pin — at the framed zoom, then 0.37 and 2.0
    ring=$(js ring)
    for target in 0.37 2.0; do
      node "${kit}/probes/pinch.mjs" "$(agent-browser get cdp-url)" "${port}" "${target}" >/dev/null
      sleep 0.6
      ring="${ring} | $(js ring)"
    done
    worst=$(printf '%s' "${ring}" | grep -oE 'delta=[0-9.]+' | cut -d= -f2 | sort -n | tail -1)
    scales=$(printf '%s' "${ring}" | grep -oE 'scale=[0-9.]+' | cut -d= -f2 | tr '\n' ' ')
    awk "BEGIN{exit !(${worst:-99} <= 2)}" \
      && pass "a deep link opens an ask at its pin: ring within ${worst} px at zoom ${scales}(chrome)" \
      || fail 'a deep link opens an ask at its pin' "${ring}"

    # 🧭 a moved target says so
    go '#ask-3'
    sleep 0.6
    moved=$(js framed)
    agent-browser get text aside | grep -q 'target moved' && [ "${moved}" = 'whole admin-900 no-ring' ] \
      && pass 'a moved target says so: «target moved», the whole board framed, no ring' \
      || fail 'a moved target says so' "${moved}"

    # 🧭 answering an ask — Enter takes the recommendation, 2 picks option 2
    go '#ask-1'
    # Enter on a focused link follows the link and answers nothing
    js enter-on-link >/dev/null
    sleep 1
    early=$(jq -c 'keys' "${job}/answers.json" 2>/dev/null || echo '[]')
    agent-browser eval '(() => { document.activeElement?.blur(); return 1; })()' >/dev/null
    key Enter
    sleep 1
    go '#ask-2'
    key 2
    sleep 1
    picks=$(jq -c '[."ask-1".pick, ."ask-2".pick, (."ask-1".rev | length)]' "${job}/answers.json")
    [ "${early}" = '[]' ] && [ "${picks}" = '[0,1,8]' ] && agent-browser get text aside | grep -q 'answered' \
      && pass 'answering an ask: Enter → option 1, 2 → option 2, each with a board revision; Enter on a link answers nothing' \
      || fail 'answering an ask' "after Enter on a link ${early}, answers ${picks}"

    # 🧭 an ask's life is visible
    (cd "${app}" && node scripts/loupe.ts mark "${job}" ask-2 seen >/dev/null)
    sleep 1
    seen=$(agent-browser get text aside | grep -c 'seen by the designer')
    (cd "${app}" && node scripts/loupe.ts mark "${job}" ask-2 applied v1.20 >/dev/null)
    sleep 1
    href=$(js applied)
    [ "${seen}" = 1 ] && [ "${href}" = '#board-admin-1728' ] \
      && pass "an ask's life is visible: seen, then applied in v1.20 → ${href}" \
      || fail "an ask's life is visible" "seen ${seen}, applied link «${href}»"

    # 🧭 the open count — gone once every ask is answered
    go '#ask-3'
    key 1
    sleep 1.2
    [ "$(title)" = 'speak · loupe' ] && [ "$(js favicon)" = 0 ] \
      && pass 'the open count: all answered → speak · loupe, no favicon count' \
      || fail 'the open count, all answered' "title «$(title)», favicon «$(js favicon)»"

    # 🧭 only nearby boards are live
    go '#board-admin-chain-of-one'
    sleep 0.8
    near=$(js frames)
    live=$(printf '%s' "${near}" | cut -d' ' -f1)
    [ "${live}" -ge 1 ] && [ "${live}" -lt 25 ] \
      && pass "only nearby boards are live: ${near} of 25 when one board is framed" \
      || fail 'only nearby boards are live' "${near}"

    # 🧭 a board made interactive
    agent-browser click '[data-board="admin-chain-of-one"] button' >/dev/null
    sleep 0.4
    on=$(js live)
    agent-browser eval "$(cat "${kit}/probes/esc-in-board.js")" >/dev/null
    sleep 0.4
    off=$(js live)
    [ "${on}" = 'auto' ] && [ "${off}" = 'none' ] \
      && pass 'a board made interactive: a click → it takes the pointer; Esc inside it → panning' \
      || fail 'a board made interactive' "after click «${on}», after Esc «${off}»"

    # 🧭 the designer wakes on an answer
    log=$(mktemp)
    (cd "${app}" && timeout 20 node scripts/loupe.ts wait "${job}" > "${log}" 2>&1) &
    sleep 1.5
    curl -s -X POST "${url}/api/reopen" -H 'content-type: application/json' -d '{"id":"ask-1"}' >/dev/null
    start=$(date +%s)
    curl -s -X POST "${url}/api/answer" -H 'content-type: application/json' -d '{"id":"ask-1","pick":null,"text":"kit probe"}' >/dev/null
    while [ $(($(date +%s) - start)) -lt 5 ] && ! grep -q 'answered ask-1' "${log}"; do sleep 0.2; done
    woke=$(($(date +%s) - start))
    # an answer that lands while asks.json is half-written is printed once the file mends, and wait lives on
    cp "${job}/asks.json" "${job}/asks.good"
    printf '{broken' > "${job}/asks.json"
    jq '."ask-2".at = "2026-10-02T13:00:00.000Z"' "${job}/answers.json" > "${job}/answers.next" && mv "${job}/answers.next" "${job}/answers.json"
    sleep 1.5
    mv "${job}/asks.good" "${job}/asks.json"
    mended=$(date +%s)
    while [ $(($(date +%s) - mended)) -lt 5 ] && ! grep -q 'answered ask-2' "${log}"; do sleep 0.2; done
    grep -q 'answered ask-1: «kit probe»' "${log}" && grep -q 'answered ask-2' "${log}" \
      && pass "the designer wakes on an answer: within ${woke} s, and after a half-written asks.json" \
      || fail 'the designer wakes on an answer' "$(tr '\n' ' ' < "${log}" | cut -c1-200)"

    agent-browser close >/dev/null 2>&1
    echo "ftr: $((10 - fails)) ✅ · ${fails} 🐞"
    exit $((fails > 0))
    ;;

  essentials)
    port=${2:?port}
    shift 2
    run="${HOME}/frame/home/.claude/plugin-x/skills/browser-headless/essentials/run.sh"
    status=0
    n=0
    for hash in "${@:-#ask-2}"; do
      # a fresh browser per view: the second view in a reused session carries the first one's focus and frames
      n=$((n + 1))
      # the allows and their reasons: SKILL.md, «look»
      AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION}-essentials-${n}" "${run}" "http://localhost:${port}/${hash}" --wait 'aside li' \
        --allow 'covered=use T1 .* covered by' \
        --allow 'tab=«loupe»: jumps back up and left from' \
        --allow 'axe=target-size' 2>&1 | tail -1 || status=1
    done
    exit "${status}"
    ;;

  probe)
    port=${2:?port}
    agent-browser set viewport 1440 900 >/dev/null
    agent-browser open "http://localhost:${port}/${4:-}" >/dev/null
    sleep 2.5
    js "${3:?probe name}"
    agent-browser screenshot "${TMPDIR:-/tmp}/design-loupe-probe.png" >/dev/null
    echo "shot: ${TMPDIR:-/tmp}/design-loupe-probe.png"
    ;;

  stop)
    kill "${2:?pid}" 2>/dev/null
    trash "$(dirname "${3:?job}")"
    echo "stopped ${2}, trashed $(dirname "${3}")"
    ;;

  *)
    sed -n '2,8p' "$0"
    exit 2
    ;;
esac
