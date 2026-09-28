---
name: sketchbook-verify
description: Verify a sketchbook change against the running prototype platform — drive the live proto, the bench lanes and the archived pages in a headless browser, capture evidence. Use after any change under apps/sketchbook, before its report or commit.
---

# verify sketchbook

## the handle

- **nothing serves sketchbook by default.** start it with the **start** steps of `sketchbook-run`, stop it with its **stop** steps when the pass ends.
- **main** is `http://localhost:5179`, **a worktree** is `5179 + offset` — `.worktree-offset` holds the offset (`:5189` for the first tree). vite listens on `[::1]` only: use `localhost`, never `127.0.0.1`.
- read the tree before you drive: `pnpm proto:list` in `apps/sketchbook` names the archives and the live proto, or prints `→ nothing live`.
- routes: `/` (the live proto), `/bench/<lane>` for each `src/protos/bench-<lane>`, `/pages/<NNN-topic>` for each archive folder.

## drive

- `agent-browser` with a named session: `export AGENT_BROWSER_SESSION=verify-sketchbook-<topic>`; `close` it at the end.
- desktop `set viewport 1280 800`, phone `set viewport 390 844`.
- `open <url>` → `wait --load load` → probe → `console` (healthy: `[vite] connected.`, zero error lines) → `screenshot <path>`.

## checks — each prints a count, never a payload

1. **`/` lands right** — with a live proto, `get url` stays `/` and the header shows `sketch·book`, «answering» and the proto's question, then the ticket strip. with nothing live it redirects to `/bench/cv-design`.
2. **the nav matches the folders** — the nav's links equal the bench lanes plus the archives on disk. main: 5 lanes (`cv-design`, `cv-frontend-design`, `cv-impeccable`, `cv-taste`, `cv-theme-designer`) and 2 pages. a folder with no link, or a link with no folder, is a finding.
3. **every route renders** — open each lane and page at 1280 and 390: zero console errors, zero broken images, and a page height over one screen (main: 1600–5300 at 1280). a blank `main` or «no live proto» on a lane is a finding.
4. **no sideways scroll on a lane** — `scrollWidth - innerWidth` is `0` on every bench lane at both widths.
5. **the theme button flips `data-theme`** — `<html data-theme>` starts from the OS (`prefers-color-scheme`), the button («switch to dark theme») flips it, and it survives a nav link click. a full `open` resets it to the OS value: nothing is stored, by design. `agent-browser set media dark` tests the dark start.
6. **a live proto with variants** — the variant bar shows only when the proto has 2+ variants; each button sets `?v=<key>` and swaps the view. drive every variant and screenshot each. (read from `src/frame/variant-bar.tsx` — main had no live proto to drive it on.)

## essentials — against a baseline

run the `x:browser-headless` essentials on every touched route at 1280 and 390. main passes clean on `/bench/cv-design` (tab walk: 14 stops, 0 flags).

these archive fails are on main already. an archive is frozen, so they are the baseline — report only growth:

- `/pages/001-session-progress-board` — axe `color-contrast` ×74, `page-has-heading-one` ×1
- `/pages/002-memory-visualization` — `scrollWidth - innerWidth` is `24` at both widths (the stat grid runs edge to edge), and the page draws its own «light» chip under the frame's theme button

## evidence

- a screenshot of every touched route at 1280 and 390; for a proto change, one per variant
- the check counts above, one line each
- the line `essentials: <n> pass · <m> fail`, with baseline fails named as baseline

## destructive paths

`proto:new`, `proto:shift` and `proto:clear` write to `src/protos/` — run them only in your own worktree. after a shift, `open` the page again: the nav lists the new archive only after a reload.
