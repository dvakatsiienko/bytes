# atelier — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason
- `> purpose:` and `> states:` under a view heading say what the view is for and which states a designer draws

## every screen — the lens ring

> purpose: the studio frame: the piece as large as it fits, the settings on the ring around it, any command from one palette
> states: an edge open · the film strip open · narrow (<1100 px, the ring unrolled)

- ✅ the lens ring
  - given a lit piece is open, 1100 px wide or more
  - then the piece shows as large as it fits whole, and four glass edges hug it: light on top and atmosphere at the bottom, both on the piece's rim, lens on the right, toggles on the left
  - and the corners hold the piece corner (top left), the view corner (top right), the takes corner (bottom left) and the tools corner with the bake (bottom right)
  - decision: the piece is fitted whole, never cropped, so a wide piece leaves the ground above and below it (dima, 2026-09-30: «an art tool should never hide the art»)
- ✅ one edge open at a time
  - when dima presses `1`–`4` or clicks a folded edge
  - then that edge opens with every setting of its group, and any other open edge or the film strip folds
  - and `esc`, the same key again or its fold button folds it
- ✅ find any setting
  - when dima presses `/`
  - then the open edge's find field takes focus (a folded ring opens light first), and typing lists every matching setting of all four edges and the piece corner, each with its edge's name
  - and `/` typed inside a text field types a slash
- ✅ the pieces list, grouped by where each piece ships
  - given any screen
  - when dima opens «pieces» in the piece corner and clicks a piece
  - then its live view opens at `/<piece>` and the row is marked selected
- ✅ a «pieces» title over the pieces list, with the piece count
- 🔎 the «atelier» wordmark goes home
  - when dima clicks the wordmark
  - then the first piece's live view opens; ⌘-click opens it in a new tab
- ✅ theme: system, light, dark
  - when dima presses `t`
  - then the ground behind a day piece switches between light and dark; the glass stays one smoke
  - and a night piece always sits on the dark ground
  - and the theme button in the view corner steps through system, light and dark
- 🔎 the command palette
  - when dima presses ⌘K
  - then a palette lists every command by group (bench, takes, view, settings) and «open <piece>» for every piece
  - and running a command does what its bare key does
  - decision: it opens high, its top edge at 10 % of the window, and stays put while the list filters (dima, 2026-09-26)
- ✅ a worktree build tells itself apart
  - given atelier runs from a seeded worktree (`pnpm worktree:seed` gave it a port offset)
  - then the tab title reads «atelier · dev» and the favicon carries a dot
  - and on main the title stays «atelier»; the view corner shows the branch and sha on both
- ✅ the ring unrolls below 1100 px wide
  - given a window narrower than 1100 px
  - then a bar holds the wordmark, the piece, «pieces», day and night and the commands; the piece follows, then the four edges as tabs, the film strip, and the tools corner with the bake

## /<piece> — the live view

> purpose: the piece under the lamp: look at it, tune its settings, bake it into a take
> states: day · night · motion playing · zoomed · baking (progress) · a flat piece (seed only)

- 🔎 day and night
  - when dima presses `n` or clicks day / night
  - then the piece is drawn for that time of day
- ✅ the readme frame
  - when dima presses `w` or the frame tool, which names the width it shows
  - then the piece shows bare, or inside github's page at 358 px (phone) or 830 px (desktop)
- ✅ motion plays and stops
  - given a piece that moves
  - when dima presses `p` or the motion tool
  - then the motion plays, and the same key stops it
  - and while it plays the tools corner says «motion playing» with the frame of 72 it shows
- 🔎 motion stops when dima leaves the view
  - given motion is playing
  - when dima opens another piece, a take or a compare
  - then the motion stops, and coming back shows a still frame
- ✅ zoom and pan
  - when dima presses `z` or the zoom tool
  - then the image opens zoomable: pinch or ⌘-scroll zooms, drag pans, double-click toggles fit and 2×
- 🔎 back to live from anywhere
  - given dima is zoomed (in the zoom viewer or on the bench), or on a take, or on a compare
  - when dima presses `l` or picks «back to the live view» in ⌘K
  - then the live view of the same piece shows, unzoomed
  - and `l` is the one bare key the zoom viewer lets through
- ✅ copy the image
  - makes: a png of the image on the clipboard
  - when dima presses `c` or the copy tool
  - then the current image is on the clipboard as a png and a toast confirms it
