---
name: design-loupe-verify
description: Load BEFORE you verify a design-loupe change or report one done — «verify loupe», «check the ftr lines», «does the ring hold», a coder's «final», a verifier round on apps/design-loupe.
---

# verify design-loupe

The kit drives every `FTR.md` line on a private server and a private copy of the test job, and
prints one `✅` or `🐞` line per check. How to start, drive and stop the app by hand is
`design-loupe-run`; this skill is the walk.

## the walk — every change

From the tree under test (paths relative to `apps/design-loupe`):

```bash
K=.claude/skills/design-loupe-verify/kit.sh
$K start 5291                 # prints job=<dir> port=<port> pid=<pid>
$K walk 5291 <job>            # one line per ftr check, then `ftr: <n> ✅ · <m> 🐞`
$K stop <pid> <job>
```

- `start` copies `fixtures/speak` without its answers, so every walk begins at three open asks. It
  never touches `fixtures/speak` itself or the studio job.
- the walk keys with one dispatched `KeyboardEvent` and pinches through CDP `Input`, never
  `agent-browser press` (~480 keydowns, each one an answer).
- a new or changed ftr line gets its check in `walk` in the same commit, and a probe in `probes/`
  when it reads the page; a line the kit cannot drive stays ⬜ with the reason in the report.

Done when every line the change touched prints `✅`, and the report quotes the `ftr:` line.

## look — after the walk

- **essentials**: `x:browser-headless` → `essentials/run.sh http://localhost:5291/#ask-2 --wait '[data-ring]'`
  at 1280 and 390, and the same at `/#ask-3` (a moved target), with design-loupe's two allows:
  - `--allow 'covered=use T1 .* covered by'` — the surface is a canvas: a board that runs past the
    surface edge sits under the panel, and its cover's centre is the panel
  - `--allow 'tab=«loupe»: jumps back up and left from'` — the boards come first, so the walk wraps
    once from the last board cover to the panel's wordmark
  - `--allow 'axe=target-size'` — axe counts those clipped covers as overlapping the ask rows; the
    pointer lands in the row (`$K probe 5191 target '#ask-2'` prints `inLink: true`). An ask row
    under 24 px tall would be a real finding: read the probe's box.
- **shots**: `$K probe 5291 ring '#ask-2'` prints one probe and shoots the page. Read a 2× crop of the
  ring and the panel at wide 1728×1117, standard 1440×900 and narrow 900×1200. A clipped ring, a
  title over another board or cut panel text is a finding even when the walk is green.
- **dark**: `agent-browser set media dark`, then the same shots.

## what the kit cannot reach

- **the browser**: chrome only. dima uses chrome; no safari or webkit check runs (dima, 2026-10-02).
- **the crash sections** (dev only): `?crash=surface`, `?crash=panel` and `?crash=root` each show
  their own fallback, and the other section still answers a click.
