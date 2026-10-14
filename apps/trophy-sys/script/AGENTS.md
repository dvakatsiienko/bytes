# AGENTS.md: trophy-sys/script

How the production deploy is built: `vercel-output.ts` writes the Vercel Build Output. Read before changing anything about the deploy.

## Deployment — constraints that will bite

1. **The function is declared by the build, never by the `api/` folder.** Vercel decides which
   functions exist by scanning the cloned tree *before* the build runs, so the `api/` convention
   can only ever see a committed file — a bundle the build writes arrives too late, and the deploy
   goes green with every `/api` route 404ing. This app therefore uses the **Build Output API v3**:
   `script/vercel-output.ts` writes `.vercel/output/` (static site, `functions/api/handler.func/`,
   and `config.json`), Vercel consumes that directly, and nothing built is committed. 📌 `api/` is
   gitignored and must stay that way — putting a bundle back there re-enters the trap.
2. **Routing is explicit, never filename-derived.** It lives in the generated
   `.vercel/output/config.json` — `OUTPUT_CONFIG` in `script/vercel-output.ts` — as
   `/api/(.*) → /api/handler`, which matches any depth; a filename catch-all matches one segment
   only. `vercel.json` (at the app root, `apps/trophy-sys/vercel.json`) now carries only the build and ignore commands.

The bundle and handler constraints (esbuild, Node `(req, res)`) are in `src/server/AGENTS.md`.

After changing anything about deployment, test a **two-segment** route
(`/api/games/NPWR24415_00`), not just `/api/health` — the single-segment routes stayed green
through the whole bug.

📌 Each of the four deploy constraints cost an outage or a measurement. What was tried, what it broke, and how
to tell when the esbuild bundle constraint is safe to retry: [`docs/deploy-history.md`](../docs/deploy-history.md).