- 🔎 bake a take
  - makes: a take — the image (`bake.webp`, plus `piece.svg` for a flat piece), `settings.json` and `take.json` (seed, note, frames, source hash) — in `takes/<piece>/<nn>-<time>[-<note>]/`
  - when dima presses `b` or the bake button, which asks «bake the first take» on a piece with none
  - then a note field opens with the piece's last note selected
  - and Enter bakes: a «baking <piece> · <time>…» toast, then «baked take <id>» with an «open» action, and the take tops the takes list
- ✅ bake shows progress
  - given a bake is running
  - then its toast names the step it is on (the browser, the stage, `frame n of 72`, the webp, saving) and the seconds so far
  - and the bake button says «baking…» with the step, and fills from the left as a loop's frames land
  - and a motion loop's webp step, the long one, says about how many seconds it takes
  - decision: the estimate learns from the last loop the server encoded — an animated webp costs ~1 µs per frame pixel (70 of homestead's 76 s)
- 🔎 bake a motion loop
  - makes: a take whose `bake.webp` is a looping animated webp, 72 frames by default
  - given a piece that moves
  - when dima runs «bake a motion loop» from ⌘K
  - then a looping animated webp take lands, 72 frames by default
- ✅ the settings on the ring
  - given a lit piece
  - then its seed and look sit in the piece corner, and every other setting on one of the four edges: light, lens, atmosphere, toggles
  - and each shows its exact value, typed or copied (the copy button shows on hover), with a slider, a switch, a colour or a choice; a long name wraps to a second line
  - and on an open edge ↑ ↓ move between the rows and ← → change the value
  - and a flat piece shows only its seed, in one card at the top with a line saying why
- ✅ new seed
  - when dima presses `e` or «new» beside the seed
  - then the piece draws with a new random seed
- ✅ copy all settings, reset to defaults
  - makes: the piece's settings as json on the clipboard (copy json); reset leaves nothing
  - when dima presses `y` or «copy json», `r` or «reset»
  - then the settings are on the clipboard as json, or back to the piece's defaults, and a toast says which
  - and the reset toast offers «undo» for 5 s, which brings the settings back
  - decision: a bare `r` resets every setting, so it carries an undo (dima, 2026-09-30)
- ✅ a flat piece on the plain ground
  - given a flat piece is open
  - then it sits on the plain ground at the largest whole zoom that fits, or scaled down to fit when it is bigger, with its size and zoom under it
- ✅ a favicon's pixel view
  - given a favicon is open
  - then «as it lands» shows it at true size in a browser tab (16 px), a retina tab (32 px), a dark bookmarks bar (16 px) and on a home screen (64 px)
  - when dima picks one of those
  - then the favicon shows drawn at that size, one square per pixel at a whole zoom, with a grid between the pixels from 8×, and the piece corner names the size
  - and the tools corner holds its zoom (fit and the 1×, 8×, 24× that fit) and the grid, which `x` shows or hides
  - and pointing at a pixel names its place and colour; the same tile again, or `l`, goes back to the whole piece
- ✅ a saved drawing redraws by itself
  - when a file under `art/` is saved
  - then the viewport redraws the piece with no reload

## takes — the stack and the film strip

> purpose: every bake of this piece, to compare, keep or park
> states: none yet · the stack · the film strip (many scroll) · stashed filter · baking

- ✅ the takes stack
  - given a piece with takes
  - then its newest takes stack in the bottom-left corner, the shown one in front, over a line with its id, «● current» when it ships, and how many there are and how many are stashed
  - given a piece with 0 takes
  - then the corner says «no takes yet» and how to bake the first
- ✅ the film strip
  - when dima presses `g` or clicks the stack
  - then the takes open in a row along the bottom edge, with the shown take's facts, and `g` or «fold» folds them back
  - and while a bake runs its tile leads the row with the step it is on
- ✅ filter all, current, stashed
  - when dima picks a filter in the film strip
  - then the strip shows only those takes, or a line saying there are none
- ✅ a take tile
  - then each tile shows the thumbnail, the id (which names the time of day), the note or «no note», «● current» when it ships and «stashed» with a dashed edge when stashed
  - and a right-click offers open (⏎), compare with the shown take (v), stash or unstash (s), promote (⇧⏎), use its settings (u), copy png (c); each key works while the menu is open
- ✅ the shown take's ring shows whole, first and last tile included
- 🔎 previous and next take
  - when dima presses `[` or `]`, or picks them in ⌘K
  - then `]` opens the next take down the list (older) and `[` the next one up (newer); from the live view `]` starts at the newest and `[` at the oldest

## /<piece>/take/<id> — one take

> purpose: one bake's record: its facts, its note, and the promote or stash decision
> states: current · stashed (with its two reasons)

- ✅ the take's facts
  - then the take card, beside the lens edge, shows time, seed, frames, source hash and when it was baked
  - and opening the lens edge folds the take card until the edge folds again
- 🔎 edit the note
  - when dima edits the note and leaves the field
  - then the note is saved and the takes list shows it
- 🔎 promote
  - when dima presses «promote»
  - then this take becomes the current one for its time of day and ships next
- 🔎 stash with two reasons, or unstash
  - when dima presses «stash…», fills «what is good about it» and «why it does not fit yet», and submits
  - then the take carries a stash chip and both reasons show on its page; «unstash» takes it back
- 🔎 compare with another take
  - when dima picks «compare…» and a second take
  - then the compare view opens with both
- 🔎 use its settings
  - when dima presses «use its settings»
  - then the live view's settings become this take's
- 🔎 download
  - makes: the take's image as `<piece>-<id>.webp`, `.avif`, or `.svg` for a flat piece
  - then webp, avif and svg (a flat piece) download under `<piece>-<id>.<ext>`

## /<piece>/compare/<a>/<b> — two takes

> purpose: two takes side by side, to pick the better one
> states: slider · side by side

- ✅ compare as a slider or side by side
  - when dima switches the compare mode in the compare card, beside the lens edge
  - then the two takes show under one sliding divider, or next to each other with their notes

## errors

> purpose: a broken piece or section says so in its own box, the studio keeps working
> states: flat crash · lit build fail · root fallback

- ✅ a crashed section stays in its box
  - given a dev build, when `?crash=<section>` loads for any of the six sections (header, pieces, takes, toolbar, viewport, panel)
  - then that section shows «<what> stopped drawing» and «try again» in its own box
  - and the other five still render and answer a click; «try again» brings it back
  - and a throw in a section's own component, before its hooks run, stays in that section too: each boundary wraps its section from the parent
- ✅ a crashed flat piece says so
  - given a dev build, when `?crash=piece` loads on a flat piece
  - then «the piece stopped drawing» shows in the viewport, and the pieces list still answers a click
  - and «try again» brings the piece back
- ✅ a lit piece that fails to build says so
  - given a dev build, when `?crash=piece` loads on a lit piece
  - then «the scene did not build: <error>» shows in the viewport, and the rest of the studio keeps working
- ✅ a crash outside every section offers a reload
  - given a dev build, when `?crash=root` loads
  - then «atelier stopped drawing» shows with «reload the studio», and the button reloads the page
- ✅ a production build ignores `?crash=`
  - given a production build, when any `?crash=` loads
  - then the studio draws as it does without it

## scripts

- ✅ bake from the terminal
  - makes: the same take folder the bake button makes
  - when an agent runs `pnpm atelier:bake <piece> [day|night|both] [--loop [frames]]`
  - then the same take lands as the bake button makes (one code path, `server/bake.ts`)
  - and it prints the dir each take landed in — under `ATELIER_TAKES_DIR` when that is set
- ✅ ship
  - makes: with `--write`, each current take copied into the one repo its piece ships to (frame, bytes or the profile, per `art/pieces.ts`) as `<repo>/<ship path>-light|dark.<svg|webp>`; `--to <dir>` writes under that dir instead
  - when an agent runs `pnpm atelier:ship [piece…]`
  - then it prints the plan; with `--write` it copies each current take into its piece's repo under `assets/atelier/`, and commits nothing
- ✅ probe a piece
  - when an agent runs `pnpm atelier:probe <piece> [day|night]`
  - then it prints the stage's `data-rendered` value with the seconds it took, and every console error
  - and it exits 1 when the piece did not render or the page logged an error, 2 for an unknown piece
- ✅ icon sizes
  - makes: `<piece>.svg` and 6 png sizes — `<piece>-16|32|48|180|192|512.png` — in `out/icons/<piece>/`
  - when an agent runs `pnpm atelier:icons <piece>`
  - then svg and png at 16–512 px land in `out/icons/<piece>/`
