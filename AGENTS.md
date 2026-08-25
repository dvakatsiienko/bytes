# AGENTS.md - Monorepo Coordination Layer

This file provides structural coordination and navigation guidance for Claude
Code when working across this Turborepo-powered monorepo.

## Repository Architecture

A pnpm workspace monorepo orchestrated by Turborepo, containing multiple web
applications and shared infrastructure packages. The architecture emphasizes
code reuse, consistent tooling, and efficient task orchestration.

## App Registry

Each app maintains its own CLAUDE.md with detailed implementation context.
App CLAUDE.md files start with an `@AGENTS.md` import (framework directives live
there); keep that line first when editing. When bumping framework versions,
update the Stack column below — it drifts stale otherwise.

| App                  | Purpose                                 | Stack                             | Status     |
| -------------------- | --------------------------------------- | --------------------------------- | ---------- |
| `cv`                 | Personal portfolio with tool showcase   | Next.js 16, React 19, Tailwind v4 | Production |
| `x-com-chat`         | AI chat with customizable alien friends | Next.js 16, Convex, Jotai, Clerk  | Active Dev |
| `space-explorer-ui`  | GraphQL client demo                     | Vite 8, Apollo Client, React      | Demo       |
| `space-explorer-api` | GraphQL server demo                     | Apollo Server, Prisma, SpaceX API | Demo       |
| `financial`          | Financial dashboard with auth           | Next.js 16, Prisma, Auth.js       | WIP        |
| `proto-lab`          | Prototype platform, swappable proto slot | Vite 8, React 19, Tailwind v4, shadcn | Active Dev |
| `figmentation`       | CSS/design experiments                  | Next.js 16, CSS Modules           | Showcase   |
| `trophy-sys`         | PSN trophy tracker, retro terminal UI   | Vite 8, React 19, TanStack, Upstash | Active Dev |

## Shared Infrastructure

### Core Packages

| Package                    | Purpose                          | Usage                                |
| -------------------------- | -------------------------------- | ------------------------------------ |
| `biome-config-polished`    | Unified linting/formatting rules | `extends: ["biome-config-polished"]` |
| `prettier-config-polished` | Prettier configuration           | Legacy, migrating to Biome           |
| `kit`                      | Shared UI components             | Common buttons, drawers, icons       |
| `fonts`                    | Variable font assets             | Manrope, Roboto Flex                 |
| `typescript-config`        | Base TS configurations           | Extended by all apps                 |
| `utils`                    | Shared utilities                 | Common calculations, helpers         |

## Task Orchestration

### Common Commands

See root `package.json` "scripts" and each app's `package.json` for the exact command names.

## Cross-App Conventions

### State Management Strategies

- **Client State**: Jotai atoms for UI state
- **Server State**: React Query for caching — used by `financial` and `trophy-sys`; prefer it over
  hand-rolled `useEffect` fetching in any new app
- **URL State**: TanStack Router in `trophy-sys`, React Router elsewhere — routing state goes in
  the path (see below), never in search params
- **Real-time**: Convex subscriptions
- **GraphQL**: Apollo Client cache

### URL Shape — routing state belongs in the path

**If a thing is a resource or a place, it gets a path segment. Search params are only for genuine
view state nobody would link to.**

- ✅ `/library/NPWR21924_00`
- 🚫 `/library?game=NPWR21924_00`

A tab is navigation. A selected game is a resource. Both are paths. Sorting, a filter toggle, an
open panel — those are view state and belong in search params.

Why it is written down: `trophy-sys` was first built with search-param routing and rebuilt on paths
after review. That cost the router, every component reading the params, and the rewrite rule that
makes deep links load. The rule is cheap; the correction is not.

### Database Patterns

- **Seeding**: `tsx prisma/seed/init`

### Deployment Settings

Prefer a committed `vercel.json` over the Vercel dashboard. Dashboard-only settings are invisible
to agents and to code review, and they silently override the repo — a dashboard edit to
`trophy-sys`'s Root Directory once broke a deploy that no diff could explain. `trophy-sys` and
`space-explorer-ui` have one; the Next.js apps do not yet.

## Environment Configuration

Each app maintains its own `.env.local` with specific requirements documented in
its CLAUDE.md file. Common patterns:

- **Auth**: Clerk keys for user management
- **AI**: API keys for LLM providers
- **Database**: Connection strings and deploy keys
- **Analytics**: Tracking and monitoring

## Agent skills

### Issue tracker

Linear, workspace `x-com`, teams `BYT` / `DOT`, via the `linear` CLI. GitHub issues retired 2026-08 — closed history only, never operated (`docs/agents/issue-tracker.md` kept for that history).

### Triage labels

Workspace-level families — role, kind, special, model routing. Project-meaning labels are banned. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context — root `CONTEXT-MAP.md` points at per-app `CONTEXT.md` files. See `docs/agents/domain.md`.
