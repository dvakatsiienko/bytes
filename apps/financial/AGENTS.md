# AGENTS.md — financial

Financial dashboard (invoices, customers, revenue) with credentials auth. WIP,
modeled after the Next.js App Router dashboard course app.

## Stack

- **Next.js 16** — App Router, **React 19**, TypeScript (strict)
- **Prisma 7** — PostgreSQL via `@prisma/adapter-pg`; client generated to `.generated/prisma`
- **better-auth** — email+password, `src/lib/auth.ts` (server) + `src/lib/auth-client.ts` (client);
  route guard in `src/proxy.ts`, catch-all handler at `api/auth/[...all]`; seed creates the user
  through `auth.api.signUpEmail`
- **react-hook-form + zod** — all forms (`login`, `signup`, `InvoiceForm`) use `zodResolver`
  against schemas in `src/lib/schemas.ts`; money input via rifm (`AmountInput`), canonical
  amounts are integer cents (`src/lib/money.ts`)
- **React Query** (`@tanstack/react-query`) — client-side server state
- Tailwind (+ `@tailwindcss/forms`), heroicons, cva-free — classes compose through `cn` from
  `@ui/kit/lib/utils`, so a conflicting pair resolves last-wins rather than by stylesheet order

## Architecture

- Routes: `/` , `/login`, `/signup`, `/dashboard` (`(overview)`, `customers`, `invoices` with
  `create` / `[id]/update`), `api/invoices/[id]`
- `src/lib/` — `queries.ts` / `mutations.ts` (data access), `prisma.ts` (client),
  `schemas.ts` (Zod), `money.ts` (cents↔usd), `auth.ts` / `auth-client.ts` (better-auth)
- DB models: `User`, `Customer`, `Invoice` (belongs to Customer), `Revenue`
- Seed data: `prisma/seed/init.ts` + `seed-data.ts`

## Commands

```bash
pnpm dev              # next dev --inspect
pnpm build            # next build
pnpm lint             # biome lint
pnpm typecheck        # tsc
pnpm db:push          # prisma db push (sync schema, no migration)
pnpm db:seed          # prisma db seed
pnpm db:reset         # prisma db push --force-reset (wipes data)
pnpm db:reinit        # reset → generate → seed (full rebuild)
pnpm prisma:generate  # regenerate client (also runs on postinstall)
```

## Environment (`.env`)

```env
DATABASE_URL=...   # PostgreSQL connection string
AUTH_SECRET=...    # better-auth session secret
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
