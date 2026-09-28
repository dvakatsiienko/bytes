---
name: trophy-sys-verify
description: Verify a trophy-sys change against the running web + api pair — drive the library, campaign charts, journal and console in a headless browser, capture evidence. Use after any change under apps/trophy-sys, before its report or commit.
---

# verify trophy-sys

## the handle

- **nothing serves trophy-sys by default.** start the pair with the **start** steps of `trophy-sys-run`, stop it with its **stop** steps (the process group, never one PID) when the pass ends.
- **main** is web `http://localhost:5177` + api `:5178`, **a worktree** is `5177/5178 + offset` — read the tree's `.worktree-offset`, never guess it. vite proxies `/api` to the api.
- `kit.sh health <web port>` before any write: it must say `"stateBackend":"file"` (the tree's own `.trophy-*.json` copies, never production kv) and exits 1 otherwise — stop and report.
- 📌 **a seeded tree drives PSN with dima's live NPSSO and grant** (copied by `worktree:seed`; its prod kv arrives blanked). keep PSN calls to what the check needs, and swap in a fake only through `kit.sh fake`, between `backup` and `restore`.
- routes: `/` → `/library` → the first game at `/library/<npCommunicationId>`; `/campaign` (the charts); `/journal`; `/console` (the admin).

## drive

- `agent-browser` with a named session: `export AGENT_BROWSER_SESSION=verify-trophy-sys-<topic>`; `close` it at the end.
- desktop `set viewport 1280 800`, phone `set viewport 390 844`.
- `open <url>` → `wait 4000` (the PSN calls settle; `wait --load` returns before the charts draw) → probe → `console` → `screenshot <path>`.
- the page scrolls inside `<main>`, not the document. read `AGENTS.md` → «Driving the page» before a screenshot or a hover: a full-page shot comes out empty, and a hover below the fold does nothing.

## checks — each prints a count, never a payload

1. **the api is alive** — `/api/games`, `/api/profile`, `/api/stats`, `/api/settings` answer 200 (`network requests --filter /api`, never unfiltered). a 500 with `NPSSO_INVALID` on games/profile/news is the dead-token state, not your change: the header says «PSN sign-in expired» and the chart panels read «could not read the library». only dima can paste a fresh token (`trophy-sys-run` → gotchas). `/api/stats` and `/api/settings` still work then.
2. **the library** — `/library` lands on `/library/<id>`; the game view has 3 `.panel`s and ~280 trophy images, 0 with `naturalWidth === 0`.
3. **the charts draw** — `/campaign` has 12 `.panel`s, `svg` count ~60 at 1280 (58 at 390), and body text holds 0 «could not read». one `TABLE` radio click turns one chart into one `main table`.
4. **the journal** — 2 panels, 48 game links (`a[href^="/library/"]`), 0 broken images.
5. **the theme sticks** — the L / D / S radios («Light palette, pinned.», «Dark palette, pinned.», «Follows your OS appearance.»): «D» sets `data-theme="dark"` on `<html>` and stores it in `localStorage` key `theme`, so it survives a full `open`. click «S» at the end — it removes both.
6. **nothing scrolls sideways** — `scrollWidth - innerWidth` is `0` at 1280 and at 390; any growth is a finding. at 390 the tab nav wraps to two rows (60 px tall) — that is the fit, not a bug. a hidden `::after` counts toward that width and no element walk sees it — `AGENTS.md` → «Six things measured the hard way» has the `.hint` case and the chart rules (`min-w-0`, tick counts, overlays) a chart change must keep.

a chart change also gets a hover on one mark per touched chart, at 1280 and 390 — the tooltip portals to the body and must sit fully inside the viewport. the heatmap → progression link: click a heatmap day, and the progression panel scrolls into view with a `YYYY-MM` marker. (both read from `AGENTS.md`, not driven when this skill was written. several charts carry clickable marks that open a game — pick the mark by its panel, never «the last `rect`».)

## the kit — `kit.sh` beside this file

every write refuses the main checkout. the order for a state check:

1. `kit.sh health <port>` — the file store, or stop
2. `kit.sh backup` — the tree's `.trophy-*.json` to `$TMPDIR`
3. `kit.sh login <port>` — `POST /api/admin/login` from the page with the tree's `.env` creds, so the cookie lands in the browser session
4. `kit.sh fake dead-npsso [grant-days]` — a dead fake NPSSO beside the tree's real grant with N days left (≤ 3 is the early re-mint window)
5. read `/api/admin/token` **through the signed-in page** (`agent-browser open <web>/api/admin/token`), then /console: the yellow «the grant keeps the app up» note. a /console visit refreshes the real grant, and PSN's own days-left replaces N
6. `kit.sh restore` — the live NPSSO is back

📌 an admin view (`/api/games?all=1`, `/api/admin/*`) is read through the signed-in page. `curl` has no cookie: `?all=1` then answers the public list with the hidden rows dropped, and reads as rows vanishing.

## essentials — against a baseline

`kit.sh essentials <port> <route…>` runs the `x:browser-headless` essentials and the tab walk at 1280 and 390, one line per route. main already fails these; report only growth or a new rule.

- **the baseline is measured, not remembered**: a control tree on main's code — `git worktree add --detach .claude/worktrees/<slug>-control origin/main`, `pnpm worktree:seed` it, `pnpm dev` there — then the same `kit.sh essentials` on both ports, and diff the lines. remove the control tree after.
- known on main (2026-09-28):
  - every route — axe `region` ×3 (`h1`)
  - `/console` — axe `region` ×17 (×18 at 390) and `landmark-one-main` ×1: it renders no `<main>`
  - `/library` — axe `select-name` ×2, `landmark-unique` ×1, ~194 tab-walk flags, cut text with no `title`, and a cursor fail at 390

## evidence

- a viewport screenshot of every touched route at 1280 and 390; for a chart change, one panel shot per touched chart (`screenshot <selector> <path>`)
- the `/api/health` line and the check counts above, one line each
- the line `essentials: <n> pass · <m> fail`, with baseline fails named as baseline

## tests

`cd apps/trophy-sys && pnpm test && pnpm typecheck` — the charts' derivations (`*.test.ts` under `src/web/charts`) are covered there; the browser pass covers the drawing.
