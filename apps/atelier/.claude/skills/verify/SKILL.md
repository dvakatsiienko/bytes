---
name: verify
description: Verify an atelier change against the running studio — drive it in a headless browser, capture evidence. Use after any change under apps/atelier, before its report or commit.
---

# verify atelier

## the handle — never start a server

- **main** runs always at `http://localhost:5180` (launchd `x-atelier-live`, the main checkout; a pull updates it through hmr). `GET /api/build` names the branch + sha it serves — check it matches the commit under test.
- **a worktree** runs at `:5190` (its header shows a build badge, the tab title says «atelier · dev»).
- the lan reaches both: `http://afgrundsvisioner.local:5180` or the mac's ip — phone checks go there.

## drive

- `agent-browser`, always with a named session: `export AGENT_BROWSER_SESSION=verify-atelier-<topic>`; `close` it at the end.
- phone: `agent-browser set device "iPhone 12"`; desktop: `set viewport 1280 800`.
- `open <url>` → `wait --load load` → act → `console` (a healthy page logs `[vite] connected.`) → `screenshot <path>`.
- gestures (wheel, pinch) go through CDP `Input.dispatchMouseEvent` — the recipe lives in `x:browser-headless`; a page-script `dispatchEvent` proves nothing.
- headless chrome ignores ⌘A: select a field with `el.select()` in an eval first.

## look — after every drive

- **essentials first**: `x:browser-headless` → its essentials on every touched view, at 1280 and 390. the tab walk runs with atelier's opt-out: `tab-walk.sh --deny '[role=separator]'` — dima wants the panel dividers out of Tab (resizing is mouse-only here).
- then screenshot every state the change touched (selected, hovered, focused, empty, loading) and read a 2× crop of each region. a clipped ring, cut text, an overflow or a misaligned row is a FAIL finding, even when the behaviour passed.

## destructive paths

- bake and ship write take folders. drive them only against a scratch dir: a worktree server started with `ATELIER_TAKES_DIR=<scratch>`, never `:5180`'s real `takes/`. the scratch dir is a **copy** of `takes/` (`cp -R takes/<piece> <scratch>/`), never empty — the take views need takes, and the many-takes state needs copies up to ~12.
- a planted fault (a throw, a broken import) goes in a copy **outside the pnpm workspace**, run with node directly — inside `apps/` pnpm rewrites the lockfile, and in the served tree dima sees the throw.
- a long-lived browser session can hold a stale hmr module and show a fake error after a dev-server restart — open a fresh `agent-browser` session before calling it a bug.
- a motion-loop bake holds one full cpu core for ~70 s while sharp writes the animated webp — expected, not a runaway.

## flows worth driving

- the rail → a piece → its takes list → the viewer (zoom, pan, `l` back to live)
- ⌘K: open it, run a command, confirm the command acted
- «still renders and answers a click» is proven with `elementFromPoint` at the control's centre and **no** `scrollIntoView` — scrolling first hides a covered or pushed-out section
- time day ↔ night, theme `t`, readme frame fit / phone / desktop
