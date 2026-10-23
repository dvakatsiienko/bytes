# trophy-sys — PSN and Steam sessions, the stored state, the console

loads with any file in `src/server/`; read it before touching a `trophy-sys:*` store key or `/console` from anywhere else. the env-file order and the production-credentials warning are the app's `AGENTS.md` § env.

## the function bundle — two deploy constraints

1. **The API is esbuild-bundled, and that is mandatory.** Vercel's dependency tracing ships no
   `node_modules` into the function, so any bare specifier surviving the build dies at runtime.
2. **The handler must use Node's `(req, res)` signature.** A web-standard handler returning a
   `Response` is silently dropped and the request hangs until timeout.

The other two (the build declares the function, explicit routing) and the deploy test are in `script/AGENTS.md`.

## sessions and state

- `authGet()` in `psn.ts` takes the cheapest session it can get, in this order: the in-memory one,
  the **refresh grant stored in KV**, and only then an NPSSO→access-code exchange. So a cold
  serverless start — which is every cron run — costs one PSN call and spends no NPSSO.

📌 **The grant is a hard ten-day window from the mint, and a refresh does not extend it.**
Measured 2026-09-11: PSN reports `refreshTokenExpiresIn: 863999` (10.0000 days) on a fresh grant,
and the number **counts down** — 863999 → 863830 while the grant aged 172s. So the grant expires
*before* the NPSSO's observed ~25 days, and this path does not make the token renew itself; it only
stops every cold start from spending one.
📌 open reading, 2026-10-23 (dima, the prod panel): «GRANT day 7 • 8 days left» sums to a 15-day
window, against the 10.0 days above. unchecked: read `mintedExpiresIn` on the live grant before
rewriting the measurement. the local NPSSO pasted 2026-09-27 answered 500 on 2026-10-23 (≤26 days;
the first-500 day was never logged).

📌 **At ≤ 3 days left, `sessionRenewEarly` re-mints the grant from the NPSSO while the old one still
works.** A live NPSSO gets a fresh ten-day grant. A dead one is recorded as a death and the refreshed
old session answers, so /console shows the dead token as a yellow note («the grant keeps the app up
for N days») instead of the app going down when the grant ends. Every failure there falls back to the
refreshed session. `psn-auth.test.ts` holds both branches.

⚠️ **The panel prints the grant's age and its remaining days as two separate numbers, and that
separation is the instrument — never fold them into one.** A window derived from the live
`expiresIn` is constant by construction and answers nothing: under a countdown
`(refreshedAt - mintedAt) + expiresIn` returns the published figure again, and under a reset it
grows in lockstep with the age. Both make "has this grant outlived its window" unaskable. The
window therefore comes from `mintedExpiresIn`, stored at the mint and **never overwritten**, and an
age past it *with days still left* is the reading that would overturn the measurement above.

⚠️ **`exchangeRefreshTokenForAuthTokens` never throws on a refused grant — it returns `{}`.**
psn-api does not look at the response status on either token call, so the only error check is the
response shape. `sessionBuild` returns null on a missing `accessToken`; without it a session gets
`expiresAt: Date.now() + undefined * 1000` = `NaN`, which compares false against every clock, so
every later call re-mints — forever, against a rate-limited api.

📌 The refresh token **does not rotate**: PSN answers a refresh with the identical string, so two
processes refreshing one grant cannot disagree and nothing here needs a lock.

⚠️ The grant write is still guarded by **`isAutoWriteSafe`**, because nobody asks for it — it rides
along on whatever route ran. The tempting exemption is that a grant is the session rather than data;
that holds for the token and fails for `mintedAt`, which a local run pointed at production KV would
stamp over with its own. So a local run verifies against the file backend or the local redis recipe
in `.env.dev.local`, never by writing production.
The grant deaths and the NPSSO deaths sit behind the same guard: a death is the measurement, and a
local run must not add its own refusal to the live history.

- Pasting a fresh NPSSO clears the stored grant (`refreshGrantClear` in `npssoSet`). Keeping it
  would let a paste change nothing for up to ten days, and the owner pastes exactly when something
  is broken.
- 📌 **KV is the source of the NPSSO. `process.env.NPSSO` is a bootstrap seed and nothing else.**
  `npssoRead()` is async and reads `npssoLoad()` first, the env var second — so the seed carries a
  deploy that has never been pasted into, and the first paste retires it for good. Vercel env vars
  cannot be written at runtime, and a token expires every few weeks, so a redeploy is the wrong way
  to renew one. There is deliberately no fallback *back* to the env var on a refusal and no way to
  clear the stored token: two live sources confused more than they protected (measured with both
  built, 2026-09-10). The panel says which of the two is in use in one row and stops there.
  An expired token throws the sentinel `NPSSO_INVALID` (`src/shared/types.ts`) rather than
  psn-api's multi-line prose, and the header renders it as a link to `NPSSO_URL`, where a fresh
  token is minted.
- 📌 **A renewed NPSSO reaches a warm server on its next request with nothing else done** — the
  server holds no dead token, only the store does (`psn-auth.test.ts`). The latch was the
  client's: the layout's `profile` query kept its `NPSSO_INVALID` error across route switches.
  `queryClientCreate` now refetches every query holding that error when a PSN-backed query
  (`profile`, `games`, `game`) succeeds — `/stats` and `/settings` answer with PSN down — and
  `useProfile` polls once a minute while it holds it, so an open tab heals with no reload.
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
`trophy-sys:psn-grant` (a `RefreshGrant`), `trophy-sys:psn-grant-deaths` (one entry per grant PSN
refused), `trophy-sys:settings` (a `Settings` object, today one field `effortHideUntouched`),
`trophy-sys:login-failures` (the console's login throttle: an `INCR` counter shared by every
instance; the failure that opens the one-minute window sets its expiry, so hammering cannot stretch
it, and a key found without one gets it back; the file backend keeps it in memory).

📌 A **death goes under its own key, never into the live record** — the pattern the NPSSO uses
and the grant now copies. A refusal is followed immediately by a fresh mint that overwrites the
live record, so a death written there is clobbered by the very call that discovered it.

📌 **`settingsLoad` spreads the store over `SETTINGS_DEFAULT`, so a key already written to the
store outranks the code default forever.** Changing a default therefore reaches a fresh install
and nobody else — the live value has to be flipped through `/console`, or the key deleted. Measured
on `effortHideUntouched`: the default moved to `true` and production kept answering `false`,
because a stored `false` was already sitting there.

## the console

`/console` is the owner's admin page — hide games, paste a fresh NPSSO, flip a setting. `src/server/admin.ts`
holds the auth: an HMAC-SHA256 signed `sys_admin` cookie, `timingSafeEqual` on both the password and
the signature, 30-day expiry, `Secure` dropped only on localhost.

📌 **`adminConfig()` returns null when any of `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_SECRET` is
missing, and every admin route then answers 503.** There is deliberately no fallback: a deploy
missing a var is shut, never open.

- Routes: `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`,
  `GET`+`POST /api/admin/hidden`, `POST /api/admin/npsso`, `POST /api/admin/settings`,
  `GET /api/admin/token`.
- `GET /api/admin/session` never answers 401 — it reports `authed` either way, because the UI uses
  it to pick a screen.
- `routeResolve` takes a third `RouteRequest` argument carrying the cookie and host headers plus the
  parsed body. Both entrypoints must pass it, or every admin route reads as signed out.
