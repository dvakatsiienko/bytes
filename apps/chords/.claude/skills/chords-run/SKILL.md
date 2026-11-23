---
name: chords-run
description: Load BEFORE you run, start, build, screenshot or click through chords, the hotkey map — «run chords», «dev:chords», «chords:dev», «check the board», «screenshot the map», «does the stats page render», a change under `apps/chords/` or frame's `hotkeys/serve.ts` that needs proof in the real page.
---

# chords-run

chords is a vite + react page served by frame's always-on launchd daemon `x-monitor-hotkey-live`
(`~/frame/hotkeys/live.ts --watch`) on **:7373**; the same daemon owns the api and the sse stream. you
drive the page with **`agent-browser`** and the api with **`curl`**. commands run from the bytes repo root
(or a worktree root) unless a line `cd`s.

## pick the lane

- **main checkout, ui change** — `pnpm dev:chords`, the page on :7374. it proxies `/api` to the live
  daemon, so it shows real bindings and presses. reads are safe; a save writes dima's real
  `~/frame/hotkeys/notes.json` / `manual.ts`.
- **a worktree, reads only** — `pnpm --filter chords dev`: the page on 7374 plus the tree's offset, over the
  live daemon. its writes answer 403 (an origin the daemon does not know).
- **any write flow** — a second daemon from a copy of frame's `hotkeys/`, below.
- **the served build on :7373** — dima's page. `pnpm --filter chords chords:build` in the main checkout
  refreshes it with no restart; never stop or restart the launchd daemon.

## lane: worktree, second daemon

`hotkeys.json`, `notes.json` and `manual.ts` resolve from the daemon's own dir, so a copy reads and writes
only itself. the press log is shared and read-only.

```bash
cp -R ~/frame/hotkeys <scratch>/hotkeys
pnpm --filter chords chords:build
CHORDS_PORT=7383 CHORDS_DAEMON=<scratch>/hotkeys/live.ts CHORDS_DIST=$PWD/apps/chords/dist pnpm --filter chords dev
```

the last line is the one run script: nothing answers on 7383, so it starts the copy as its child and then
the page. run it with `run_in_background: true`, under `timeout 7200`, and keep its task id. `:7383` serves
the tree's built `dist`, the vite port its log prints is the dev page.

- a fresh copy has no `hotkeys.json` when frame never scanned: `/api/hotkeys` answers 503 until
  `node <scratch>/hotkeys/scan.ts` runs
- ready check:

```bash
curl -s -o /dev/null -w '%{http_code}\n' localhost:7383/api/hotkeys
```

## drive it — agent-browser

own session, absolute screenshot paths (see gotchas):

```bash
export AGENT_BROWSER_SESSION=chords-run
agent-browser set viewport 1280 900
agent-browser open http://localhost:7374/
agent-browser wait '[role=tab]'
agent-browser snapshot -i -c | head -40
agent-browser screenshot <scratch>/board.png
```

the page's accessible names are the handle — every key is a button named
`<key> <presses> <action>`, every layer a tab named `<layer> <bindings>`:

```bash
agent-browser find role tab click --name "cmd 22"
agent-browser find role button click --name "Search Emoji"
agent-browser find role textbox fill "a note" --name "note for this chord"
agent-browser find role button click --name "save note" --exact
agent-browser find role button click --name stats --exact
agent-browser get url
agent-browser errors --json | jq -r '.data.errors[] | .text | split("\n")[0]' | sort | uniq -c
```

- the board opens on the `hyper` layer; a key named on another layer is not found until its tab
  is clicked
- a save is proven in the daemon's own files, never in the page: `diff ~/frame/hotkeys/notes.json <scratch>/hotkeys/notes.json`
- the sse stream, straight from the api:

```bash
curl -sN -m 4 -H 'Accept: text/event-stream' localhost:7374/api/presses | head -c 300
```

- the origin guard (a write from a foreign page must answer 403):

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X PUT -H 'Content-Type: application/json' -H 'Origin: http://evil.test' -d '{}' localhost:7383/api/notes
```

## tests

```bash
pnpm --filter chords test
pnpm --filter chords typecheck
```

they cover the page's helpers and the run script's port check; the board has no tests, so a ui change is
proven in agent-browser. the node side's tests are frame's: `pnpm -C ~/frame exec vitest run hotkeys`.

## stop

stop only what you started:

- a `run` pass stops what it started; codie serving its tree for dima keeps it up until the worktree goes — codie's contract (`x:crew-codie`), not this skill's
- everything else: TaskStop each background task id, then close the browser session and prove
  the ports are free

```bash
agent-browser close
for p in 7383 <the port vite printed>; do lsof -nP -iTCP:$p -sTCP:LISTEN -t >/dev/null && echo "$p STILL BUSY" || echo "$p free"; done
```

:7373 stays busy — that is the launchd daemon, and it is supposed to.

## gotchas

- **a relative screenshot path lands in the agent-browser daemon's cwd**, the dir of the shell
  that first launched it — not the current shell's cwd. always pass an absolute path.
- **`agent-browser errors` prints bare `✗` lines** with no text. `--json` shows the message.
- **`agent-browser errors --clear` clears nothing** — it prints the buffer, which keeps every
  error since the session began, stale code included. an error count per load comes from a fresh
  `AGENT_BROWSER_SESSION` name, closed after.
- **the page loads with zero console errors.** any `VGPUError` is new: vgpu fires `onResize`
  callbacks from inside its own frame, so a draw there must wait for the next animation frame.
- **a dev shot taken too early shows the fallback mono face**: the plex files load later on vite than
  from the build. wait a second before comparing two shots.
- **vite binds `[::1]` only** — `localhost:7374` answers, `127.0.0.1:7374` does not.
- **the daemon binds `0.0.0.0`**, ipv4 only, on purpose (a phone on the wi-fi opens it) — `[::1]:7383`
  does not connect. writes answer 403 unless they come from loopback, so a write probe goes to
  `127.0.0.1` or `localhost`, never the mac's wi-fi address.
- **`pnpm -C ~/frame hotkeys:scan` prints nothing on stderr when every source reads.** a `skipped <source>`
  line is a real change on this mac — an app gone or its config moved — never noise.

## troubleshooting

- `✗ 89 elements have role "button", but none match name …` — the key lives on another layer, or
  its press count moved. `snapshot -i -c | grep` for the current name.
- a saved note does not land — nothing was selected when you saved; select a key first, the SELECTED KEY
  panel names it.
