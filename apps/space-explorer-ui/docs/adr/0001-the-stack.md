# A Vite SPA on Apollo Client, typed by codegen from the live api schema

space-explorer-ui is a Vite + React 19 single-page app on Apollo Client 4: react-router-dom 7 for the four pages, react-hook-form + zod for the login form, Tailwind v4 with `@ui/kit` and `cva` for the look, and the gruvbox palette in `src/theme.css`. Server state is Apollo's normalised cache; client state (the cart, the login flag) lives in the same cache as reactive vars, read through a client-side schema. Typed documents come from `graphql-codegen`, which merges the api's live schema with that client schema. It deploys on Vercel as a static build with a catch-all rewrite. It was chosen as the client half of a graphql demo — pagination, cache type policies, optimistic updates — a 🐾 pet app that stays basic on purpose.

## Considered options

- **styled-components** — the original styling. replaced by Tailwind v4 + `cva` component by component with no visual change (`76eca6fd`), then wired onto `@ui/kit`.
- **a separate client-state store** — not taken: the cart and the login flag are Apollo reactive vars, so one cache and one query language cover both server and client state.

## Consequences

- codegen needs `space-explorer-api` running on `:4000`; the generated files are never edited by hand.
