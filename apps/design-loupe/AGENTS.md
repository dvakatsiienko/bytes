# AGENTS.md — design-loupe, where the designer's asks reach dima

The designer ends a round with its asks pinned to elements on its boards. dima opens a link, lands
on the exact spot with the question beside it, and answers in place. The designer reads the answers.

Local only: `pnpm dev`, no vercel project, no deploy. Scripts: `package.json`.

## The authorities — read before changing

- **`PRODUCT.md`** — the want, the users, the v1 cut and its out list. impeccable's file.
- **`FTR.md` + `CONTEXT.md`** — every feature with its check, and the words they use. Read your
  section before changing what the app does.
- **`DESIGN.md`** — the look. impeccable's file: never hand-edit it.
- `docs/adr/0001-the-stack.md` — why iframes on a zoom surface, why two json files.

## The shape

- `answers.json` is `{ "answers": { "ask-N": { at, pick, notes: [{ at, text }], rev } }, "sent": [{ round,
  at, by }] }` — `sent` holds the handovers, `by` is «all answered» or «send round»; an older flat
  file reads as answers with nothing sent.
- `server/job.ts` — the job on disk: `asks.json` (the designer's), `answers.json` (only loupe
  writes it), the boards folder `asks.json` names (`canvas.json` + `*.dc.html`). Each side writes
  only its own file; the server queues its own writes.
- `server/plugin.ts` — the api on the vite dev server: `GET /api/job`, `POST /api/answer`,
  `POST /api/reopen`, `POST /api/send` («send round»), `GET /boards/<file>`. A job file change is pushed to the page as the
  `loupe:job` hmr event.
- `src/components/surface.tsx` + `board.tsx` — the pan / zoom surface, the boards, the ring.
- `src/components/ask-panel.tsx` — the asks and the keys.
- `scripts/loupe.ts` — the designer's side: `round`, `wait`, `mark` (`pnpm loupe --help`).

## The job and the runtime

- **the job dir** is `LOUPE_JOB` (relative to the app), default `~/projects/studio/jobs/speak`.
  The test job is `fixtures/speak`: `pnpm loupe:fixture` copies the studio speak boards into
  `fixtures/speak/boards` (gitignored), plants the pins for `ask-1` and `ask-2`, and clears
  `answers.json`. Tests and verifier rounds use a copy of it, never the studio job.
- **the runtime**: every board loads `./support.js`, the Claude Design runtime. It lives at
  `.runtime/dc-runtime.js` (gitignored, ~190 kB), read from the canvas with `Artifact read <canvas
  url>` and `path: artifact-type/dc-runtime.js`. It is pinned per Design release; refresh it when
  boards render wrong. Without it the boards are blank and `/boards/support.js` answers 404.

## The designer's loop

1. write `asks.json` in the job: `round`, `boards` (the take's project folder, relative to the
   job), and the asks — `id` (`ask-N`), `board`, `kind`, `question`, `options`, `recommend`, `why`.
   Mark each pin in its board's markup as `id="ask-N"` — «target moved» is read from the file's
   text, so a pin the runtime adds later reads as moved.
2. `pnpm loupe round <job>` — checks the file, stamps the round, prints the one push line. Send it
   with `PushNotification`, once. A second call for the same round exits 1.
3. `pnpm loupe wait <job>` under `Monitor` — one block per handover (the last open ask answered, or
   dima's «send round»), never one per answer.
4. `pnpm loupe mark <job> ask-N seen`, then `pnpm loupe mark <job> ask-N applied v1.20` once the
   board changed. Take the pin id off the board when it is applied.

## Gotchas

- **`agent-browser press <key>` sends ~480 keydowns**, and each one is an answer. Drive keys with
  one dispatched `KeyboardEvent` (`design-loupe-run`).
- vite's own watcher would reload the page on any changed `.html`, and a board is html: the job is
  watched with node's `fs.watch` instead, outside vite.
- the wheel is ours, not the library's (ADR-0001): a pinch or ⌘-scroll zooms around the pointer, a
  plain scroll pans. On a `react-zoom-pan-pinch` bump, check `setTransform` and `Virtualize` still
  take the same arguments.
