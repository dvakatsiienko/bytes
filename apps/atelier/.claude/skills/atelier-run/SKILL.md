---
name: atelier-run
description: Run, start or screenshot atelier — a dev server for a worktree or a coder's live changes, driven with agent-browser. Use when asked to run atelier, start its dev server, show a coder's changes, or screenshot it.
---

# run atelier

A Vite + React studio. The **main checkout is already served** by launchd (`x-atelier-live`, `:5180`) — never start a second server there. A worktree gets its own server on `5180 + offset` (`:5190` for the first worktree) and serves that tree's live code through hmr. Drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/atelier`.

## Run: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>        # ~7 s: copies .env*, installs with CI=1, writes .worktree-offset; prints «atelier 5190»
cd .claude/worktrees/<slug>/apps/atelier && pnpm dev   # run_in_background — note its task id; it stays up
```

Ready when the build probe answers, and it names the tree it serves:

```bash
timeout 40 bash -c 'until curl -sf localhost:5190/api/build >/dev/null; do sleep 1; done' && curl -s localhost:5190/api/build
# {"branch":"coder/<slug>","isDev":true,"sha":"2d09f775"}
```

A `run` pass stops the server when its check is done. A coder serving the tree for dima keeps it up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=atelier-run
agent-browser set viewport 1280 800
agent-browser open http://localhost:5190
agent-browser wait --load load
agent-browser snapshot -i          # the rail: pieces as links, «commands ⌘K», theme buttons
agent-browser click @e148          # a piece link (ref from the snapshot) → /workshop
agent-browser screenshot <path>.png
agent-browser console              # healthy: «[vite] connected.»
agent-browser close
```

Look at the screenshot: a piece shows its scene in the centre and its controls on the right.

## Stop

Stop the background task that ran `pnpm dev` (TaskStop with its task id, or the PID captured when it started) — never a PID found by port lookup. Then:

```bash
lsof -nP -iTCP:5190 -sTCP:LISTEN   # prints nothing: stopping the task took vite with it
git worktree remove .claude/worktrees/<slug>
```

## Test

```bash
cd apps/atelier && pnpm test       # vitest, 13 files, ~2 s
```

## Gotchas

- **the port is `5180 + offset`** — `worktree:seed` prints it (`atelier 5190`); `.worktree-offset` holds the offset (10 → `:5190`, 20 → `:5200`).
- **isolation is proven**: an edit in the worktree reached `:5190` by hmr in ~2 s while `:5180` kept main's text. Check `/api/build` before trusting any screenshot — `:5180` answers `"branch":"main","isDev":false`.
- the header badge and `/api/build` name the worktree's branch (`coder/<slug>`); a `--detach` tree reports `HEAD`.
- `TAKES 0` on a piece is real, not a seeding bug — `takes/` is tracked and only a few pieces have takes.
- the console warns `THREE.Clock … deprecated` on every load — known noise, not a finding.
- bake and ship write to `takes/` — drive them only with `ATELIER_TAKES_DIR=<scratch copy>` set on the worktree server (see the `verify` skill, which owns what to check once the app runs).
