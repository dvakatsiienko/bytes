---
name: run-cv
description: Run, start or screenshot cv — the personal cv site (`/` and `/cover`), a next dev server for a worktree or a coder's live changes, driven with agent-browser. Use when asked to run cv, start its dev server, show a coder's changes, or screenshot it.
---

# run cv

A Next.js 16 site with two routes: `/` (the cv: brief, tool grid, portfolio) and `/cover` (a short bio). One process, `next dev`, on `3000 + offset` — `:3000` in the main checkout, `:3010` for the first worktree. It reads no secrets and writes nothing: the tracked `apps/cv/.env` is empty, and no page calls an api. Drive it with `agent-browser`.

Paths are relative to the bytes repo root unless they start with `apps/cv`.

## Run: a worktree (the coder path)

```bash
git worktree add .claude/worktrees/<slug> -b coder/<slug> main
pnpm worktree:seed .claude/worktrees/<slug>        # ~4 s; prints «next apps 3010» for offset 10
cd .claude/worktrees/<slug>/apps/cv && pnpm dev    # run_in_background — note its task id
```

In the main checkout the same `pnpm dev` serves `:3000`. Nothing serves cv there by default — check the port before starting.

Ready in ~2 s:

```bash
timeout 60 bash -c 'until curl -sf -o /dev/null localhost:3010; do sleep 1; done'
curl -s -o /dev/null -w '%{http_code}\n' localhost:3010/cover   # 200
```

A `run` pass stops the server when its check is done. A coder serving the tree for dima keeps it up until the worktree goes — that lifetime is the coder's contract (`x:crew-coder`), not this skill's.

## Drive

```bash
export AGENT_BROWSER_SESSION=run-cv
agent-browser set viewport 1280 800
agent-browser open http://localhost:3010
agent-browser wait --load load
agent-browser snapshot -i                           # nav links «cv» «cover», theme buttons Light / Dark / System
agent-browser screenshot <path>/cv-home.png
agent-browser click @e2                             # «cover» (ref from the snapshot)
agent-browser wait --url '**/cover'
agent-browser find role button click --name Dark
agent-browser eval '(() => document.documentElement.className)()'   # ends in «dark»
agent-browser screenshot <path>/cv-cover-dark.png
agent-browser console                               # healthy: «[HMR] connected»
agent-browser close
```

Look at the screenshots: `/` shows a macos-style window with the brief, the photo and the tool grid; `/cover` shows «Hi there, I'm Dima. I do Frontend.» and a paragraph of links.

## Stop

Stop the background task that ran `pnpm dev` (TaskStop with its task id, or the PID captured when it started) — never a PID found by port lookup, and never the PID Next prints in its «already running» message. Then:

```bash
lsof -nP -iTCP:3010 -sTCP:LISTEN    # prints nothing
lsof -nP -iTCP:9229 -sTCP:LISTEN    # prints nothing: the --inspect debugger went with it
git -C .claude/worktrees/<slug> checkout -- apps/cv/AGENTS.md apps/cv/next-env.d.ts   # only if you did not mean to keep next's rewrite
git worktree remove .claude/worktrees/<slug>
```

## Test

cv has no test suite. The check is the typecheck:

```bash
cd apps/cv && pnpm typecheck        # tsc, ~1 s, exit 0
```

## Gotchas

- **`next dev` dirties two tracked files on every start** — it rewrites the next block in `apps/cv/AGENTS.md` and flips `apps/cv/next-env.d.ts` to `.next/dev/types/…`. `git worktree remove` then refuses with «contains modified or untracked files». Revert both, or commit the `AGENTS.md` block on purpose.
- **the four next apps share base port 3000** — `cv`, `figmentation`, `financial` and `x-com-chat` all start on `3000 + offset`. Only one of them can hold the port per tree; check `lsof -nP -iTCP:3010 -sTCP:LISTEN` before starting, and report a taken port — never kill it.
- **`--inspect` binds `127.0.0.1:9229`** — a second next server anywhere on the mac prints «Starting inspector on 127.0.0.1:9229 failed: address already in use» and keeps running. It is only a warning.
- **one `next dev` per app dir** — a second start in the same `apps/cv` exits with «Another next dev server is already running» and names the first server's PID. Use the running one.
- **the portfolio section shows in dev only** — `__DEV__` / `__PROD__` in `src/frags.ts`. A dev screenshot of `/` is not what production shows.
- **the theme sticks** — next-themes keeps the pick in the browser's `localStorage`. After «Dark», `/` also opens dark in the same `AGENT_BROWSER_SESSION`; click «System» or «Light» to reset.
- **hmr reaches the tree in under 3 s** — an edit to `src/app/cover/page.tsx` showed on `:3010` without a reload.
- the Next.js dev-tools button («Open Next.js Dev Tools», bottom left) sits in every dev screenshot — known, not a finding.
