#!/usr/bin/env bash
# kit.sh <verb> — design-loupe's verify steps, one line per ftr check.
#   start [port]        a private copy of fixtures/speak and a server on it (default 5291);
#                       prints `job=<dir> port=<port> pid=<pid>` — keep them for walk and stop
#   walk <port> <job>   drives every FTR.md line on that server and job: `✅ <line>` or `🐞 <line> — why`;
#                       exit 1 on any 🐞
#   essentials <port> [/path…]    x:browser-headless essentials at 1280 and 390, with the app's allows
#   probe <port> <name> [/path]   opens the page at the path, prints probes/<name>.js, shoots it
#   broken <port> <job>         plants invalid json in asks.json, waits for «loupe cannot read the job»,
#                               restores the file byte for byte and waits for the asks to come back
#   parallel <port> <job> [n]   posts n notes (default 8) to ask-1 at once; each must land in answers.json
#   loads <port> [/path]        opens the path, counts each board iframe's loads; exit 1 when one loaded twice
#   boards <port>               visits every board variant path, one `✅ /speak/board/<name>` line each
#   stop <pid> <job>    stops that server and trashes the copy
# The checks print `✅` or `🐞` and exit 1 on any 🐞. Run from anywhere inside a checkout. Nothing here writes the studio job or fixtures/speak itself.
set -uo pipefail

app=$(git rev-parse --show-toplevel)/apps/design-loupe
kit=$(cd "$(dirname "$0")" && pwd)
export AGENT_BROWSER_SESSION="${AGENT_BROWSER_SESSION:-verify-design-loupe}"
fails=0

checks=0
pass() { echo "✅ $1"; checks=$((checks + 1)); }
fail() { echo "🐞 $1 — $2"; fails=$((fails + 1)); checks=$((checks + 1)); }
js() { agent-browser eval "$(cat "${kit}/probes/$1.js")" | tr -d '\\' | sed -e 's/^"//' -e 's/"$//'; }
key() { agent-browser eval "(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: '$1' })); return 1; })()" >/dev/null; }
# an in-page move, the way a link click makes one: pushState, then the popstate the route store hears
go() { agent-browser eval "(() => { history.pushState(null, '', '$1'); dispatchEvent(new PopStateEvent('popstate')); return 1; })()" >/dev/null; sleep 1; }
api() { curl -s "localhost:${port}/api/job" | jq -r "$1"; }
post() { curl -s -X POST "localhost:${port}/api/$1" -H 'content-type: application/json' -d "$2" >/dev/null; }
title() { agent-browser get title; }
# one note through the open ask's own form, the way Enter in the note line sends it
note() { agent-browser eval "(() => { const i = document.querySelector('input[aria-label^=\"add a note\"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, '$1'); i.dispatchEvent(new Event('input', { bubbles: true })); i.form.requestSubmit(); return 1; })()" >/dev/null; sleep 1; }

