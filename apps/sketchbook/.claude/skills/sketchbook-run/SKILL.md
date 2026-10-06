---
name: sketchbook-run
description: Run, start or screenshot sketchbook — the prototype platform's vite dev server in a worktree, driven with agent-browser. Use when asked to run sketchbook, start its dev server, show a proto or an archived page, or check a coder's proto changes.
---

# run sketchbook

A Vite + React app with no backend: the live proto, archived pages and bench lanes are all files under `src/protos/`. **Nothing serves it by default** — no launchd job, `:5179` is free in the main checkout. Run it in a worktree on `5179 + offset` and drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/sketchbook`.

## Start

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>   # ~5 s; last line names the port: «sketchbook 5189» (5199 when another tree holds +10)
lsof -nP -iTCP:<port> -sTCP:LISTEN           # prints nothing, or the port is taken: report it, never kill it
```

Start the server as a background task and capture its process group on the first line (Bash `run_in_background`, note the task id):

```bash
cd .claude/worktrees/<slug>/apps/sketchbook && echo "pgid $(ps -o pgid= -p $$ | tr -d ' ')" && exec pnpm dev
```

Ready in ~1 s:

```bash
timeout 40 bash -c 'until curl -sf localhost:<port> >/dev/null; do sleep 1; done' && echo READY
```

A `run` pass stops the server when its check is done. A coder serving the tree for dima keeps it up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

Read the tree first — `pnpm proto:list` in `apps/sketchbook` shows the archives and the live proto (or `→ nothing live`).

```bash
export AGENT_BROWSER_SESSION=sketchbook-run
agent-browser set viewport 1280 800
agent-browser open http://localhost:<port>
agent-browser wait --load load
agent-browser get url              # "/" with a live proto; /bench/cv-design when nothing is live
agent-browser snapshot -i          # nav: bench lanes, «pages» archive links, theme button; then the proto
agent-browser open http://localhost:<port>/pages/002-memory-visualization   # any archive, by folder name
agent-browser screenshot <path>.png
agent-browser console              # healthy: «[vite] connected.»
agent-browser close
```

Look at the screenshot. A live proto shows the header (`sketch·book`, «answering» + its question) and the ticket strip. An archive shows its own page under the nav, with the page link underlined.

## Stop

Stop only what you started. Either path takes pnpm, `with-port` and vite together:

- TaskStop with the task id of the `pnpm dev` call
- or `kill -TERM -- -<pgid>` with the pgid printed at start — never a PID found by port lookup, never the pnpm PID alone (its children survive)

📌 A `run_in_background` task gets its own group: the printed pgid equals the `pnpm dev` PID. A server started with `&` inside another shell shares that shell's group — there the pgid kill takes your own shell too, so stop the captured PID and its `pgrep -P` children instead.

Then prove it, and clean up:

```bash
lsof -nP -iTCP:<port> -sTCP:LISTEN; pgrep -g <pgid> | wc -l    # nothing, then 0
git worktree remove --force .claude/worktrees/<slug> && git branch -D coder/<slug>
```

`--force` is needed only when the tree holds untracked proto folders you made on purpose — read `git status --short` in the tree first.

## Test

```bash
cd apps/sketchbook && pnpm test    # vitest, 1 file, ~1 s: a shift keeps the old page
```

## Gotchas

- **`proto:new`, `proto:shift` and `proto:clear` write to `src/protos/`** — run them only in your own worktree, never in the main checkout or a coder's tree. `proto:new` exits 1 when a proto is already live; use `proto:shift` then.
- **after a shift, reopen the page** — vite hot-updates `frame.tsx` (the `import.meta.glob` changed), but the nav only lists the new `003-…` archive after `open` again.
- the empty-proto placeholder text names the folder it was made in, so a shifted blank still says `build it in src/protos/current-<old topic>` — cosmetic, not a broken shift.
- vite listens on `[::1]` only — `localhost` works, `127.0.0.1:<port>` does not.
- the ticket strip reads `src/frame/tickets.ts`; its chips show whatever ids are written there, not live linear state.
