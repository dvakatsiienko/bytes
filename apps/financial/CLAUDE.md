@AGENTS.md

# CLAUDE.md — financial

Financial dashboard (invoices, customers, revenue) with credentials auth. WIP,
modeled after the Next.js App Router dashboard course app.

## Stack

- **Next.js 16** — App Router, **React 19**, TypeScript (strict)
- **Prisma 7** — PostgreSQL via `@prisma/adapter-pg`; client generated to `.generated/prisma`
- **Auth.js (next-auth v5 beta)** — Credentials provider, `src/auth.ts` + `src/auth.config.ts`;
  passwords verified via `src/lib/security.ts`, input parsed with Zod
- **React Query** (`@tanstack/react-query`) — client-side server state
- Tailwind (+ `@tailwindcss/forms`), heroicons, cva-free (clsx)

## Architecture

- Routes: `/` , `/login`, `/dashboard` (`(overview)`, `customers`, `invoices` with
  `create` / `[id]/update`), `api/invoices/[id]`
- `src/lib/` — `queries.ts` / `mutations.ts` (data access), `prisma.ts` (client),
  `schemas.ts` (Zod), `security.ts` (password hashing)
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
AUTH_SECRET=...    # Auth.js session secret
```
