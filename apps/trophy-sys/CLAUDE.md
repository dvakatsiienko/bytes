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

`src/server/purchased.ts` is why the library is the **owned** library, not the played one.
`getUserTitles` is the trophy endpoint — a title appears there only after it was launched once — so
`purchasedFetch` reads PSN's entitlement list (`getPurchasedGames`, a persisted graphql query on
`web.np.playstation.com/api/graphql/v1/op`, same access token, paged on `start`/`size`) and
`gamesFetch` merges the two. 110 titles became 258. The dedupe reuses `playtime.ts`'s measured name
matcher on the **bare** name — never a second matcher — and `source` on `Game` says which list a row
came from; `gameDetailFetch` answers an empty trophy set for a `psn-purchased` title rather than
404ing.

📌 Two limits are PSN's, not fixable here: the endpoint is **PS4/PS5 only** (nothing from PS3 or
Vita will ever appear), and entitlements are not games — ~16 of the 258 are soundtracks and
artbooks.

Deployed: <https://trophy-sys.vercel.app>

## Commands

```bash
pnpm dev          # both processes
pnpm dev:api      # api alone, node --watch, TS run natively (no build step)
pnpm dev:web      # vite alone
pnpm build        # vite build, esbuild the api bundle, then assemble .vercel/output
pnpm typecheck    # both tsconfigs — app (DOM/bundler) and server (node/nodenext)
pnpm lint         # biome
pnpm trophies <cmd>   # same data as the API, straight to stdout as JSON
```

From the monorepo root: `pnpm dev:trophy-sys`, `pnpm build:trophy-sys`.

`pnpm trophies` commands: `profile`, `games [limit]`, `game <npCommunicationId>`, `news`,
`snapshot`, `stats`, `stats-sync`, and the Steam side — `steam-profile`, `steam-games`,
`steam-game <appid>`, `steam-wishlist`.

📌 `pnpm trophies` and `pnpm dev` load `.env.dev.local` **last**, and it blanks the KV
credentials — so both work against the local `.trophy-*.json` files and cannot reach production.
Editing `.env.local` instead would not hold: `vercel env pull` regenerates it with the production
credentials, which is how a local `pnpm dev` once moved the live archive from 2122 to 2126 rows
with nobody pressing anything (2026-09-05).

`.env.dev.local` also carries a verified recipe for running a real Upstash-compatible redis
locally, for when the KV code path itself is what needs exercising.

## Querying trophies without the UI (this is how `cw` asks)

Three paths, same JSON:

- Nothing running → `pnpm trophies games | jq …` (auths on its own, ~2s). Preferred over the
  bridge — no process to babysit.
- API running locally → `curl -s localhost:5178/api/games`
- Anywhere → `curl -s https://trophy-sys.vercel.app/api/games`

Routes: `/api/health`, `/api/profile`, `/api/games?limit=`, `/api/games/:npCommunicationId`,
`/api/news`, `/api/settings`, `POST /api/snapshot`.

