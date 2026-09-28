---
name: figmentation-run
description: Run, start or screenshot figmentation — a next dev server for a worktree or a coder's live changes, driven with agent-browser. Use when asked to run figmentation, start its dev server, show the tesla-landing or clinique demo, or screenshot it.
---

# run figmentation

A Next 16 showcase: a home page with two cards, and two static demo routes, `/tesla-landing` and `/clinique`. One process, no backend, no env file, no database — nothing here writes anywhere. Drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/figmentation`.

## Start: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>        # ~4 s; prints «ports: +20 (… next apps 3020)»
lsof -nP -iTCP:3020 -sTCP:LISTEN                   # must print nothing — a taken port is reported, never killed
cd .claude/worktrees/<slug>/apps/figmentation && exec pnpm dev   # run_in_background — note its task id
```

The port is `3000 + offset` (offset from `.worktree-offset`, 10 per worktree). The main checkout has no always-on server, so there it is `:3000`.

Ready when the page answers:

```bash
timeout 60 bash -c 'until curl -sfo /dev/null localhost:3020; do sleep 1; done'   # ~2 s
```

The one process to know is `pnpm dev`. It leads a process group of five: `pnpm dev` → pnpm → `with-port.ts` → `next dev` → `next-server`, the one that listens.

A `run` pass stops the server when its check is done. A coder serving the tree for dima keeps it up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=figmentation-run
agent-browser set viewport 1280 800
agent-browser open http://localhost:3020
agent-browser wait --load load
agent-browser snapshot -i                          # «Engineering and Design», two cards, each with Visit + Figma file
agent-browser find role button click --name Visit  # first card → tesla-landing (client-side nav)
agent-browser wait --url '**/tesla-landing'
agent-browser screenshot <path>.png
agent-browser open http://localhost:3020/clinique
agent-browser wait --load load
agent-browser screenshot <path>.png
agent-browser console                              # healthy: «[HMR] connected»
agent-browser close
```

Look at each screenshot: home shows two photo cards; tesla-landing shows «Model Y» over a mountain photo; clinique shows the «Even Better Glow™» product page.

## Stop

Stop the background task that ran `pnpm dev` (TaskStop with its task id). That takes the whole process group down. Never kill a PID found by port lookup, and never kill `next-server` alone. Then:

```bash
lsof -nP -iTCP:3020 -sTCP:LISTEN   # prints nothing
ps -o pid=,command= -g <pgid>      # prints nothing — <pgid> is the PID of `pnpm dev`
git worktree remove --force .claude/worktrees/<slug>   # --force: next dev dirtied two tracked files, see gotchas
git branch -D coder/<slug>
```

## Check

```bash
cd apps/figmentation && pnpm typecheck && pnpm lint   # tsc + biome, ~2 s; there is no test suite
```

## Gotchas

- **all four Next apps share base `3000` and `--inspect` on `:9229`.** A second one running prints `Starting inspector on 127.0.0.1:9229 failed: address already in use`. That is a warning only: the server still starts. Only the debugger is missing.
- **`next dev` rewrites two tracked files** in the tree it serves: `apps/figmentation/AGENTS.md` (Next's generated rules block) and `next-env.d.ts` (`.next/types` → `.next/dev/types`). They are not your change. Keep them out of a commit with `git checkout -- AGENTS.md next-env.d.ts` in `apps/figmentation`.
- **«Visit» is a client-side `NextLink`**, so `wait --load load` returns before the route changes. Wait on the url: `wait --url '**/tesla-landing'`.
- **snapshot refs grow per session** — the second snapshot's «Visit» is `@e16`, not `@e6`. Click by role and name (`find role button click --name …`), or re-read the ref from the newest snapshot.
- **clinique is a static mock.** «+», «−» and «ADD TO BAG» have no handlers; `BAG (0)` never moves. That is the design, not a bug.
- **hot reload is isolated**: an edit to the worktree's `src/app/page.tsx` reached `:3020` in ~1 s. `agent-browser wait --text '<new text>'` proves it.
- the console warns about `loading="eager"` on the LCP image and a width-only resize on clinique images — known noise.
- «Figma file» opens figma.com in a new tab — a real external site; leave it alone unless asked.
