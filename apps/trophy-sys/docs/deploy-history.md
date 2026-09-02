# Deploy history — what the four constraints cost

`CLAUDE.md` carries the four deployment constraints as one line each. This file is why they are
there: three production outages and one measured experiment. Read it before you decide a
constraint has expired.

## Constraint 1 — the function path must exist in git

Vercel decides which functions exist by scanning the source tree at clone time, before any build
runs. A purely generated `api/handler.js` therefore arrives far too late: the deploy goes green
while every `/api` route answers Vercel's HTML 404 page. The committed 430-byte stub returning 501
is what makes the path exist; `pnpm build:api` overwrites it with the real esbuild bundle during
the build.

## Constraint 2 — the bundle, and why it is no longer about `psn-api`

Up to `psn-api` 2.18.0 the package was unimportable from ESM in either direction. **2.18.1 fixed
it** ([#244](https://github.com/achievements-app/psn-api/issues/244)) and a plain
`import { getUserTitles } from 'psn-api'` now works under Node. Three prod outages came from
trying to import it "correctly" before that fix landed.

Dropping the esbuild bundle was then tried and measured on 2026-08-16. It fails twice over:

- **Vercel's dependency tracing ships no `node_modules` into the function.** Compiled output keeps
  `import … from 'psn-api'` as a bare specifier, so the function dies at runtime with
  `ERR_MODULE_NOT_FOUND` — a green build and dead routes, the worst failure shape here. Verified by
  copying `.vercel/output/functions/api/handler.func` out of the workspace and importing it. A pnpm
  workspace with deps symlinked from the repo root is the likely cause.
- **Committing `api/handler.ts` as source makes the builder compile TypeScript again**, and it
  crashes on TS 7 with `Cannot read properties of undefined (reading 'readFile')`. Pinning
  `typescript` to 6.0.3 clears that, but constraint 1 remains fatal on its own.

Because the shipped function is `.js`, the builder compiles no TypeScript, so this app uses the
root's TypeScript with no local pin.

📌 **Before retrying this, run `vercel build` locally** — it costs no deploy quota — and load the
built `.func` from outside the repo. If a `node_modules` appears inside it, the first blocker is
gone and the bundle is worth revisiting.

## Constraint 3 — the `(req, res)` signature

Vercel's launcher (`launcherType: "Nodejs"`) invokes the handler Node-style. A web-standard handler
returning a `Response` is silently dropped and the request hangs until timeout. `main.ts` mounts
the same function locally, so the local server and the deployed function never diverge.

## Constraint 4 — explicit routing

A catch-all named `api/[...path].js` looks right and is not: Vercel generated `^/api/([^/]+)$` for
it, so one-segment routes worked while `/api/games/:id` fell through to a 404 HTML page. The
`vercel.json` rewrite `/api/(.*) → /api/handler` matches any depth. `req.url` keeps the original
path across the rewrite, which is what `routeResolve` matches on.

This is why the post-deploy check is a **two-segment** route (`/api/games/NPWR24415_00`) and not
`/api/health` — every single-segment route stayed green through the entire bug.
