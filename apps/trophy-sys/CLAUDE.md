# CLAUDE.md — trophy-sys, PSN trophy tracker

A retro-terminal trophy dashboard over the PlayStation Network API. Two runtimes from one codebase:

- **Web** — Vite + React 19 + Tailwind v4, dev on `:5177`, proxying `/api` → `:5178`.
- **API** — `src/server/`, plain `node:http` locally, the same handler shipped as a Vercel
  function in production.

`src/shared/types.ts` is the contract between them. PSN's raw shapes (`npCommunicationId`,
`trophyTitleName`, `definedTrophies`…) are mapped to these flat types once, at the boundary in
`psn.ts` — nothing downstream ever sees a `psn-api` type.

`src/server/playtime.ts` is the other half of that boundary. PSN reports playtime on a separate
endpoint keyed by `titleId`, while trophies are keyed by `npCommunicationId`, and nothing in either
response bridges the two. The join is on name and it is lossy by design — 94 of 108 when measured —
so a `—` in the playtime column means the join missed, not that the title was never played. The
file's own header carries the matching rules and what each one was measured to cost.

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

1. **The function path must exist in git.** `api/handler.js` is a committed 501 stub that
   `pnpm build:api` overwrites — Vercel decides which functions exist at clone time, so a purely
   generated file arrives too late. 📌 A local `pnpm build` leaves the fat bundle in your working
   tree; restore the stub with `git checkout -- api/handler.js` before committing.
2. **The API is esbuild-bundled, and that is mandatory.** Vercel's dependency tracing ships no
   `node_modules` into the function, so any bare specifier surviving the build dies at runtime.
3. **The handler must use Node's `(req, res)` signature.** A web-standard handler returning a
   `Response` is silently dropped and the request hangs until timeout.
4. **Routing is explicit in `vercel.json`, never filename-derived.** The rewrite
   `/api/(.*) → /api/handler` matches any depth; a filename catch-all matches one segment only.

After changing anything about deployment, test a **two-segment** route
(`/api/games/NPWR24415_00`), not just `/api/health` — the single-segment routes stayed green
through the whole bug.

📌 Each of those four lines cost an outage or a measurement. What was tried, what it broke, and how
to tell when constraint 2 is safe to retry: [`docs/deploy-history.md`](docs/deploy-history.md).

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
- Chrome is unselectable: the `body` rule in `theme.css` sets `user-select: none`, and strings
  carrying a real name (game titles, trophy names and descriptions, group names) opt back in with
  Tailwind's `select-text`. Inputs are exempted in the same base layer. `::selection` is derived
  from the palette's blue, so both themes are served by one rule.
- `.panel` + `.panel-title` is the boxed-with-a-label frame used by every region; the title is
  absolutely positioned outside the border, so a panel must not be the scroll container itself —
  put `overflow-y-auto` on a child.
