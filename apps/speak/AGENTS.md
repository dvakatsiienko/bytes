# AGENTS.md: speak

read-aloud on dima's mac, in two parts that share this home:

- **x-speak**, the daemon (`daemon/`, swift, launchd): owns the hotkeys, the engines and the pill
- **the voice admin** (`src/`, vite + react + tailwind, one page): built to `dist/` and served with its api by
  `server.ts` on 127.0.0.1:7386, always on through the launchd job `x-speak-admin`

not deployed anywhere, and it carries no `vercel.json`: it edits this mac's `daemon/config.json` and talks to this mac's daemon.

- dev: `pnpm dev:speak` runs vite on 7387, proxying `/api` to the admin on 7386; a worktree gets both ports plus its offset, and each side binds an explicit `PORT` when one is set
- a ui change is live after `pnpm --filter speak admin:build` (the server reads `dist/` on every request)
- a `server.ts` change needs `pnpm -C ~/frame schedule:restart x-speak-admin`

📌 before changing what the app does, read your section of `FTR.md` + `GLOSSARY.md` and `PRODUCT.md` (impeccable `init`, the product record);
`DESIGN.md` (impeccable `document`) is the look record — read it before changing how anything renders. both
are impeccable's files: change them through it, never by hand.
📌 before a design or build change, read `docs/readaloud-playbook.md`: the read-aloud practices, the bar and the voice safety rule.

📌 **kit**: speak's controls are its own until its v2 redesign ([FRM-288](https://linear.app/x-com/issue/FRM-288)), which adopts `@ui/kit`; it moved into bytes as it was.

## the daemon

the admin reaches x-speak only through `~/.local/share/x-speak/control.sock` — one json line each way: `status`,
`voices`, `reload`, `preview`, `read`, `pause`, `stop`. `read` (a text, the F4 chain) is x-mod-stash orbit's 🔊.
the chain, voices, speed, gain and budget live in `daemon/config.json`; the page holds nothing else, and the daemon
re-reads the file on the next F4 after a save.

- **the binary lives outside every repo**: `pnpm --filter speak daemon:build` tests, compiles, signs with «x-speak local signing» and installs to `~/.local/libexec/x-speak/x-speak`, the path its Accessibility grant is given to; it never touches launchd. `pnpm --filter speak daemon:relaunch` restarts the job onto it, and refuses while the daemon is speaking
- **the way back**: a build keeps the running binary it replaces as `x-speak.prev` beside it (one that never started, or whose main thread is stuck, never pushes it out; after a rollback a build is refused until the one put back answers; one build or rollback at a time, by the `x-speak.lock` folder); `pnpm speak:rollback` swaps the two, relaunches and waits for `status`, and says which binary runs, whether the settings are the same and whether the config argument moved
- **the two launchd plists live in frame** (`~/frame/schedule/jobs/x-speak`, `x-speak-admin`), frame's one home for every launchd job; they point into this app
- **a changed program in a job's plist costs one killed start at the next login** (a crash report, «Launch Constraint Violation», then the 30 s retry passes); a rebuild onto the same path costs none. the mechanics: `~/frame/schedule/AGENTS.md`
- **no swift file names a repo path**: the launchd job hands the daemon its config as `--config <path>` and its keys runner as `--keys-run <path>` (frame's `script/op-run.sh`); `server.ts` builds the same config path from its own directory. with no `--config` the daemon exits with a usage line, and launchd restarts it every 30 s
- **a second x-speak beside the live one is never started by hand**: it unlinks the live control socket and registers the same hotkeys. the one exception is `pnpm speak:try "<text>"`: it speaks one text and leaves, takes neither, gets no cloud keys, never starts the kokoro server, and stays quiet while the live daemon reads
- **the live daemon is dima's most-used tool** — a rebuild and relaunch cuts any read in progress; announce the swap
  first and check the control socket's `status` is not speaking (live tests cut his reads twice on FRM-283)
- **a normalizer rule starts from the real grab**, never a guessed input: the Claude app glues list items and drops
  line breaks, Slack's accessibility focus is the empty message box — one real F4 beat every guess (FRM-283, 10-01)
- **the daemon logs to stderr**: `~/.local/share/x-speak/daemon.err.log`, one line per press

## hazards

- **a save sorts the keys itself, then goes through bytes' biome, fed indented json** (bytes' biome sorts no json keys; an array keeps its order) — biome keeps an object expanded only when its input
  was; compact input rewrote dima's whole file and the commit hook refused it
- **a dnd-kit reorder applies `move()` on every drag-over**, with the snapshot back on a cancel — applying it only
  on drop fought dnd-kit's optimistic dom move, and the page and the ranks disagreed after a keyboard drag
- **only a chain card registers with dnd-kit** — it stamps `role` and a tab stop on what it registers, which broke
  the list semantics on the cards outside the chain
- **every write to the api carries `content-type: application/json`**, or the server answers 415: that header is what keeps another web page from driving the daemon; a `curl -X PUT` needs `-H 'content-type: application/json'`
- the voice lists are data in `server.ts`, each id proven by a real call (elevenlabs premades on the restricted key,
  kokoro on the warm server); a library voice answers 402 on a restricted key
- **the swift tests run only on the mac**: `pnpm --filter speak daemon:test`, run by lefthook on a commit under `daemon/`; bytes' linux ci runs no swift
