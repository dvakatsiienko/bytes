# A schema-first Apollo Server over a public launch gateway, trips in a tracked sqlite file, on Railway

space-explorer-api is an Apollo Server 5 app run with `tsx`, schema-first: `src/graphql/schema.graphql` is the source of truth and codegen writes the resolver types. Launches and rockets come from a REST data source over a public gateway, two cached GETs per request; users and trips live in sqlite through Prisma 7 (`better-sqlite3` adapter), the db file tracked in git. It deploys on Railway with `railway.json` pinning `npm start`, not on Vercel with the other apps, because it is a long-running node server. It was chosen as a small, real graphql demo — a 🐾 pet app, basic on purpose — that pairs with `space-explorer-ui`.

## Considered options

- **the SpaceX api (`api.spacexdata.com`)** — the original source. it answers 525 since its repo was archived in june 2026, so the data source moved to the pipeworx gateway, which rebuilds the same datasets and stays current (`3a64f403`).
- **a hosted database** — not taken: a tracked sqlite file needs no setup. the cost is known and handled: every deploy rebuilds the db, so every old token becomes a gone session, and the api answers `UNAUTHENTICATED` for the ui to act on.

## Consequences

- the ui's codegen reads this server's schema live, so it must run on `:4000` for `pnpm graphql:codegen` there.
- railway's dashboard start command once overrode the repo (`npm run dev` in production); `railway.json` now pins it (`070fa563`).
