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

- 📌 a fresh tree needs no hand step: `pnpm worktree:seed` copies `.runtime/dc-runtime.js` from the
  main checkout, and `start` builds the fixture boards when they are missing.

## the edge checks — on the same server, after the walk

Each prints one `✅` or `🐞` line and exits 1 on any 🐞. Each `red:` line is the planted defect that
turned it red once — swap that line, run the check, put the line back. A change to a check is
proven the same way. `broken` and `parallel` write to the job, so `walk` runs first; a walk after
them needs a fresh `start`.

- `$K broken 5291 <job>` — **a broken asks.json**: plants invalid json, waits for «loupe cannot read
  the job», restores the file byte for byte (`cmp`) and waits for the asks to come back.
  - red: `loupe.tsx` `if (job.isError)` → `if (job.isError && !job.data)` — the page keeps the old
    job → `🐞 … no alert · asks · the file same`
- `$K parallel 5291 <job> [n]` — **parallel POSTs**: n notes (default 8) posted to `ask-1` at once;
  every one must answer 200 and land in `answers.json`.
  - red: `server/job.ts` `inTurn(() => writeAnswerNow(jobDir, input))` → `writeAnswerNow(jobDir,
    input)` on a server started after the swap (server code never hot-reloads) → `🐞 … 2 of 8 in
    answers.json`
- `$K loads 5291 [/path]` — **the iframe load counter**: opens the path and counts each board
  iframe's loads from resource timing (`probes/loads.js`); a board loaded twice prints as
  `<file>×<n>`. A check mid-walk reads the same probe with `js loads`. Chrome keeps 250 entries; a
  full buffer fails the check, since it can hide a second load (a view fills 46–65 today).
  - red: `board.tsx` src `?rev=${props.board.rev}` → `?rev=${props.board.rev}&t=${Date.now()}` →
    `🐞 … admin-1728.dc.html×108`, or `🐞 … buffer full: 250 entries` once the reloads fill it
- `$K boards 5291` — **the variant path list**: visits every board path the job holds
  (`/speak/board/<name>`, 25 in the fixture — every board, not only the ones `walk` opens) in page,
  one line each, `✅` when that board is framed whole.
  - red: `route.ts` `board: decodeURIComponent(rest)` → `.toLowerCase()` on it →
    `🐞 /speak/board/Main — framed 0 boards`

## look — after the walk

- **essentials**: `x:browser-headless` → `$K essentials 5291 /speak /speak/ask/2 /speak/ask/3` — the essentials
  at 1280 and 390 on the overview, an ask and a moved target, with design-loupe's three allows:
  - `--allow 'covered=use T1 .* covered by|^… [0-9]+ more$'` — the surface is a canvas: a board that
    runs past the surface edge sits under the panel, and its cover's centre is the panel (at 390 the
    list overflows into a «… N more» line, the same case)
  - `--allow 'tab=«loupe»: jumps back up and left from'` — the boards come first, so the walk wraps
    once from the last board cover to the panel's wordmark
  - `--allow 'axe=target-size'` — axe counts those clipped covers as overlapping the ask rows; the
    pointer lands in the row (`$K probe 5291 target /speak/ask/2` prints `inLink: true`). An ask row
    under 24 px tall would be a real finding: read the probe's box.
- **shots**: `$K probe 5291 ring /speak/ask/2` prints one probe and shoots the page. Read a 2× crop of the
  ring and the panel at wide 1728×1117, standard 1440×900 and narrow 900×1200. A clipped ring, a
  title over another board or cut panel text is a finding even when the walk is green.
- **dark**: `agent-browser set media dark`, then the same shots.

## what the kit cannot reach

- **the browser**: chrome only. dima uses chrome; no safari or webkit check runs (dima, 2026-10-02).
- **the crash sections** (dev only): `?crash=surface`, `?crash=panel` and `?crash=root` each show
  their own fallback, and the other section still answers a click.
