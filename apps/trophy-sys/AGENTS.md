# AGENTS.md — trophy-sys, PSN trophy tracker

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

`package.json` holds the scripts; `pnpm dev` runs both processes, and from the monorepo root `pnpm dev:trophy-sys`, `pnpm build:trophy-sys`.

`pnpm trophies <cmd>` serves the API's data straight to stdout as JSON: `profile`, `games [limit]`, `game <npCommunicationId>`, `news`,
`snapshot`, `stats`, `stats-sync`, and the Steam side — `steam-profile`, `steam-games`,
`steam-game <appid>`, `steam-wishlist`.

## env — the production kv credentials live in `.env.local`

⚠️ **`.env.local` holds the PRODUCTION kv credentials** (`vercel env pull` regenerates it), so one wrong env-file order in a local run writes to prod. a local run loads three files in order, last one wins (`node --env-file`, never `dotenv`): `.env` (the `NPSSO` seed), `.env.local` (production kv), `.env.dev.local` (blanks the kv credentials). `pnpm dev` and `pnpm trophies` load `.env.dev.local` last, so both work against the local `.trophy-*.json` files and cannot reach production; editing `.env.local` instead would not hold. prove the store is local first (`kit.sh health` → `stateBackend: file`); `worktree:seed` blanks `.env.local` in every tree. `.env.dev.local` also carries a verified recipe for a local Upstash-compatible redis, for when the KV code path itself needs exercising.

- the vars are listed in `.env.example`; in production Vercel injects them. both entrypoints, `src/server/main.ts` and `src/server/cli.ts`, need the `--env-file` flags, and every key the app reads is also listed in `turbo.jsonc`'s `env` array, because Biome's `noUndeclaredEnvVars` reads that list
- `dev:api` reads `API_PORT` / `PORT_OFFSET`, never `PORT`

<!--
a local pnpm dev once moved the live archive from 2122 to 2126 rows with nobody pressing anything (2026-09-05).
a verifier's api landed on the main checkout's :5178 (2026-09-28).
-->


## Querying trophies without the UI (this is how `cw` asks)

Three paths, same JSON:

- Nothing running → `pnpm trophies games | jq …` (auths on its own, ~2s). Preferred over the
  bridge — no process to babysit.
- API running locally → `curl -s localhost:5178/api/games`
- Anywhere → `curl -s https://trophy-sys.vercel.app/api/games`

Routes: `/api/health`, `/api/profile`, `/api/games?limit=`, `/api/games/:npCommunicationId`,
`/api/news`, `/api/settings`, `POST /api/snapshot`, `POST /api/client-error` (the route error
screen reports a render error there; it only logs, so `vercel logs` is where a production one shows).

📌 **Shapes that bit `cw` (2026-09-17)** — `games` and `steam-games` return bare arrays, not
`{games: […]}`. `progress` is base + DLC combined and is not a platinum flag: a platinumed game
can read 89 %; read the platinum trophy's own `earned`, and filter `group == "default"` for base
progress. `playSeconds` / `lastPlayedAt` are `null` on never-launched entries. A PSN title gets
its `npCommId` only after the first launch on the console, so absence from `games` never proves
he does not own it; a `0.0h` `lastPlayedAt` means one launch, not play. The library is ~259 PSN
entries (soundtracks, demos and companion apps count) and ~342 Steam games.

`GET /api/games` filters the hidden ids out; `GET /api/games?all=1` returns everything with
`hidden: boolean` per game (that is the admin's view). `GET /api/settings` is public on purpose —
the charts read it — and only the write is gated.

📌 **Hidden is a rule plus two override lists, never one stored set.** `isNonGame(name, productId)` in
`shared/types.ts` hides soundtracks and artbooks by name, and Sony's own system apps by the
`IP9100-` publisher prefix of the owned list's product id (SHAREfactory, Media Player — the only
field in the feed that tells a non-game apart), so a title bought tomorrow arrives hidden
with nothing written for it — that is the whole point. The stores hold only *deviations*:
`trophy-sys:hidden` the ids the rule would show, `trophy-sys:shown` the ids it would hide. So
`hidden = isNonGame(name) ? !shown.has(id) : hidden.has(id)`, and an unhide survives every later
sync. The write route takes an intent (`{ ids, hide }`), not a finished set: with a rule in play,
leaving a rule-hidden id out of a set is indistinguishable from asking to show it.

⚠️ The rule matches on the name, so it will one day claim a real game whose title contains
`soundtrack` or `artbook`. That is why the admin row says `[x] auto` rather than `[x] hidden`, and
why one press overrules it — the rule is a visible default, never a verdict. `ost` is deliberately
not a pattern: as a substring it claims Ghost of Tsushima.

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
`retry` is 1 globally — react-query's default of 3 would replay a failed scan three more times.

## Conventions

- Naming is subject-first: `gamesFetch`, `stateLoad`, `dateFormat`, `game-list.tsx`. Never
  `fetchGames`.
- Server state is TanStack Query (`hooks/queries.ts`); routing is TanStack Router with real
  paths — `/library`, `/library/$gameId`, `/campaign`, `/journal`, `/console` — not search
  params, because the tabs are navigation and a game is a resource. `router.tsx` holds the tree;
  `layout.tsx`, `library.tsx`, `campaign.tsx`, `journal.tsx` and `console.tsx` are the route
  components. Deep links work because `vercel.json` rewrites every non-`/api` path to
  `index.html`.
- **The root route is a bare `<Outlet />`.** The app's routes hang off a pathless `_shell` layout
  route rendering `Layout`, and `/console` is a *sibling* of `_shell`, not a child — so the console
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
  and `resolve.dedupe` in `vite.config.ts`. Kit components resolve `lucide-react` from kit's own
  manifest; the app lists it only once its own code imports an icon. Import as `@ui/kit/components/button`;
  the monorepo's kit rules in the root `AGENTS.md` apply here now. `theme.css` maps the shadcn L2
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

## where the rest lives

- `src/server/AGENTS.md` — the PSN grant and NPSSO lifecycle, Steam's two lies, every store key, the console's auth; loads with any server file
- `src/web/charts/AGENTS.md` — the /campaign archive, the chart furniture, axis tokens and tick counts, the six measured traps, driving the page; loads with any chart module, and `campaign.tsx` one level up reads it first
- `docs/deploy-history.md` — what each deploy constraint cost
