# atelier — product map

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- decision: lines record a choice and its reason

## every screen — header and pieces

- ✅ the pieces list, grouped by where each piece ships
  - given any screen
  - when dima clicks a piece in the pieces list
  - then its live view opens at `/<piece>` and the row is marked selected
- ✅ a visible «PIECES» title over the pieces list, matching TAKES, with the piece count
- ✅ the «atelier» wordmark goes home
  - when dima clicks the wordmark
  - then the first piece's live view opens; ⌘-click opens it in a new tab
- ✅ theme: system, light, dark
  - when dima presses `t`
  - then the theme switches between light and dark; «system» is a click on the header control
- ✅ the command palette
  - when dima presses ⌘K
  - then a palette lists every command by group (bench, takes, view, settings) and «open <piece>» for every piece
  - and running a command does what its bare key does
- ⬜ a worktree build tells itself apart
  - given atelier runs from a worktree
  - then the header shows the branch and sha, and the tab title reads «atelier · dev»
- ✅ the three panels stack below 1100 px wide

## /<piece> — the live view

- ✅ day and night
  - when dima presses `n` or clicks day / night
  - then the piece is drawn for that time of day
- ✅ the readme frame
  - when dima presses `w` or picks fit / phone / desktop
  - then the piece shows bare, or inside github's page at 358 px (phone) or 830 px (desktop)
- ✅ motion plays and stops
  - given a piece that moves
  - when dima presses `p` or the play button
  - then the motion plays, and the same key stops it
- ✅ motion stops when dima leaves the view
  - given motion is playing
  - when dima opens another piece, a take or a compare
  - then the motion stops, and coming back shows a still frame
- ✅ zoom and pan
  - when dima presses `z` or the zoom button
  - then the image opens zoomable: pinch or ⌘-scroll zooms, drag pans, double-click toggles fit and 2×
- ✅ back to live from anywhere
  - given dima is zoomed (in the zoom viewer or on the bench), or on a take, or on a compare
  - when dima presses `l` or picks «back to the live view» in ⌘K
  - then the live view of the same piece shows, unzoomed
  - and `l` is the one bare key the zoom viewer lets through
- ✅ copy the image
  - when dima presses `c` or the copy button
  - then the current image is on the clipboard as a png and a toast confirms it
- ✅ bake a take
  - when dima presses `b` or the bake button
  - then a note field opens with the piece's last note selected
  - and Enter bakes: a «baking <piece> · <time>…» toast, then «baked take <id>» with an «open» action, and the take tops the takes list
- 🧭 bake shows progress
  - given a bake is running
  - then dima sees what it is doing now (a step, the files being written, or an eta), not only a spinner
- ✅ bake a motion loop
  - given a piece that moves
  - when dima runs «bake a motion loop» from ⌘K
  - then a looping animated webp take lands, 72 frames by default
- ✅ the settings panel
  - given a lit piece
  - then the side panel shows its settings grouped by job (look, light, depth and lens, atmosphere …), each with a slider, an exact number and a copy button
  - and a flat piece shows only its seed, with a line saying why
- ✅ copy all settings, reset to defaults
  - when dima presses «copy all» or «reset» at the panel's foot
  - then the settings are on the clipboard as json, or back to the piece's defaults, and a toast says which
- ⬜ a saved drawing redraws by itself
  - when a file under `art/` is saved
  - then the viewport redraws the piece with no reload

## takes list

- ✅ filter all, current, stashed
  - when dima picks a filter
  - then the list shows only those takes, or a line saying there are none
- ✅ a take row
  - then each row shows the thumbnail, the time of day, the note or «no note», and a current or stash chip
  - and a right-click offers open, compare with the shown take, promote, stash or unstash, use its settings, copy png
- ✅ the selected row's ring shows whole, first and last row included
- ✅ previous and next take
  - when dima presses `[` or `]`, or picks them in ⌘K
  - then `]` opens the next take down the list (older) and `[` the next one up (newer); from the live view `]` starts at the newest and `[` at the oldest

## /<piece>/take/<id> — one take

- ✅ the take's facts
  - then the side panel shows time, seed, frames, source hash and when it was baked
- ✅ edit the note
  - when dima edits the note and leaves the field
  - then the note is saved and the takes list shows it
- ✅ promote
  - when dima presses «promote»
  - then this take becomes the current one for its time of day and ships next
- ✅ stash with two reasons, or unstash
  - when dima presses «stash…», fills «what is good about it» and «why it does not fit yet», and submits
  - then the take carries a stash chip and both reasons show on its page; «unstash» takes it back
- ✅ compare with another take
  - when dima picks «compare…» and a second take
  - then the compare view opens with both
- ✅ use its settings
  - when dima presses «use its settings»
  - then the live view's settings become this take's
- ✅ download
  - then webp, avif and svg (a flat piece) download under `<piece>-<id>.<ext>`

## /<piece>/compare/<a>/<b> — two takes

- ✅ compare as a slider or side by side
  - when dima switches the compare mode
  - then the two takes show under one sliding divider, or next to each other with their notes

## errors

- ⬜ a crashed piece says so
  - given a piece throws while drawing
  - then «atelier stopped drawing» shows in its place instead of a blank page

## scripts

- ✅ bake from the terminal
  - when an agent runs `pnpm atelier:bake <piece> [day|night|both] [--loop [frames]]`
  - then the same take lands as the bake button makes (one code path, `server/bake.ts`)
  - and it prints the dir each take landed in — under `ATELIER_TAKES_DIR` when that is set
- ✅ ship
  - when an agent runs `pnpm atelier:ship [piece…]`
  - then it prints the plan; with `--write` it copies each current take into frame, bytes and the profile repo under `assets/atelier/`, and commits nothing
- ✅ icon sizes
  - when an agent runs `pnpm atelier:icons <piece>`
  - then svg and png at 16–512 px land in `out/icons/<piece>/`
