# AGENTS.md

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
pnpm build        # vite build, then esbuild the api bundle over api/handler.js
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

Three env vars, listed in `.env.example`: `NPSSO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`. Locally
they come from `.env` plus the Vercel-generated `.env.local` (loaded via `node --env-file`, never
`dotenv`); in production Vercel injects them. Both entrypoints — `src/server/main.ts` and
`src/server/cli.ts` — need the flags. Every key the app reads must also be listed in
`turbo.jsonc`'s `env` array, because Biome's `noUndeclaredEnvVars` reads that list.

- `authGet()` in `psn.ts` holds one in-memory session and refreshes it with the refresh token, so
  the NPSSO→access-code exchange runs once per process.
- The baseline is `npCommunicationId → trophyId[]`, stored in **Upstash Redis** under
  `trophy-sys:baseline` when KV credentials exist, and in `.trophy-state.json` otherwise. The file
  fallback keeps `pnpm dev` and the CLI working with no store attached; `/api/health` reports
  which backend is live as `stateBackend`.
- `newsFetch({ commit })` diffs live earnings against the baseline. **Only `POST /api/snapshot` and
  `pnpm trophies snapshot` write it** — `/api/news` is read-only on purpose, so reading the feed
  never destroys the diff you were about to look at.
- Empty baseline = seed mode: no "new" trophies are reported, the snapshot just records what
  exists.
- `isStateWritable` is false only in the broken case — the file backend on a serverless host. The
  snapshot route checks it *before* scanning, so a deploy missing its KV vars answers 501
  immediately instead of spending 30 PSN calls and dying on `EROFS`.

📌 `newsFetch({ commit: true })` is a read-modify-write over a now-shared store. Nothing triggers
it concurrently today, but a cron or a UI button would need a lock — two overlapping snapshots
would let the loser's trophies resurface as "new".

## Deployment — four constraints that will bite

Deploys are **Git-triggered**: the GitHub repo is connected, Root Directory is `apps/trophy-sys`,
"include files outside the root directory" is on so the pnpm workspace install works, and "skip
deployments when there are no changes to the root directory" keeps pushes to other apps from
redeploying this one. Vite plays no part in the API: the `api/` directory is a Vercel convention,
scanned at the deployment root of any project regardless of framework.

1. **The function path must exist in git.** Vercel decides which functions exist by scanning the
   source tree at clone time. `api/handler.js` is therefore a committed 430-byte stub returning
   501; `pnpm build:api` overwrites it with the real esbuild bundle. A purely generated file
   arrives far too late — the deploy goes green while every `/api` route 404s with Vercel's HTML
   error page. 📌 A local `pnpm build` leaves the fat bundle in your working tree; restore the stub
   (`git checkout -- api/handler.js`) before committing.
2. **The API is esbuild-bundled, and that is mandatory** — but no longer because of `psn-api`.
   Up to 2.18.0 that package was unimportable from ESM in either direction; **2.18.1 fixed it**
   ([#244](https://github.com/achievements-app/psn-api/issues/244)) and a plain
   `import { getUserTitles } from 'psn-api'` now works under Node. The bundle stays because of
   Vercel: dropping it was tried and measured on 2026-08-16, and it fails twice over.
   - Vercel's dependency tracing ships **no `node_modules`** into the function. The compiled
     output keeps `import … from 'psn-api'` as a bare specifier, so the function dies at runtime
     with `ERR_MODULE_NOT_FOUND` — a green build and dead routes, the worst failure shape here.
     (Verified by copying `.vercel/output/functions/api/handler.func` out of the workspace and
     importing it; a pnpm workspace with deps symlinked from the repo root is the likely cause.)
   - Committing `api/handler.ts` as source makes the builder compile TypeScript again, and it
     still crashes on **TS 7** with `Cannot read properties of undefined (reading 'readFile')`.
     Pinning `typescript` to 6.0.3 clears that, but constraint one above remains fatal.

   So: three prod outages came from trying to import `psn-api` "correctly", and one measured
   experiment from trying to drop the bundle. 📌 Before retrying, run `vercel build` locally — it
   costs no deploy quota — and load the built `.func` from outside the repo. If a `node_modules`
   appears inside it, the first blocker is gone and this is worth revisiting. Because the shipped
   function is `.js`, the builder compiles no TypeScript, so this app uses the root's TypeScript
   with no local pin.
3. **The handler must use Node's `(req, res)` signature.** Vercel's launcher
   (`launcherType: "Nodejs"`) invokes it that way; a web-standard handler returning a `Response`
   is silently dropped and the request hangs until timeout. `main.ts` mounts the same function
   locally.
4. **Routing is explicit in `vercel.json`, never filename-derived.** A catch-all named
   `api/[...path].js` looks right and is not: Vercel generated `^/api/([^/]+)$` for it, so
   one-segment routes worked while `/api/games/:id` fell through to a 404 HTML page. The rewrite
   `/api/(.*) → /api/handler` matches any depth. `req.url` keeps the original path across the
   rewrite, which is what `routeResolve` matches on.

After changing anything about deployment, test a **two-segment** route
(`/api/games/NPWR24415_00`), not just `/api/health` — the single-segment routes stayed green
through the whole bug.

## Costs to respect

PSN is slow and rate-limited. `cache.ts` is a 60s TTL memo in front of every route — keep new
routes behind it. `newsFetch` scans only `SCAN_LIMIT` (15) recent titles because each title costs
two PSN round-trips; the library list itself is one call regardless of limit.

📌 `cache.ts` memoizes **successes only**, so a client retry replays the entire scan. That is why
`retry` is 1 globally and 0 for the news query — react-query's default of 3 turns one failed news
load into ~120 PSN round-trips.

## Conventions

- Naming is subject-first: `gamesFetch`, `stateLoad`, `dateFormat`, `game-list.tsx`. Never
  `fetchGames`.
- Server state is TanStack Query (`hooks/queries.ts`); routing is TanStack Router with real
  paths — `/library`, `/library/$gameId`, `/news` — not search params, because the tabs are
  navigation and a game is a resource. `router.tsx` holds the tree; `layout.tsx`, `library.tsx`
  and `news.tsx` are the route components. Deep links work because `vercel.json` rewrites every
  non-`/api` path to `index.html`.
- Server imports carry the `.ts` extension — node's native TS resolution requires it.
- `biome.jsonc` is a nested (`root: false`) config extending the monorepo root. It turns off
  `noImgElement` (a Next.js rule, meaningless in a Vite app) and allows the default export the
  Vercel function needs. Do not delete it as redundant — without it `pnpm lint` reports 4 errors.
- Retro look = gruvbox-material, matching the `sline` statusline palette. Colors are Tailwind
  theme tokens in `src/web/theme.css` (`text-orange`, `bg-bg-lift`, `text-gold`…) — no hex in
  components. Progress bars are `█`/`░` runs from `barRender`, not DOM elements.
- `.panel` + `.panel-title` is the boxed-with-a-label frame used by every region; the title is
  absolutely positioned outside the border, so a panel must not be the scroll container itself —
  put `overflow-y-auto` on a child.
