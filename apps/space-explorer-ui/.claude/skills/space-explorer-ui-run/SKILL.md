---
name: space-explorer-ui-run
description: Run, start or screenshot space-explorer-ui — the ui plus its own space-explorer-api in a worktree, driven with agent-browser. Use when asked to run space-explorer, start its dev servers, log in, book a launch, show a coder's changes, or screenshot it.
---

# run space-explorer-ui

A Vite + React Apollo client. It needs **two processes**: the ui (`5173 + offset`) and its graphql backend `apps/space-explorer-api` (`4000 + offset`). Every tree runs its own pair. Drive the ui with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/`.

## Start (a worktree)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>   # ~4 s; last line prints «space-explorer 5193/4020» (ui/api)
lsof -nP -iTCP:5193 -sTCP:LISTEN; lsof -nP -iTCP:4020 -sTCP:LISTEN   # both print nothing, or pick another tree
```

Then two background tasks (`run_in_background` — note both task ids):

```bash
cd .claude/worktrees/<slug>/apps/space-explorer-api && pnpm dev                                   # api → :4020
cd .claude/worktrees/<slug>/apps/space-explorer-ui && VITE_GQL_URL=http://localhost:4020/ pnpm dev # ui  → :5193
```

`VITE_GQL_URL` must name **this tree's api port** — see Gotchas. Ready when both answer:

```bash
timeout 40 bash -c 'until curl -sf -o /dev/null -X POST -H "content-type: application/json" -d "{\"query\":\"{__typename}\"}" localhost:4020/; do sleep 1; done'
timeout 40 bash -c 'until curl -sf -o /dev/null localhost:5193/; do sleep 1; done'
```

A `run` pass stops both when its check is done. A coder serving the tree keeps them up by its own contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=space-explorer-ui-run
agent-browser set viewport 1280 800
agent-browser open http://localhost:5193          # lands on /login, email prefilled test@email.io
agent-browser wait --load networkidle
agent-browser snapshot -i                         # textbox «EMAIL», button «Log in»
agent-browser click @e7                           # «Log in» (ref from the snapshot)
agent-browser wait --url '**/launches'
agent-browser screenshot <path>.png               # launch tickets: mission, rocket, «Add to cart»
agent-browser network requests --filter localhost:40   # every POST must hit :4020
agent-browser close
```

Look at the screenshot: a header with the email, launch tickets, a bottom nav LAUNCHES / CART / TRIPS / LOGOUT.

Routes: `/login`, `/launches`, `/launches/:launchId`, `/cart`, `/profile`. All but `/login` redirect there when logged out.

## Stop

Stop **both** background tasks (TaskStop with each task id) — never a PID found by port lookup. Then:

```bash
lsof -nP -iTCP:5193 -sTCP:LISTEN; lsof -nP -iTCP:4020 -sTCP:LISTEN   # both print nothing
git -C .claude/worktrees/<slug> restore apps/space-explorer-api/db.sqlite   # only if you booked or logged in a new email
git worktree remove .claude/worktrees/<slug> && git branch -d coder/<slug>
```

## Test

```bash
cd apps/space-explorer-ui && pnpm typecheck   # no unit tests in this app; tsc ~1 s
```

## Gotchas

- **`.env.development` pins `VITE_GQL_URL=http://localhost:4000/`** (tracked). Without the override a worktree ui silently talks to whatever api owns `:4000` — main's, or nobody's. A shell env var beats the `.env` file in vite. Prove it with the `network requests` line above.
- **the database is a tracked file**: `apps/space-explorer-api/db.sqlite`, `DATABASE_URL="file:./db.sqlite"`, resolved from the api's cwd. Each tree writes its own copy — never main's, never production (the api deploys on Railway with its own db). «Book all» and logging in with a new email change it; `git restore` it before `worktree remove`, or the remove refuses a dirty tree.
- **`git status` can miss that write for a moment** — the repo runs `core.fsmonitor`. A status one second after booking printed clean; the hash already differed. Trust `git diff --quiet HEAD -- apps/space-explorer-api/db.sqlite` instead.
- **the cart lives in localStorage** (`cart`), the login too (`token`, `userId`). It survives a page reload; a fresh `AGENT_BROWSER_SESSION` starts logged out.
- **`test@email.io` already exists** in the seeded db with 1 booked trip — the trips badge reads `1` on first login.
- **`strictPort: true`** — a busy port kills vite with «Port 5173 is already in use», it never falls back to the next port. A port held by someone else is reported, never killed.
- `graphql:codegen` pulls the schema from a hardcoded `http://localhost:4000/` in `graphql-codegen.yml` — in a worktree it reads main's api, or fails when none runs. Not run here.
- the console shows only `[vite] connected.` and the React DevTools hint when healthy.
