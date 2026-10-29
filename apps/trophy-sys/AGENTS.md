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


## Querying trophies without the UI (this is how ☁️ cloud chat asks)

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

## Deployment

Vercel's git integration is off for this app (`vercel.json` `git.deploymentEnabled: false`); `.github/workflows/deploy.yml` deploys it. The four deploy constraints that will bite: `script/AGENTS.md` (build output, routing) and `src/server/AGENTS.md` (esbuild bundle, handler signature); read them before changing `vercel.json` or anything about deployment.

## Costs to respect

PSN is slow and rate-limited. `cache.ts` is a 60s TTL memo in front of every route — keep new
routes behind it. `newsFetch` scans only `SCAN_LIMIT` (15) recent titles because each title costs
two PSN round-trips; the library list itself is one call regardless of limit. The `retry: 1` reason: `src/web/AGENTS.md`.

## Conventions

- Naming is subject-first: `gamesFetch`, `stateLoad`, `dateFormat`, `game-list.tsx`. Never
  `fetchGames`.
- Web conventions (routing, theme, kit wiring, chrome): `src/web/AGENTS.md`. `components.json` and `vite.config.ts` dedupe wire the kit.
- Server imports carry the `.ts` extension — node's native TS resolution requires it.
- `biome.jsonc` is a nested (`root: false`) config extending the monorepo root. It turns off
  `noImgElement` (a Next.js rule, meaningless in a Vite app) and allows the default export the
  Vercel function needs. Do not delete it as redundant — without it `pnpm lint` reports 4 errors.
- `vite.config.ts` keeps `.trophy-*.json` and `.steam-*.json` out of the dev watcher: an admin save
  writes those files locally and used to trigger a full page reload.

## where the rest lives

- `src/web/AGENTS.md` — routing and the `_shell` layout, theme tokens, the kit wiring, unselectable chrome, `.panel`, the `retry: 1` reason; loads with any web file
- `script/AGENTS.md` — the Vercel Build Output deploy, routing and the two-segment test
- `src/server/AGENTS.md` — the PSN grant and NPSSO lifecycle, Steam's two lies, every store key, the console's auth; loads with any server file
- `src/web/charts/AGENTS.md` — the /campaign archive, the chart furniture, axis tokens and tick counts, the six measured traps, driving the page; loads with any chart module, and `campaign.tsx` one level up reads it first
- `docs/deploy-history.md` — what each deploy constraint cost
