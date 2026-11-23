---
name: chords-verify
description: Load AFTER any change under `apps/chords/` or frame's `hotkeys/serve.ts`, before its report or commit — «verify chords», «/verify», «prove the board», «check the cap renders», a sixth sense round on a chords pr.
---

# chords-verify

prove a chords change in the real page and the real api. start and stop through `chords-run` —
this skill never re-describes launching.

## the handle

- **:7373 is dima's page**, served by the launchd daemon `x-monitor-hotkey-live`. read it, never
  stop, restart or kickstart it.
- **a worktree** runs its own pair from `chords-run` → «lane: worktree, second daemon»: the daemon
  on `http://localhost:7383` (api + built `dist`), vite on the port its log prints (the page under
  test). every write in this skill goes to `:7383` — its `notes.json` and `manual.ts` are the
  copy's own, and `<copy>` below is that `hotkeys` folder.
- **the main checkout** uses vite on `:7374` over the live daemon: reads only. a save there writes
  dima's real files.

## drive

- `agent-browser`, a fresh named session per pass: `export AGENT_BROWSER_SESSION=verify-chords-<topic>`;
  `close` it at the end. `errors --clear` clears nothing, so a new session is the only clean
  error count.
- `set viewport 1280 800`, then `390 844`. absolute screenshot paths only.
- the handles are accessible names: a key is a button `<key> <presses> <action>`, a layer a tab
  `<layer> <bindings>`. the board opens on `hyper`.

## checks — each prints a count, never a payload

1. **the write lock holds** — the same `PUT /api/notes` twice, on a key nothing is filed under
   (`{"key":"verify-probe","layer":"probe","text":"probe"}`): to `127.0.0.1:7383` → `200`, to
   the mac's wi-fi address (`ipconfig getifaddr en0`) → `403` with «writes are taken from this mac
   only»; a read on the wi-fi address → `200`. then the same body with `"text":""` deletes it, and
   `cmp ~/frame/hotkeys/notes.json <copy>/notes.json` prints nothing. a real key here overwrites dima's note.
2. **a cap renders from `manual.ts`** — plant a row on a free key of a layer (`hyper` has `q`
   free on main): `{ action: 'verify probe cap', app: 'raycast', key: 'q', mods: 'hyper' }`. the
   daemon's watch rescans within ~2 s: `/api/hotkeys` holds 1 row with that action, the page shows
   a button `q <n> verify probe cap`, and the `hyper` tab count grows by 1. remove the row after,
   and prove `cmp ~/frame/hotkeys/manual.ts <copy>/manual.ts` prints nothing — an edit that removes a line can eat its
   neighbour's newline.
3. **no key name is clipped** — over the 84 caps, a key label (the cap's first text leaf) with
   `scrollWidth > clientWidth` counts `0`. action labels cut with an ellipsis are by design (10 on
   main).
4. **nothing hides below the fold at 1280×800** — select a key, then every button, textarea and
   input has `getBoundingClientRect().bottom <= innerHeight`: the SELECTED KEY, NOTE and NOTES
   panels all sit on the first screen (page height 919, the rest is padding). `scrollWidth -
   innerWidth` is `0` at both widths.
5. **the tab walk with a key selected** — click a cap, then `tab-walk.sh` from `x:browser-headless`:
   58 stops, 0 flags on main (measured with the probe `q` row planted and selected).
6. **stats renders** — `find role button click --name stats --exact` → `/stats`: the totals row
   and the CHORDS / TIME PER APP lists (DOM bars, no chart svg), `errors` at 0.

7. **the badge is dev only** — on the dev page `[data-slot=build-badge]` reads the branch, with
   `box-shadow` and `backdrop-filter` both `none` (computed); on `:7383` the element is absent.
8. **the run script reads the port** — in `apps/chords`, each on a free `PORT`: `CHORDS_PORT` refusing and
   `CHORDS_DAEMON` a copy → the listener's parent is `script/dev.ts`, and a `kill` of the `with-port` pid
   leaves both ports free within 3 s; a daemon already there → «already served», the page alone, the
   listener's pid unchanged (with `CHORDS_DAEMON` set it refuses, exit 1); an html server there → exit 1; a
   daemon whose answer lacks `modifierOrder` → «older than this page», exit 1.
9. **the built page names its commit** — after `chords:build` on a clean tree, the `build-commit` meta in
   `dist/index.html` equals `git rev-parse HEAD`; with an app file edited it ends in `-dirty`.

## the false lead — `aria-disabled` on caps

dnd-kit sets `aria-disabled="true"` on every cap whose drag is off: 61 of 84 on main, and they are
free keys that still click, with a `pointer` cursor. it means «not draggable», never «not
clickable», so it is not a finding. (61 was measured with the probe `q` row planted, which made
`q` bound; plain main reads about one more.) the essentials script skips `[aria-disabled=true]` in its cover
and cursor checks, so those 61 caps are proven by check 4 and the tab walk, not by essentials.

## essentials

`x:browser-headless`'s `essentials/run.sh` on every touched view — both widths, the tab walk and errors in one line:

```bash
<browser-headless>/essentials/run.sh http://localhost:7383/ --allow 'cursor=Notion' --allow 'tab=role=tab «hyper'
```

the two allows are chords' baselines, and nothing else is allowed:
- `cursor=Notion` — at 390 the `n` cap («Notion») reads cursor `auto`
- `tab=role=tab «hyper` — every layer tab is its own tab stop (13, where a tablist wants one): in a hotkey map the
  layers are the content, so each stays reachable by Tab (dima, 2026-09-29)

main is ✅ with exactly those two (2026-09-29). a state the command does not open (a key selected) takes one
`essentials.js` eval on the open page.

## evidence

- a screenshot of the board with the touched key selected, at 1280 and 390, and of `/stats` when
  it changed
- the check lines above, one each, and `errors: 0` from a fresh session
- the line `essentials: <n> pass · <m> fail`, with the baseline fail named as baseline
- `pnpm --filter chords test` and `pnpm --filter chords typecheck`, read by exit code; a `serve.ts` change adds
  frame's `pnpm exec vitest run hotkeys`
