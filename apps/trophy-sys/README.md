# 🏆 TROPHY.SYS

A PlayStation trophy tracker that looks like a DOS terminal. Live at
[trophy-sys.vercel.app](https://trophy-sys.vercel.app).

## ✨ Features

- Your whole PSN library, sorted by last played, name, or total playtime
- Per-game trophy list, split into base game and each DLC pack
- Progress trophies ("collect 30 relics") show a live `24/30` bar — PS5 only,
  because that's the only place PSN counts
- News tab diffs your earnings against a saved baseline, so it shows what's new
  since you last looked — and flags games that quietly added trophies
- Light and dark, following your OS unless you say otherwise
- Same data as JSON from the CLI, so `cw` can answer trophy questions with no
  server running

## 🔧 Tech

#### 🖥️ UI

- ⚡ [Vite](https://vite.dev/) — had to be lightweight, and it is
- 🧭 [TanStack Router](https://tanstack.com/router) — typed search params are
  the real draw; it refuses sloppiness, sometimes loudly
- 🔁 [TanStack Query](https://tanstack.com/query) — server state, retries
  clamped down because PSN is slow and rate-limited
- 🎨 [Tailwind v4](https://tailwindcss.com/) — colors are theme tokens only, no
  hex in components
- 🖋️ [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — the whole app is one
  typeface

#### 📡 API

- 🎮 [psn-api](https://github.com/achievements-app/psn-api) — the PSN client.
  Its published build can't be imported from ESM, so it gets bundled in
  ([#163](https://github.com/achievements-app/psn-api/issues/163))
- 🟢 plain `node:http` locally, the exact same handler shipped as a Vercel
  function in production
- 🗃️ [Upstash Redis](https://upstash.com/) — holds the trophy baseline, with a
  JSON file fallback so local dev needs no store

#### 🌐 Hosting

- ▲ [Vercel](https://vercel.com) — Git-triggered, configured in `vercel.json`
  rather than the dashboard

## 🚀 Running it

```bash
pnpm dev            # web on :5177, api on :5178
pnpm trophies games # same data, straight to stdout, no server needed
```

Three env vars, listed in `.env.example`: `NPSSO`, `KV_REST_API_URL`,
`KV_REST_API_TOKEN`.

## 🎨 Look

Gruvbox-material, matching the `sline` statusline. Progress bars are `█` and `░`
runs, not DOM elements. There are CRT scanlines, and they were not a mistake.

📌 Deployment has four constraints that will bite you — they live in
[CLAUDE.md](./CLAUDE.md), not here.
