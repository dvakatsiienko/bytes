---
name: speak-run
description: Load BEFORE you run, start, build, screenshot or click through speak, the voice admin — «run speak», «open the voice admin», «preview a voice», a change under `apps/speak/` that needs proof in the real page.
---

# speak-run

📌 hand-written from chords-run's shape (2026-09-29); regenerate with `/run-skill-generator speak` if it drifts.

speak is a vite + react page served with its api by `apps/speak/server.ts`. the api reaches the x-speak daemon
(launchd, sources in `apps/speak/daemon`) over its control socket. drive the page with **`agent-browser`**, the api
with **`curl`**. commands run from the bytes repo root.

## start

**the main checkout**: the launchd job `x-speak-admin` keeps the server on **:7386** always — nothing to start. ready
check: `curl -sf -o /dev/null -w '%{http_code}' 127.0.0.1:7386/` prints 200.

**a worktree** serves its own tree beside it, on 7386 + its offset (**:7396** for the first worktree):

```bash
pnpm --filter speak admin:build
cd apps/speak && pnpm admin        # run_in_background, under `timeout 7200`; note its task id
```

- a ui change: `pnpm --filter speak admin:build`, then reload — the server reads `dist/` on every request
- a `server.ts` change: restart the server (the main checkout: `pnpm -C ~/frame schedule:restart x-speak-admin`)
- ui work with hmr: `pnpm dev:speak` runs vite on :7387 plus the offset, proxying `/api` to the admin
- the daemon must run for status, preview and save: `launchctl print gui/$(id -u)/com.dima.x-speak | grep state`
- 📌 a save in the main checkout writes dima's real `apps/speak/daemon/config.json` — copy it aside first and put it
  back after, byte-for-byte (`cmp`); a worktree's server writes that worktree's copy
- 📌 every server talks to the one live daemon: ▶ speaks through the mac's speakers, from a worktree too

## drive

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix speak)"
agent-browser open http://127.0.0.1:7386/
agent-browser wait "[data-engine]"
```

- a card: `#col-<en|uk|ru> [data-engine=<engine>]`
- a chain's order: `[...document.querySelectorAll("#col-en [data-engine]")].map(e => e.dataset.engine)`
- the save line: `footer [role=status]`
- the api: `curl -sf 127.0.0.1:7386/api/status`, `/api/config`, `/api/voices`

## stop

`agent-browser close` the session. leave both launchd jobs running; a worktree's own server stops by the task id
noted at its start, and its port is free after.
