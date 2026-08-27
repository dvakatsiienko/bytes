# CLAUDE.md — space-explorer-ui

vite react client for `space-explorer-api` — an apollo client demo (pagination, cache type
policies, optimistic ui). demo status.

## shape

- **codegen needs the api running on `localhost:4000`** — `pnpm codegen:graphql` combines the
  remote schema with `src/graphql/schema/client-schema.graphql`; generated types land in
  `src/graphql/index.tsx` — never hand-edit that file
- apollo link chain: `logger → error → auth → http` (`src/lib/apollo/links/`); the auth link
  reads the token from localStorage; cache field policies in `src/lib/apollo/typePolicies.ts`
- react 19 + react-router-dom 7, tailwind v4 (`src/theme.css` `@theme` tokens) + cva,
  react-hook-form + zod
- `@/` → `src/`

scripts live in `package.json` — read them there.
