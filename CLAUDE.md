# CLAUDE.md - Monorepo Coordination Layer

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
| `figmentation`       | CSS/design experiments                  | Next.js 16, CSS Modules           | Showcase   |

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
- **Server State**: React Query for caching
- **Real-time**: Convex subscriptions
- **GraphQL**: Apollo Client cache

### Database Patterns

- **Seeding**: `tsx prisma/seed/init`

## Environment Configuration

Each app maintains its own `.env.local` with specific requirements documented in
its CLAUDE.md file. Common patterns:

- **Auth**: Clerk keys for user management
- **AI**: API keys for LLM providers
- **Database**: Connection strings and deploy keys
- **Analytics**: Tracking and monitoring

## Agent skills

### Issue tracker

GitHub Issues in `dvakatsiienko/bytes` via the `gh` CLI, one app label per issue (`x-com-chat`, `cv`, …). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context — root `CONTEXT-MAP.md` points at per-app `CONTEXT.md` files. See `docs/agents/domain.md`.
