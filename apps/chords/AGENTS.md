# AGENTS.md: chords

the hotkey map. vite + react + tailwind, one page, built to `dist/`, which frame's always-on
`x-monitor-hotkey-live` daemon serves on 7373. it is not deployed anywhere and carries no
`vercel.json`: it draws this mac's bindings and this mac's press log.

**before changing what the app does, read `PRODUCT.md` (the product authority) and your section
of `FTR.md` + `GLOSSARY.md`; before changing how anything renders, `DESIGN.md` (the look
authority).** `DESIGN.md` binds on top of the house ui guides, and its named rules — Zero Blur,
Owner Edge, Earned Accent, Two Hands, Tabular, Cold Ring — are the ones a review will cite.

📌 **`PRODUCT.md` and `DESIGN.md` here are seeded by impeccable only (dima's hands, `init` +
`document`) and keep impeccable's shape — never rewrite them into another one.**
`.impeccable/design.json` is `document`'s sidecar and is regenerated with them, never by hand.

📌 **kit**: chords' ui is its own; only the build badge is the kit's. it moved into bytes as it was, its
move onto `@ui/kit` is a later chunk of [BYT-109](https://linear.app/x-com/issue/BYT-109).

## the mac side is in frame

`~/frame/hotkeys/` holds the daemon (`live.ts`, `serve.ts`), the scan, the hand-kept bindings (`manual.ts`)
and the notes (`notes.json`); its `AGENTS.md` is the contract. launchd, the recorder and every grant stay
there. what the page reads:

- `GET /api/hotkeys` — the scan snapshot: each row with its `chord` spelled, and `modifierOrder` beside
  them. `503` until frame's `pnpm hotkeys:scan` has run once
- `GET /api/presses` — server-sent events, two kinds: `presses` when a chord is pressed,
  `bindings` when a config source moved and the scan reran. the page holds no timer of its own
- `GET /api/stats?window=all|month|week` — the press report; `400` on any other window, `503` before
  the first scan
- `GET`/`PUT /api/notes` — `notes.json`. empty text is the delete
- `POST /api/manual` — a rebind, written surgically into `manual.ts`. `409` when it cannot place
  the edit exactly, `400` when a field is missing or carries a control character

📌 **the page holds no chord rule**: which modifier comes first is frame's `chord.ts`, and it travels
with the bindings answer. the page joins a layer and a key, never sorts modifiers on its own.

📌 **both writing routes take a write from a loopback peer only, demand `application/json` and
refuse an unknown `Origin`.** the phone on the wi-fi reads and never writes; the last two checks
stop a browser page on this mac. the full reasoning is in `serve.ts`'s own header.

## run

- `pnpm dev:chords` — the one run script (`script/dev.ts`): the page on 7374, and the daemon with it when nothing holds 7373
- `pnpm --filter chords chords:build` — writes `dist/`; the live page shows it on the next load, no restart
- `pnpm -C ~/frame hotkeys:map` — opens the served page

📌 a `serve.ts` change in frame needs `pnpm -C ~/frame schedule:restart x-monitor-hotkey-live`; the page is
dima's live tool, so the restart is announced first.

📌 vite does not rewrite `Origin` when it proxies, so a dev page's origin is its own port. the daemon takes
writes from 7373 and 7374 only: a worktree's dev page (an offset port) on the live daemon reads, and its
writes answer 403. `CHORDS_PORT` + `CHORDS_DAEMON` give it a daemon of its own (`chords-run`).

## conventions

- the guides bind here: `x:guide-react` for components, `x:guide-typescript` for types,
  `x:guide-ui-ux` for anything rendered. `DESIGN.md` binds on top of them for this app
- the keyboard layout table in `src/keyboard.ts` carries a `biome-ignore format` line on purpose:
  one line per keyboard row, because the shape of that table is the keyboard
- **a new mark** is fetched by art-kit's `logo.ts` into frame's `logos/marks`, then its file is copied to
  `src/logos/` under the same name; the store stays in frame until frame folds into bytes (dima, 2026-11-23)
