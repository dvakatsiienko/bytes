---
name: trophy-sys-verify
description: Verify a trophy-sys change against the running web + api pair — drive the library, campaign charts, journal and console in a headless browser, capture evidence. Use after any change under apps/trophy-sys, before its report or commit.
---

# verify trophy-sys

## the handle

- **nothing serves trophy-sys by default.** start the pair with the **start** steps of `trophy-sys-run`, stop it with its **stop** steps (the process group, never one PID) when the pass ends.
- **main** is web `http://localhost:5177` + api `:5178`, **a worktree** is `5177/5178 + offset` — `.worktree-offset` holds the offset (`:5187`/`:5188` for the first tree). vite proxies `/api` to the api.
- `curl -s <web>/api/health` must say `"stateBackend":"file"`: the tree reads and writes its own `.trophy-*.json` copies, never the production KV. `"kv"` → stop and report.
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
5. **the theme sticks** — the L / D / S radios («Light palette, pinned.», «Dark palette, pinned.», «Follows your OS appearance.»): «D» sets `dark` on `<html>`, and it survives a full `open`. click «S» at the end — the pick is stored for the session.
6. **nothing scrolls sideways** — `scrollWidth - innerWidth` is `0` at 1280. at 390 main is 11 px over (baseline, below); any growth is a finding. a hidden `::after` counts toward that width and no element walk sees it — `AGENTS.md` → «Six things measured the hard way» has the `.hint` case and the chart rules (`min-w-0`, tick counts, overlays) a chart change must keep.

a chart change also gets a hover on one mark per touched chart, at 1280 and 390 — the tooltip portals to the body and must sit fully inside the viewport. the heatmap → progression link: click a heatmap day, and the progression panel scrolls into view with a `YYYY-MM` marker. (both read from `AGENTS.md`, not driven when this skill was written. several charts carry clickable marks that open a game — pick the mark by its panel, never «the last `rect`».)

## the console — a write path

signing in follows `trophy-sys-run` → drive (credentials from the tree's `.env`, never echoed). a save there writes the tree's `.trophy-*.json` copy. never paste or change the NPSSO in a worktree unless the brief asks — it fixes only that copy.

## essentials — against a baseline

run the `x:browser-headless` essentials on every touched route at 1280 and 390. main already fails these; they are the baseline — report only growth or a new rule:

- every route — axe `color-contrast` ×1 (`.inline-block`), `region` ×3 (×6 on `/console`)
- `/library` — axe `select-name` ×2 (×4 at 390), `landmark-unique` ×1; tab walk: the game-row rings clipped by 1 px left and right, and the walk caps at 200 stops
- at 390 — the page scrolls sideways, `401 > 390`: the tab nav's «CONSOLE» link ends at x 401. `/journal` cuts trophy names and descriptions with no `title`
- `/campaign` — tab walk: the heatmap's month row ring clipped by 1 px
- `/console` — tab walk: the two sign-in inputs show no focus ring

## evidence

- a viewport screenshot of every touched route at 1280 and 390; for a chart change, one panel shot per touched chart (`screenshot <selector> <path>`)
- the `/api/health` line and the check counts above, one line each
- the line `essentials: <n> pass · <m> fail`, with baseline fails named as baseline

## tests

`cd apps/trophy-sys && pnpm test && pnpm typecheck` — the charts' derivations (`*.test.ts` under `src/web/charts`) are covered there; the browser pass covers the drawing.