`GET /api/games` filters the hidden ids out; `GET /api/games?all=1` returns everything with
`hidden: boolean` per game (that is the admin's view). `GET /api/settings` is public on purpose —
the charts read it — and only the write is gated.

## Auth and state

Env vars, listed in `.env.example`: `NPSSO`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`,
`STEAM_API_KEY`, `STEAM_ID64`, and the admin trio `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`. Locally
they come from three files, loaded in order and last one wins (via `node --env-file`, never
`dotenv`): `.env` holds `NPSSO`, the Vercel-generated `.env.local` holds the production KV
credentials, and `.env.dev.local` overrides them for dev. In production Vercel injects them. Both entrypoints — `src/server/main.ts` and
`src/server/cli.ts` — need the flags. Every key the app reads must also be listed in
`turbo.jsonc`'s `env` array, because Biome's `noUndeclaredEnvVars` reads that list.

- `authGet()` in `psn.ts` holds one in-memory session and refreshes it with the refresh token, so
  the NPSSO→access-code exchange runs once per process.
- `npssoCandidates()` is **async** and the store outranks the env: the pasted token first,
  `process.env.NPSSO` second. Vercel env vars cannot be written at runtime, so a token pasted
  through the admin has to live in KV — that is the whole reason for the order. Both are *tried*,
  in that order: a refusal on the first falls through to the second, so rotating the Vercel var
  revives a deploy whose pasted token expired, with nobody pasting anything. An env var equal to
  the stored token is dropped from the list — it is the same refusal, not a second chance. Only a
  refusal falls through; a timeout or a PSN outage throws immediately, or one outage would burn
  the fallback too. An expired token throws the sentinel `NPSSO_INVALID` (`src/shared/types.ts`)
  rather than psn-api's multi-line prose, and the header renders it as a link to the admin.
- 📌 **The admin's token panel compares the two on the server and sends only the verdict** —
  `envMatch: same | different | not set`. Neither value may ever enter a status payload. `liveSource`
  says which token actually minted the live session; it is per-process, in memory, null until the
  first mint, and `sessionReset()` clears it — it describes a session, so it must not outlive one.
- 📌 **The store always wins, so the only way back to the env var is to forget the pasted token.**
  `DELETE /api/admin/npsso` → `npssoClear()`, which writes null (the delete both backends already
  understand) and resets the session.
- Steam needs no session — the key is a query param. Two of its answers lie, and `steam.ts`
  guards both. A private profile returns HTTP **200** with an empty envelope, which reads as an
  empty library unless checked. And the envelope key is not always `response`:
  `GetPlayerAchievements` uses `playerstats`, the global percentages use
  `achievementpercentages`, and reading the wrong one yields `{}` — indistinguishable from the
  private case.

📌 **Steam's "Game details" privacy is a separate setting from "My profile", and both must be
public for achievements to read.** A summary reporting `communityvisibilitystate: 3` says nothing
about the second one: with game details closed, every `GetPlayerAchievements` call answers 403
`Profile is not public` while the profile itself still reads public. `steam-game` raises a named
error pointing at the setting rather than returning zero achievements — zero would be the same lie
as reporting a private profile as an empty library.

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

Everything else the app persists rides the same `state.ts` store, one key each:
`trophy-sys:stats`, `trophy-sys:hidden` (`string[]`), `trophy-sys:npsso` (`string`),
`trophy-sys:settings` (a `Settings` object, today one field `effortHideUntouched`).

📌 **`settingsLoad` spreads the store over `SETTINGS_DEFAULT`, so a key already written to the
store outranks the code default forever.** Changing a default therefore reaches a fresh install
and nobody else — the live value has to be flipped through `/admin`, or the key deleted. Measured
on `effortHideUntouched`: the default moved to `true` and production kept answering `false`,
because a stored `false` was already sitting there.

## The admin area

`/admin` is the owner's console — hide games, paste a fresh NPSSO, flip a setting. `src/server/admin.ts`
holds the auth: an HMAC-SHA256 signed `sys_admin` cookie, `timingSafeEqual` on both the password and
the signature, 30-day expiry, `Secure` dropped only on localhost.

📌 **`adminConfig()` returns null when any of `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SECRET` is
missing, and every admin route then answers 503.** There is deliberately no fallback: a deploy
missing a var is shut, never open.

- Routes: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`,
  `GET`+`POST /api/admin/hidden`, `POST`+`DELETE /api/admin/npsso`, `POST /api/admin/settings`,
  `GET /api/admin/token`.
- `GET /api/admin/session` never answers 401 — it reports `authed` either way, because the UI uses
  it to pick a screen.
- `routeResolve` takes a third `RouteRequest` argument carrying the cookie and host headers plus the
  parsed body. Both entrypoints must pass it, or every admin route reads as signed out.

## Deployment — four constraints that will bite

Deploys are **Git-triggered**: the GitHub repo is connected, Root Directory is `apps/trophy-sys`,
"include files outside the root directory" is on so the pnpm workspace install works, and "skip
deployments when there are no changes to the root directory" keeps pushes to other apps from
redeploying this one. Vite plays no part in the API: the `api/` directory is a Vercel convention,
scanned at the deployment root of any project regardless of framework.

1. **The function is declared by the build, never by the `api/` folder.** Vercel decides which
   functions exist by scanning the cloned tree *before* the build runs, so the `api/` convention
   can only ever see a committed file — a bundle the build writes arrives too late, and the deploy
   goes green with every `/api` route 404ing. This app therefore uses the **Build Output API v3**:
   `script/vercel-output.ts` writes `.vercel/output/` (static site, `functions/api/handler.func/`,
   and `config.json`), Vercel consumes that directly, and nothing built is committed. 📌 `api/` is
   gitignored and must stay that way — putting a bundle back there re-enters the trap.
2. **The API is esbuild-bundled, and that is mandatory.** Vercel's dependency tracing ships no
   `node_modules` into the function, so any bare specifier surviving the build dies at runtime.
3. **The handler must use Node's `(req, res)` signature.** A web-standard handler returning a
   `Response` is silently dropped and the request hangs until timeout.
4. **Routing is explicit, never filename-derived.** It lives in the generated
   `.vercel/output/config.json` — `OUTPUT_CONFIG` in `script/vercel-output.ts` — as
   `/api/(.*) → /api/handler`, which matches any depth; a filename catch-all matches one segment
   only. `vercel.json` now carries only the build and ignore commands.

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

Eleven charts and a KPI strip, all visx, all reading one payload — `GET /api/stats`, the trophy
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
  renders on the body in a portal; `BarRows` draws any ranked horizontal-bar chart, and four of the eleven are one
  call to it; `chart-theme.ts` holds the ink. A chart module exports its own derivation and its
  `*_COLUMNS`, so `stats.tsx` only wires.
- **A margin that holds axis text is a token in `chart-theme.ts`, never a literal.** `AXIS_BOTTOM`
  (26), `AXIS_LEFT` (52), `MONTH_AXIS_RIGHT` (26). Each one replaced a set of hand-typed numbers
  that had drifted: bottom ran 36/26/22, left ran 38/42/38 — and 38 was too small for the
  progression's widest tick, so `2,000` drew as `,000` for months. `MONTH_AXIS_RIGHT` holds the
  half of a `YYYY-MM` label that hangs past the last tick.
- **A tick count is derived from the width, never asked for flat.** `monthTicks(innerWidth, n)`
  for the two month axes — both asked for 6 at every width and printed over each other at 390px.
  `decadeTicks` in `effort-scatter.tsx` pins one tick per power of ten: 📌 **d3 abandons the count
  you pass a log scale once the domain spans fewer decades than that count, and emits every minor
  tick instead** — hiding untouched titles narrowed the effort domain enough to print 26
  overlapping labels.

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
- **The root route is a bare `<Outlet />`.** The app's routes hang off a pathless `_shell` layout
  route rendering `Layout`, and `/admin` is a *sibling* of `_shell`, not a child — so the admin
  still renders when every PSN call is failing, which is exactly when a dead NPSSO needs replacing.
  A `defaultErrorComponent` catches the rest. 📌 `useParams({ from })` takes a route **id**, and
  those ids now carry the segment: `'/_shell/library/$gameId'`.
- Server imports carry the `.ts` extension — node's native TS resolution requires it.
- `biome.jsonc` is a nested (`root: false`) config extending the monorepo root. It turns off
  `noImgElement` (a Next.js rule, meaningless in a Vite app) and allows the default export the
  Vercel function needs. Do not delete it as redundant — without it `pnpm lint` reports 4 errors.
- Retro look = gruvbox-material, matching the `sline` statusline palette. Colors are Tailwind
  theme tokens in `src/web/theme.css` (`text-orange`, `bg-bg-lift`, `text-gold`…) — no hex in
  components. Progress bars are `█`/`░` runs from `barRender`, not DOM elements.
- **`@ui/kit` is wired in** — `components.json`, the `@ui/kit: workspace:*` dependency,
  `lucide-react`, and `resolve.dedupe` in `vite.config.ts`. Import as `@ui/kit/components/button`;
  the monorepo's kit rules in the root `CLAUDE.md` apply here now. `theme.css` maps the shadcn L2
  token vocabulary onto the existing gruvbox `--p-*` palette, with `--radius: 0px` — a kit component
  lands retro without per-component overrides, and the raw `--p-*` variables stay the only thing
  redefined per theme.
- `vite.config.ts` keeps `.trophy-*.json` and `.steam-*.json` out of the dev watcher: an admin save
  writes those files locally and used to trigger a full page reload.
- Chrome is unselectable: the `body` rule in `theme.css` sets `user-select: none`, and strings
  carrying a real name (game titles, trophy names and descriptions, group names) opt back in with
  Tailwind's `select-text`. Inputs are exempted in the same base layer. `::selection` is derived
  from the palette's blue, so both themes are served by one rule.
- `.panel` + `.panel-title` is the boxed-with-a-label frame used by every region; the title is
  absolutely positioned outside the border, so a panel must not be the scroll container itself —
  put `overflow-y-auto` on a child.
