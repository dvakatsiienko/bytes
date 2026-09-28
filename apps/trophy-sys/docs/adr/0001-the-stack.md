# A Vite SPA and one node function on Vercel, state in Upstash

trophy-sys is a Vite + React 19 single-page app (TanStack Router for real paths, TanStack Query for server state, visx for charts, Tailwind v4 with `@ui/kit`) and a plain `node:http` api in `src/server/`, shipped to Vercel as one esbuild-bundled function through the Build Output API v3. State lives in Upstash Redis, one key per concern, with a JSON-file fallback so `pnpm dev` and the CLI run with no store attached. It was chosen because the app is one owner's tool over a slow, rate-limited PSN api: nothing needs server rendering, and a single function with a 60-second memo keeps PSN calls few.

## Considered options

- **Next.js** — the monorepo's default for web apps. Not taken: no page needs server rendering, and the api is the part that must survive PSN failing. Whether to move is an open question the redesign may reopen.
- **Vercel's `api/` folder convention** — tried first. Vercel scans for functions before the build runs, so a bundle the build writes arrives too late and every `/api` route 404s behind a green deploy. The Build Output API is the fix (`docs/deploy-history.md`).
