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
`snapshot`, `stats`, `stats-sync`.

📌 `pnpm trophies` loads `.env.local`, so it reads **and writes the production Upstash store**.
Drop that flag — `node --env-file=.env src/server/cli.ts <cmd>` — to work against the local
`.trophy-*.json` files instead. That is the way to fill an archive for local chart work without
touching prod.

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
   source tree at clone time, so `api/handler.js` is committed — today as the built bundle, which
   `pnpm build:api` regenerates. A file that only appears during the build arrives too late: the
   deploy goes green and every `/api` route 404s. 📌 A local `pnpm build` rewrites it, so check the
   diff is real server work before committing it.
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

## The /stats charts

Twelve charts and a KPI strip, all visx, all reading one payload — `GET /api/stats`, the trophy
fan-out cached in Upstash under `trophy-sys:stats`.

- **The archive is versioned.** `ARCHIVE_VERSION` in `stats.ts` gates it: a stored archive whose
  version does not match reads as empty, and the route's own "rescan trophies" button refills it.
  Bump it whenever the stored shape changes — cheaper and safer than migrating, because the scan
  is one button and eight seconds.
- It carries earned trophies (`trophies`) and, for titles still under way, the unearned ones
  (`remaining`) with their live counters. "Closest to done" is the only chart needing the second
  list, and it is why the payload roughly doubled.
- **Reach for the furniture before writing SVG.** `ChartFrame` gives the panel, the chart/table
  toggle and the accessibility floor; `ChartTooltip` + `TooltipLayer` give the one tooltip, which
  renders on the body in a portal; `BarRows` draws any ranked horizontal-bar chart, and four of the twelve are one
  call to it; `chart-theme.ts` holds the ink. A chart module exports its own derivation and its
  `*_COLUMNS`, so `stats.tsx` only wires.

### Charts talking to each other

Clicking a day in the activity heatmap marks that month on the progression
timeline. **The two charts share one `YYYY-MM` string and nothing else** — the
route holds `focusMonth` state and a `ref` on the progression wrapper, the
heatmap emits a date, the progression takes a `focusMonth` prop and draws a
marker. Keep any future cross-chart link this shape: a value in the route, never
an import between chart modules.

The timeline draws every month it has at once, so "scroll to that date" is
`scrollIntoView` on the panel plus the marker. There is no horizontal scrolling
to drive.

### Six things measured the hard way

- 🚫 **Never put motion's `animate` transform and an SVG `transform` attribute on one node.**
  Motion writes its scale into the `transform` style, which replaces the attribute outright — the
  night-owl columns all drew at hour zero. Place with a plain `<g transform>`, animate with a
  `<motion.g>` inside it. `scatter-mark.tsx` is the reference shape.
- 🚫 **This palette carries two categorical series, not six.** gruvbox-material is desaturated by
  design; its purple and blue sit ΔE 1.5 apart under deuteranopia, measured with the `dataviz`
  validator. To separate many things use one hue at several strengths (the activity and night-owl
  grids) or position, never a hue per item. The one two-colour split — platinum against the rest —
  also carries a shape, so colour is never alone.
- 🚫 **No chart has two y axes.** The velocity band under the progression area is a second plot
  sharing the x axis, not a second scale on the same one.
- 🚫 **An overlay positioned inside a chart is clipped three times over.** visx's `ParentSize`
  wraps children in an `inset: 0; overflow: hidden` box — that one is invisible until you walk the
  computed styles — and the panel body and `<main>` both scroll. The tooltip is 177px tall inside a
  134px chart, so no flip can fit it; `TooltipLayer` portals to the body and positions against the
  viewport instead. Any future overlay (a popover, a menu) needs the same escape.
- 🚫 **A grid item needs `min-w-0`, or a wide chart stretches the page.** A grid item's
  `min-width` defaults to `auto`, so the heatmap's 783px SVG widened its own column instead of
  scrolling inside it. `ChartFrame` carries the class; so must any new wrapper around a panel.
- 📌 **A hidden pseudo-element still counts toward the page's scroll width.** `.hint::after` is
  `position: absolute` and up to 15rem wide, so the theme toggle at the end of the header pushed a
  390px viewport out to 498px — invisibly, because `querySelectorAll('*')` never sees a
  pseudo-element. Anything `.hint` near a right edge takes `hint-right` as well.

### Driving the page

`agent-browser` is the driver; it documents itself with `agent-browser skills get core`. Two
things about **this** page waste a run otherwise:

- A full-page screenshot comes out empty, because the page scrolls inside `<main>` rather than the
  document. Capture the viewport, or one panel by selector.
- A hover below the fold silently does nothing. Scroll the panel into view first, then move the
  mouse to a mark's centre — marks are bare SVG, so they carry no accessibility refs and their
  geometry has to come from `eval`.

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
