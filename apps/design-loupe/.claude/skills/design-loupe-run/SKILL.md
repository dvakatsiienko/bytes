---
name: design-loupe-run
description: Load BEFORE you run, start, screenshot or verify design-loupe — «run loupe», «open /speak/ask/2», «does the ring show», «answer an ask in the browser», «loupe round», «loupe wait», a check of `answers.json`.
---

# design-loupe-run — start it, drive it, stop it

design-loupe is a vite page plus a small json api on the same dev server. you drive the page with
`agent-browser` (load `x:browser-headless` first) and the api and the designer's side with `curl` and
`pnpm loupe`. all paths below are relative to `apps/design-loupe`.

## 1. a private job and a private port

the server reads and writes one job dir. `fixtures/speak` is shared with every other session in this
tree, so a run of yours answers asks in someone else's test. copy it first, without its
`answers.json`, so the copy starts with three open asks.

```bash
[ -d fixtures/speak/boards ] || pnpm loupe:fixture
S=$(mktemp -d) && rsync -a --exclude answers.json fixtures/speak/ "$S/speak/"
P=5291
lsof -nP -iTCP:$P -sTCP:LISTEN
```

- `pnpm loupe:fixture` needs `~/projects/studio/jobs/speak/takes/merge/project`; it plants `ask-1` and
  `ask-2` and leaves `ask-3` with no pin, so `ask-3` reads «target moved». it also clears
  `fixtures/speak/answers.json` under any server already running on it — so it runs only when the
  boards are missing.
- `pnpm dev` alone takes `5181 + .worktree-offset` (5191 in the BYT-116 tree) with `strictPort`, so it
  dies when the coder's server holds that port. an explicit `PORT` wins. the `lsof` line must print
  nothing; if it prints a listener, pick another `P`.
- `.runtime/dc-runtime.js` must exist — every board loads it as `./support.js`. without it the boards
  are blank and `/boards/support.js` answers 404.

## 2. start

```bash
LOUPE_JOB="$S/speak" PORT=$P pnpm dev > "$S/dev.log" 2>&1 &
for i in $(seq 1 40); do curl -sf localhost:$P/api/job >/dev/null && break; sleep 0.25; done
curl -s localhost:$P/api/job | jq -c '{title, asks: [.asks[] | {id, state}]}'
```

done when the last line prints `"title":"speak — merge v1.19"` and three `open` asks.

## 3. drive the page

```bash
export AGENT_BROWSER_SESSION=loupe-run
agent-browser set viewport 1440 900
agent-browser open "http://localhost:$P/speak/ask/2"
agent-browser wait '[data-ring="ask-2"]'
agent-browser get title
agent-browser screenshot "$S/ask-2.png"
```

- the ring is `[data-ring="<ask id>"]`, drawn by the app over the iframe. read its box with
  `agent-browser eval '(() => document.querySelector("[data-ring]")?.getBoundingClientRect().toJSON())()'`.
- the title carries the open count: `(3) speak · design loupe`, then `speak · design loupe` once all are answered.
- a moved target has no ring; the panel shows «target moved». wait on it with
  `agent-browser wait --text "target moved"`.

### answer with a key — one event, never `press`

```bash
agent-browser eval '(() => { window.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter"})); })()'
sleep 1; jq -c '.answers."ask-2"' "$S/speak/answers.json"
```

the panel listens on `window`, so a dispatched event is the real path. `Enter` takes the
recommendation, `"1"`–`"9"` pick an option, `"j"` / `"k"` step between asks. move to another ask with
`agent-browser eval '(() => { history.pushState(null, "", "/speak/ask/1"); dispatchEvent(new PopStateEvent("popstate")); })()'`
— an in-page move, the way a link makes one; `open` on a new path reloads the page.

## 4. drive the api and the designer's side

```bash
curl -s -X POST localhost:$P/api/reopen -H 'content-type: application/json' -d '{"id":"ask-2"}'
curl -s -X POST localhost:$P/api/answer -H 'content-type: application/json' -d '{"id":"ask-2","pick":null,"note":"fine by me"}'
PORT=$P pnpm loupe round "$S/speak"
pnpm loupe mark "$S/speak" ask-2 seen
pnpm loupe mark "$S/speak" ask-2 applied v1.20
curl -s localhost:$P/api/job | jq -c '[.asks[] | {id, state}]'
```

- `loupe round` prints the one push line and stamps the round; a second call exits 1 with «round 1 was
  pushed already». a fresh copy of the fixture resets it.
- `loupe wait <job>` prints one block per handover and never exits — nothing for a single answer.
  test it under a timeout: `(timeout 8 node scripts/loupe.ts wait "$S/speak"; true) &`, then answer
  every open ask (or `curl -s -X POST localhost:$P/api/send -H 'content-type: application/json' -d '{}'`)
  — it prints `round 1 handed over (all answered): 3 answers` and one `  ask-N: …` line each.
- a write with a foreign `Origin` header, or without `content-type: application/json`, gets 403.

## 5. stop

```bash
agent-browser close
kill $(lsof -nP -iTCP:$P -sTCP:LISTEN -t)
trash "$S"
```

done when `lsof -nP -iTCP:$P -sTCP:LISTEN` prints nothing. kill only the listener on YOUR `P`.

## gotchas

- 📌 **`agent-browser press <key>` sends ~480 keydowns** (counted: 477 for one `press x`, focus on
  `BODY`). each one is an answer, so `answers.json` keeps getting rewritten, and the daemon hangs so
  hard that the next `eval` and even `close` time out. after a hang: `agent-browser close` under a
  `timeout`, then a fresh `open` starts a new browser.
- the first deep-link load after `pnpm dev` starts can miss the ring at a fixed 2.5 s wait; it showed
  3 of 3 times after that. wait on `[data-ring=…]`, never on a sleep.
- an in-page move (pushState + popstate) keeps the page: listeners and globals from an earlier `eval`
  are still there. `agent-browser open` on any path is a fresh load.
- `agent-browser wait 'text=…'` is not a text wait; it hangs. use `wait --text "…"`.
- pnpm 12 has no `-s`: `pnpm -s loupe …` fails with «unexpected argument '-s'». use plain `pnpm loupe`.
- `pnpm test` exits 1 with «No test files found» until the app has `*.test.ts` files under `server`,
  `src` or `scripts`.
