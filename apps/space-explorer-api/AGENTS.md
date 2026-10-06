# AGENTS.md — space-explorer-api

graphql server demo — apollo server over the spacex public api plus sqlite trip bookings.
paired with `space-explorer-ui`, which needs this server on `:4000` for its codegen.

- **`FTR.md` + `GLOSSARY.md`** — every feature with its check, and the words they use (the pair's
  shared words live here). Read your section before changing what the app does.

🐾 **pet project** — basic on purpose (dima, 2026-09-27): `db.sqlite` and `.env` are tracked in git, a minimal db with no setup. keep it; a test that writes goes to a scratch copy — `space-explorer-api-run` shows how.

## shape

- **schema-first**: `src/graphql/schema.graphql` is the source of truth — after editing it, run
  `pnpm graphql:codegen` to regenerate the types
- resolvers in `src/resolvers/`, one file per type, exported from `index.ts`. resolvers stay
  thin — data fetching belongs in `src/datasources/` (spacex rest source + prisma-backed
  `UserAPI`), never in a resolver
- sqlite via prisma; client generated to `src/lib/prisma-client`, db file `prisma/db.sqlite`
- auth is deliberately demo-grade: base64 email in the authorization header, zod-validated,
  injected into context; `UserAPI` checks it before any write

## gotchas

- esm with `.ts` extension imports; `@/` → `src/`
- port comes from `PORT`, default 4000 — the ui's `graphql-codegen.yml` points at it

scripts live in `package.json` — read them there.
