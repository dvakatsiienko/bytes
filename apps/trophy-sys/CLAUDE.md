# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## trophy-sys — PSN Trophy Tracker

A retro-terminal trophy dashboard over the PlayStation Network API. Two runtimes from one codebase:

- **Web** — Vite + React 19 + Tailwind v4, dev on `:5177`, proxying `/api` → `:5178`.
- **API** — `src/server/`, plain `node:http` locally, the same handler shipped as a Vercel
  function in production.

`src/shared/types.ts` is the contract between them. PSN's raw shapes (`npCommunicationId`,
`trophyTitleName`, `definedTrophies`…) are mapped to these flat types once, at the boundary in
`psn.ts` — nothing downstream ever sees a `psn-api` type.

Deployed: <https://trophy-sys.vercel.app>

## Commands

```bash
pnpm dev          # both processes
pnpm dev:api      # api alone, node --watch, TS run natively (no build step)
pnpm dev:web      # vite alone
pnpm build        # vite build + esbuild bundle of the Vercel function
pnpm typecheck    # both tsconfigs — app (DOM/bundler) and server (node/nodenext)
pnpm lint         # biome
pnpm trophies <cmd>   # same data as the API, straight to stdout as JSON
```

From the monorepo root: `pnpm dev:trophy-sys`, `pnpm build:trophy-sys`.

`pnpm trophies` commands: `profile`, `games [limit]`, `game <npCommunicationId>`, `news`,
`snapshot`.

## Querying trophies without the UI (this is how `cw` asks)

Three paths, same JSON:

- Nothing running → `pnpm trophies games | jq …` (auths on its own, ~2s). Preferred over the
  bridge — no process to babysit.
- API running locally → `curl -s localhost:5178/api/games`
- Anywhere → `curl -s https://trophy-sys.vercel.app/api/games`

Routes: `/api/health`, `/api/profile`, `/api/games?limit=`, `/api/games/:npCommunicationId`,
`/api/news`, `POST /api/snapshot`.

## Auth and state

- `NPSSO` lives in `.env` locally (loaded via `node --env-file`, never `dotenv`) and as a Vercel
  env var in production. Both entrypoints — `src/server/main.ts` and `src/server/cli.ts` — need
  the flag.
- `authGet()` in `psn.ts` holds one in-memory session and refreshes it with the refresh token, so
  the NPSSO→access-code exchange runs once per process.
- `.trophy-state.json` is the "seen trophies" baseline: `npCommunicationId → trophyId[]`.
  `newsFetch({ commit })` diffs live earnings against it; **only `POST /api/snapshot` and
  `pnpm trophies snapshot` write it** — `/api/news` is read-only on purpose, so reading the feed
  never destroys the diff you were about to look at.
- Empty state file = baseline mode: no "new" trophies are reported, the snapshot just seeds.
- Serverless filesystems are read-only, so `isStateWritable` is false on Vercel and
  `/api/snapshot` answers 501 there. Persisting the baseline in production needs a KV store — not
  built.

## Deployment — two constraints that will bite

The Vercel project is linked from this directory (`.vercel/`), root directory `.`, framework Vite.

1. **The function is pre-bundled, deliberately.** `pnpm build:api` esbuilds
   `src/server/handler.ts` into `api/[...path].js` (gitignored). Letting Vercel compile
   `api/**.ts` itself fails: pnpm's symlinked `psn-api` is not traced into the lambda and the
   function dies with `ERR_MODULE_NOT_FOUND`. Bundling sidesteps workspace resolution entirely.
2. **The handler must use Node's `(req, res)` signature.** Vercel's launcher
   (`launcherType: "Nodejs"`) invokes it that way; a web-standard handler returning a `Response`
   is silently dropped and the request hangs until timeout. `main.ts` mounts the same function
   locally.

TypeScript comes from the monorepo root (7.x) — the app pins no version of its own. Vercel's
builder does crash on TS 7, but only when it compiles `api/**.ts` itself; pre-bundling means it
never sees TypeScript. If you ever drop the bundling step, that crash comes back.

## Costs to respect

PSN is slow and rate-limited. `cache.ts` is a 60s TTL memo in front of every route — keep new
routes behind it. `newsFetch` scans only `SCAN_LIMIT` (15) recent titles because each title costs
two PSN round-trips; the library list itself is one call regardless of limit.

## Conventions

- Naming is subject-first: `gamesFetch`, `stateLoad`, `dateFormat`, `game-list.tsx`. Never
  `fetchGames`.
- Server imports carry the `.ts` extension — node's native TS resolution requires it.
- `biome.jsonc` is a nested (`root: false`) config extending the monorepo root. It turns off
  `noImgElement` (a Next.js rule, meaningless here) and excludes generated `api/**`.
- Retro look = gruvbox-material, matching the `sline` statusline palette. Colors are Tailwind
  theme tokens in `src/web/theme.css` (`text-orange`, `bg-bg-lift`, `text-gold`…) — no hex in
  components. Progress bars are `█`/`░` runs from `barRender`, not DOM elements.
- `.panel` + `.panel-title` is the boxed-with-a-label frame used by every region; the title is
  absolutely positioned outside the border, so a panel must not be the scroll container itself —
  put `overflow-y-auto` on a child.