case "${1:-}" in
  start)
    port=${2:-5291}
    if lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null; then echo "kit: port ${port} is taken" >&2; exit 2; fi
    [ -f "${app}/.runtime/dc-runtime.js" ] || { echo "kit: no .runtime/dc-runtime.js — pnpm worktree:seed copies it from the main checkout; AGENTS.md: the runtime" >&2; exit 2; }
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
    # a cold load of the ask path: a fresh tab straight onto /speak/ask/2
    agent-browser open "${url}/speak/ask/2" >/dev/null
    agent-browser wait '[data-ring="ask-2"]' >/dev/null
    sleep 1.5
    js kept >/dev/null
    # the fixture holds 3 asks; ask-3's target moved, so it is locked and left out of every count
    [ "$(title)" = '(2) speak · design loupe' ] && [ "$(js favicon)" = 2 ] \
      && pass 'the open count: 2 live open asks (the moved one locked) → (2) speak · design loupe, favicon 2' \
      || fail 'the open count' "title «$(title)», favicon «$(js favicon)»"

    # 🧭 one push per round — first, while every ask is open
    first=$(cd "${app}" && PORT="${port}" node scripts/loupe.ts round "${job}" 2>&1)
    second=$(cd "${app}" && PORT="${port}" node scripts/loupe.ts round "${job}" 2>&1)
    code=$?
    [ "$(printf '%s\n' "${first}" | wc -l | tr -d ' ')" = 1 ] && [[ "${first}" == *"2 asks → http://localhost:${port}/speak/ask/1"* ]] && [ "${code}" = 1 ] \
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
    go '/speak/ask/3'
    sleep 0.6
    moved=$(js framed)
    agent-browser get text aside | grep -q 'target moved' && [ "${moved}" = 'whole admin-900 no-ring' ] \
      && pass 'a moved target says so: «target moved», the whole board framed, no ring' \
      || fail 'a moved target says so' "${moved}"

    # 🧭 answering an ask — Enter takes the recommendation, 2 picks option 2
    go '/speak/ask/1'
    # Enter on a focused link follows the link and answers nothing
    sent=$(js enter-on-link)
    sleep 1
    early=$(jq -c '.answers | keys' "${job}/answers.json" 2>/dev/null || echo '[]')
    agent-browser eval '(() => { document.activeElement?.blur(); return 1; })()' >/dev/null
    key Enter
    sleep 1
    go '/speak/ask/2'
    key 2
    sleep 1
    picks=$(jq -c '.answers | [."ask-1".pick, ."ask-2".pick, (."ask-1".rev | length)]' "${job}/answers.json")
    [ "${sent}" = 'sent from the ask-2 link' ] && [ "${early}" = '[]' ] && [ "${picks}" = '[0,1,8]' ] && agent-browser get text aside | grep -q 'answered' \
      && pass 'answering an ask: Enter → option 1, 2 → option 2, each with a board revision; Enter on a link answers nothing' \
      || fail 'answering an ask' "Enter on a link: «${sent}» → ${early}, answers ${picks}"

    # 🧭 an ask's question is text — plain, selectable, outside every link
    question=$(js question)
    [ "${question}" = 'plain, 2 jump links' ] \
      && pass 'the question is text: plain and selectable; the header and the board line are the 2 jumps' \
      || fail 'the question is text' "${question}"

    # 🧭 notes — a note keeps the pick, notes append oldest first with their time
    note 'first note'
    note 'second note'
    thread=$(jq -c '.answers | [."ask-2".pick, [."ask-2".notes[].text], (."ask-2".notes | all(.at | length > 0))]' "${job}/answers.json")
    shown=$(agent-browser get text 'aside ol[aria-label="notes"]' 2>/dev/null | tr '\n' ' ')
    [ "${thread}" = '[1,["first note","second note"],true]' ] && [[ "${shown}" == *'first note'*'second note'* ]] \
      && pass 'notes: two notes keep the pick (option 2) and stack oldest first, each with its time' \
      || fail 'notes' "answers ${thread}, panel «${shown}»"

    # 🧭 an ask's life is visible
    (cd "${app}" && node scripts/loupe.ts mark "${job}" ask-2 seen >/dev/null)
    sleep 1
    seen=$(agent-browser get text aside | grep -c 'seen by the designer')
    (cd "${app}" && node scripts/loupe.ts mark "${job}" ask-2 applied v1.20 >/dev/null)
    sleep 1
    href=$(js applied)
    [ "${seen}" = 1 ] && [ "${href}" = '/speak/board/admin-1728' ] \
      && pass "an ask's life is visible: seen, then applied in v1.20 → ${href}" \
      || fail "an ask's life is visible" "seen ${seen}, applied link «${href}»"

    # 🧭 a moved target says so — the moved ask is locked: a key picks nothing, its options are off, no note line
    go '/speak/ask/3'
    key 1
    sleep 1.2
    locked=$(agent-browser eval "(() => { const row = document.querySelector('aside li.border-loupe'); const options = [...row.querySelectorAll('button[aria-pressed]')]; return [options.length > 0 && options.every((b) => b.disabled), !row.querySelector('input'), !row.textContent.includes('reopen')].join(' '); })()" | tr -d '"')
    picked=$(jq -c '.answers."ask-3" // null' "${job}/answers.json")
    status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "${url}/api/answer" -H 'content-type: application/json' -d '{"id":"ask-3","pick":0,"note":""}')
    [ "${locked}" = 'true true true' ] && [ "${picked}" = null ] && [ "${status}" = 400 ] \
      && pass 'a moved ask is locked: 1 picks nothing, the options are off, no note line or reopen, and the api answers 400' \
      || fail 'a moved ask is locked' "ui «${locked}», on file ${picked}, api ${status}"

    # 🧭 the open count — gone once every live ask is answered
    [ "$(title)" = 'speak · design loupe' ] && [ "$(js favicon)" = 0 ] \
      && pass 'the open count: every live ask answered → speak · design loupe, no favicon count' \
      || fail 'the open count, all answered' "title «$(title)», favicon «$(js favicon)»"

    # 🧭 only nearby boards are live
    go '/speak/board/admin-chain-of-one'
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

    # 🧭 a board's own links stay inside it — the comp's logo points at «/», design loupe itself
    agent-browser click '[data-board="admin-chain-of-one"] button' >/dev/null
    sleep 0.4
    clicked=$(js board-link)
    sleep 1.5
    frames=$(js board-page)
    kept=$(js board-kept)
    agent-browser eval "$(cat "${kit}/probes/esc-in-board.js")" >/dev/null
    [ "${frames}" = 'every frame on its board' ] && [ "${kept}" = kept ] && [[ "${clicked}" == clicked* ]] \
      && pass "a board's own links stay inside it: ${clicked}, the frame never left or reloaded" \
      || fail "a board's own links stay inside it" "${clicked} → ${frames}, the board ${kept}"

    # 🧭 a deep link opens an ask at its pin — moving between asks and boards never reloads the page
    [ "$(js kept)" = kept ] \
      && pass 'moving between asks and boards: one page marker held across every move of the walk' \
      || fail 'moving between asks and boards' 'the page reloaded'

    # 🧭 a deep link opens an ask at its pin — a path naming another job lands on this job's overview
    agent-browser open "${url}/nope/ask/1" >/dev/null
    agent-browser wait 'aside li' >/dev/null
    sleep 0.8
    other=$(agent-browser eval "(() => location.pathname + ' ' + (document.querySelector('aside [aria-current]') ? 'open' : 'none'))()" | tr -d '"')
    [ "${other}" = '/speak none' ] \
      && pass 'another job in the path: /nope/ask/1 → /speak, no ask open' \
      || fail 'another job in the path' "${other}"

    # 🧭 a board reached by Tab comes into view — admin · 900 sits half under the panel at 1280
    agent-browser set viewport 1280 800 >/dev/null
    agent-browser open "${url}/speak/ask/2" >/dev/null
    agent-browser wait '[data-ring="ask-2"]' >/dev/null
    sleep 1
    tabs=$(node "${kit}/probes/tab.mjs" "$(agent-browser get cdp-url)" "${port}" '[data-board="admin-900"] button')
    sleep 0.6
    seen=$(js onscreen)
    agent-browser set viewport 1440 900 >/dev/null
    [ "${seen}" = 'whole admin-900' ] \
      && pass "a board reached by Tab comes into view: admin · 900 whole on screen after ${tabs} Tabs at 1280" \
      || fail 'a board reached by Tab comes into view' "after ${tabs} Tabs: ${seen}"

    # 🧭 the designer wakes once per round — nothing on one answer, one block when the last open ask is answered
    log=$(mktemp)
    (cd "${app}" && timeout 40 node scripts/loupe.ts wait "${job}" > "${log}" 2>&1) &
    sleep 1.5
    post reopen '{"id":"ask-1"}'
    post reopen '{"id":"ask-2"}'
    post answer '{"id":"ask-1","pick":null,"note":"kit probe"}'
    sleep 2
    early=$(grep -c 'handed over' "${log}")
    start=$(date +%s)
    post answer '{"id":"ask-2","pick":0,"note":""}'
    while [ $(($(date +%s) - start)) -lt 5 ] && ! grep -q 'handed over' "${log}"; do sleep 0.2; done
    woke=$(($(date +%s) - start))
    [ "${early}" = 0 ] && grep -q 'handed over (all answered): 2 answers' "${log}" && grep -q 'ask-1: no pick + 1 note, last «kit probe»' "${log}" \
      && pass "the designer wakes once per round: nothing on the first answer, one block of 2 answers ${woke} s after the last" \
      || fail 'the designer wakes once per round' "$(tr '\n' ' ' < "${log}" | cut -c1-240)"

    # 🧭 send to designer — a change after the handover waits; «send to designer» hands it over
    post answer '{"id":"ask-1","pick":null,"note":"after the handover"}'
    sleep 2
    waited=$(grep -c 'handed over' "${log}")
    agent-browser open "${url}/speak" >/dev/null
    agent-browser wait 'aside li' >/dev/null
    bar=$(agent-browser get text 'aside [role=status]' | tr '\n' ' ')
    agent-browser eval "(() => { [...document.querySelectorAll('aside button')].find((b) => b.textContent === 'send to designer').click(); return 1; })()" >/dev/null
    sent=$(date +%s)
    while [ $(($(date +%s) - sent)) -lt 5 ] && ! grep -q 'send to designer' "${log}"; do sleep 0.2; done
    sleep 0.6
    after=$(agent-browser get text 'aside [role=status]' | tr '\n' ' ')
    [ "${waited}" = 1 ] && [[ "${bar}" == *'1 of 2 answers staged'* ]] && grep -q 'handed over (send to designer): 1 answer' "${log}" && [[ "${after}" == *'sent to the designer at '* ]] \
      && pass 'send to designer: a note after the handover waits («1 of 2 answers staged», the locked ask left out); the button hands it over as one block, and the bar says «sent to the designer at …»' \
      || fail 'send to designer' "handovers before the press ${waited}, bar «${bar}», log $(tr '\n' ' ' < "${log}" | cut -c1-200)"

    # 🧭 the designer wakes once per round — a handover that lands while asks.json is half-written prints once the file mends
    cp "${job}/asks.json" "${job}/asks.good"
    printf '{broken' > "${job}/asks.json"
    jq '.answers."ask-2".at = "2099-01-01T00:00:00.000Z" | .sent += [{"at": "2099-01-01T00:00:00.001Z", "by": "send to designer", "round": 1}]' \
      "${job}/answers.json" > "${job}/answers.next" && mv "${job}/answers.next" "${job}/answers.json"
    sleep 1.5
    mv "${job}/asks.good" "${job}/asks.json"
    mended=$(date +%s)
    while [ $(($(date +%s) - mended)) -lt 5 ] && [ "$(grep -c 'handed over' "${log}")" -lt 3 ]; do sleep 0.2; done
    [ "$(grep -c 'handed over' "${log}")" = 3 ] \
      && pass 'the designer wakes after a half-written asks.json: the handover prints once the file mends' \
      || fail 'a handover during a half-written asks.json' "$(tr '\n' ' ' < "${log}" | cut -c1-240)"

    agent-browser close >/dev/null 2>&1
    echo "ftr: $((checks - fails)) ✅ · ${fails} 🐞"
    exit $((fails > 0))
    ;;

  essentials)
    port=${2:?port}
    shift 2
    run="${HOME}/frame/home/.claude/plugin-x/skills/browser-headless/essentials/run.sh"
    status=0
    n=0
    for path in "${@:-/speak/ask/2}"; do
      # a fresh browser per view: the second view in a reused session carries the first one's focus and frames
      n=$((n + 1))
      # the allows and their reasons: SKILL.md, «look»
      # and fresh per run: a reused session keeps the console errors of the last one
      session="${AGENT_BROWSER_SESSION}-essentials-$$-${n}"
      out=$(AGENT_BROWSER_SESSION="${session}" "${run}" "http://localhost:${port}${path}" --wait 'aside li' \
        --allow 'covered=use T1 .* covered by|^… [0-9]+ more$' \
        --allow 'tab=«loupe»: jumps back up and left from' \
        --allow 'axe=target-size' 2>&1) || status=1
      AGENT_BROWSER_SESSION="${session}" agent-browser close >/dev/null 2>&1
      # the summary line, plus the console line when the view is red — it names the error
      last=$(printf '%s\n' "${out}" | tail -1)
      echo "${last}"
      [[ "${last}" == 🔴* ]] && printf '%s\n' "${out}" | grep -i 'console' | head -3
    done
    exit "${status}"
    ;;

  probe)
    port=${2:?port}
    agent-browser set viewport 1440 900 >/dev/null
    agent-browser open "http://localhost:${port}${4:-/}" >/dev/null
    sleep 2.5
    js "${3:?probe name}"
    agent-browser screenshot "${TMPDIR:-/tmp}/design-loupe-probe.png" >/dev/null
    echo "shot: ${TMPDIR:-/tmp}/design-loupe-probe.png"
    ;;

  broken)
    port=${2:?port}
    job=${3:?job}
    keep="$(dirname "${job}")/asks.keep"
    cp -p "${job}/asks.json" "${keep}"
    # whatever happens below, the job gets its own asks.json back
    trap 'cat "${keep}" > "${job}/asks.json"' EXIT
    agent-browser set viewport 1440 900 >/dev/null
    agent-browser open "http://localhost:${port}/$(basename "${job}")" >/dev/null
    agent-browser wait 'aside li' >/dev/null
    printf '{broken' > "${job}/asks.json"
    shown=$(agent-browser wait --text 'loupe cannot read the job' --timeout 8000 >/dev/null 2>&1 && echo alert || echo 'no alert')
    cat "${keep}" > "${job}/asks.json"
    back=$(agent-browser wait 'aside li' --timeout 8000 >/dev/null 2>&1 && echo asks || echo 'no asks')
    same=$(cmp -s "${keep}" "${job}/asks.json" && echo same || echo differs)
    [ "${shown} · ${back} · ${same}" = 'alert · asks · same' ] \
      && pass 'a broken asks.json: the page says «loupe cannot read the job», and the asks come back once the file is restored byte for byte' \
      || fail 'a broken asks.json' "${shown} · ${back} · the file ${same}"
    exit $((fails > 0))
    ;;

  parallel)
    port=${2:?port}
    job=${3:?job}
    n=${4:-8}
    tag="parallel-$$"
    codes=$(for i in $(seq 1 "${n}"); do
      curl -s -o /dev/null -w '%{http_code}\n' -X POST "localhost:${port}/api/answer" -H 'content-type: application/json' \
        -d "{\"id\":\"ask-1\",\"pick\":null,\"note\":\"${tag} ${i}\"}" &
    done; wait)
    ok=$(printf '%s\n' "${codes}" | grep -c '^200$')
    landed=$(jq --arg tag "${tag}" '[.answers."ask-1".notes[].text | select(startswith($tag))] | unique | length' "${job}/answers.json")
    [ "${ok}" = "${n}" ] && [ "${landed}" = "${n}" ] \
      && pass "parallel POSTs: ${n} notes posted at once, all ${n} in answers.json" \
      || fail 'parallel POSTs' "${ok} of ${n} answered 200, ${landed} of ${n} in answers.json"
    exit $((fails > 0))
    ;;

  loads)
    port=${2:?port}
    agent-browser set viewport 1440 900 >/dev/null
    agent-browser open "http://localhost:${port}${3:-/speak}" >/dev/null
    agent-browser wait 'aside li' >/dev/null
    # a board that reloads does it after the first render: give the page time to settle
    sleep 2
    counts=$(js loads)
    [[ "${counts}" != *×* && "${counts}" != '0 boards' ]] \
      && pass "iframe loads: ${counts}, each loaded once" \
      || fail 'iframe loads' "${counts}"
    exit $((fails > 0))
    ;;

  boards)
    port=${2:?port}
    agent-browser set viewport 1440 900 >/dev/null
    agent-browser open "http://localhost:${port}/$(api .name)" >/dev/null
    agent-browser wait 'aside li' >/dev/null
    while read -r path name; do
      go "${path}"
      framed=$(js framed)
      [[ "${framed}" == "whole ${name} "* ]] && pass "${path}" || fail "${path}" "${framed}"
    done < <(api '.name as $job | .boards[] | "/\($job)/board/\(.name | @uri) \(.name)"')
    echo "boards: $((checks - fails)) ✅ · ${fails} 🐞"
    exit $((fails > 0))
    ;;

  stop)
    kill "${2:?pid}" 2>/dev/null
    trash "$(dirname "${3:?job}")"
    echo "stopped ${2}, trashed $(dirname "${3}")"
    ;;

  *)
    awk 'NR > 1 && !/^#/ { exit } NR > 1' "$0"
    exit 2
    ;;
esac
