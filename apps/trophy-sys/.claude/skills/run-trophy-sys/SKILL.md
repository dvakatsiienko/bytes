---
name: run-trophy-sys
description: Run, start or screenshot trophy-sys — its web + api dev pair for a worktree or a coder's live changes, driven with agent-browser. Use when asked to run trophy-sys, start its dev server, show a coder's changes, or screenshot the library, campaign charts or console.
---

# run trophy-sys

A Vite web app plus a `node:http` api — **two processes**, both started by one `pnpm dev`. Vite serves on `5177 + offset` and proxies `/api` to the api on `5178 + offset`. Nothing serves trophy-sys on the mac by default, so the main checkout uses `:5177`/`:5178` and a worktree `:5187`/`:5188` (offset 10). Drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/trophy-sys`.

## Start

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>   # ~6 s: copies .env* and the .trophy-*.json state, installs with CI=1; prints «trophy-sys 5187/5188»
lsof -nP -iTCP:5187 -iTCP:5188 -sTCP:LISTEN   # must print nothing; a taken port is reported, never killed
```

Then start both processes as one background task (`run_in_background`), and note its task id. The first line it prints is the process group id — keep it too:

```bash
cd .claude/worktrees/<slug>/apps/trophy-sys && pnpm dev & echo "pgid=$(ps -o pgid= -p $! | tr -d ' ')"; wait
```

Ready when both halves answer:

```bash
timeout 40 bash -c 'until curl -sf localhost:5188/api/health >/dev/null && curl -sf localhost:5187 >/dev/null; do sleep 1; done' && curl -s localhost:5187/api/health
# {"ok":true,"stateBackend":"file"}
```

`"file"` is the point: `.env.dev.local` blanks the KV credentials, so the tree reads and writes its own `.trophy-*.json` copies and never production.

A `run` pass stops both processes when its check is done. A coder serving the tree for dima keeps them up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=run-trophy-sys
agent-browser set viewport 1280 800
agent-browser open http://localhost:5187        # redirects to /library
agent-browser wait 5000                         # the PSN calls settle; charts need /api/games
agent-browser screenshot <path>.png
agent-browser open http://localhost:5187/campaign   # the stats charts
agent-browser eval '(() => document.querySelectorAll("svg").length)()'   # charts drawn → dozens; 0 → read the panels' text
agent-browser network requests --filter /api    # 500 on games/profile = PSN refused, see below
agent-browser close
```

Routes: `/library`, `/library/<npCommunicationId>`, `/campaign`, `/journal`, `/console`.

Sign in to `/console` (the admin) with the credentials in the tree's `.env`, never echoed:

```bash
cd .claude/worktrees/<slug>/apps/trophy-sys
agent-browser open http://localhost:5187/console && agent-browser wait 'input[type=password]'
ADMIN_EMAIL=$(sed -n 's/^ADMIN_EMAIL=//p' .env | tr -d '"') ADMIN_PASSWORD=$(sed -n 's/^ADMIN_PASSWORD=//p' .env | tr -d '"') bash -c 'agent-browser fill "input[type=email], input[autocomplete=username], form input:first-of-type" "$ADMIN_EMAIL" >/dev/null && agent-browser fill "input[type=password]" "$ADMIN_PASSWORD" >/dev/null'
agent-browser click 'form button' && agent-browser wait 2000 && agent-browser screenshot <path>.png
```

Signed in, the console shows the PSN TOKEN panel (the NPSSO age and the grant state), SETTINGS and the GAMES hide list.

## Stop

Stop only what you started. Two ways, both take **both** processes:

- TaskStop with the task id from Start — it ends the whole process group.
- or the group id printed at start: `kill -- -<pgid>` (exit 144 on the task is that signal, not a failure).

Then prove both ports are free and drop the tree:

```bash
lsof -nP -iTCP:5187 -iTCP:5188 -sTCP:LISTEN   # prints nothing
git worktree remove .claude/worktrees/<slug> && git branch -D coder/<slug>
```

## Test

```bash
cd apps/trophy-sys && pnpm test        # vitest, 9 files, 74 tests, <1 s
cd apps/trophy-sys && pnpm typecheck   # both tsconfigs, exit 0
```

## Gotchas

- ⚠️ **`kill <pnpm pid>` orphans both servers.** `pnpm dev` is `api & web` in one shell line; killing the pnpm PID alone left vite and the api listening on `:5187`/`:5188`. Kill the process **group**, never the single PID, and never a PID found by port lookup.
- **`NPSSO_INVALID` needs a human.** When PSN refuses the stored token, `/api/games`, `/api/profile` and `/api/news` answer 500 `{"error":"NPSSO_INVALID"}`, the header says «PSN sign-in expired», and every chart panel reads «could not read the library · NPSSO_INVALID». Only the totals strip renders (it comes from the cached `/api/stats`). Dima pastes a fresh 64-character NPSSO in `/console` → PSN TOKEN. A paste in a worktree fixes only that tree's `.trophy-npsso.json` copy.
- the worktree's state is a copy made at seed time: admin saves, a new grant or a death record land in the tree's `.trophy-*.json`, never in the main checkout's.
- `agent-browser wait` takes a selector or milliseconds; an unknown flag (`--text … --state hidden`) crashed the session and the next verb ran on a fresh blank browser, returning a false `0`.
- `curl …/api/admin/session` answers `{"authed":false}` even while the browser is signed in — the cookie lives in the browser only.
- `/api/stats` and `/api/settings` work without PSN; use them to prove the api is alive when the token is dead.
