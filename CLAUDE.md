# CLAUDE.md - Monorepo Coordination Layer

This file provides structural coordination and navigation guidance for Claude
Code when working across this Turborepo-powered monorepo.

## Repository Architecture

A pnpm workspace monorepo orchestrated by Turborepo, containing multiple web
applications and shared infrastructure packages. The architecture emphasizes
code reuse, consistent tooling, and efficient task orchestration.

## App Registry

Each app maintains its own CLAUDE.md with detailed implementation context.

| App                  | Purpose                                 | Stack                             | Status     |
| -------------------- | --------------------------------------- | --------------------------------- | ---------- |
| `cv`                 | Personal portfolio with tool showcase   | Next.js 15, React 19, Tailwind    | Production |
| `x-com-chat`         | AI chat with customizable alien friends | Next.js, Convex, Jotai, Prisma    | Active Dev |
| `space-explorer-ui`  | GraphQL client demo                     | Vite, Apollo Client, React        | Demo       |
| `space-explorer-api` | GraphQL server demo                     | Apollo Server, Prisma, SpaceX API | Demo       |
| `financial`          | Financial dashboard with auth           | Next.js, Prisma, Auth.js          | WIP        |
| `figmentation`       | CSS/design experiments                  | Next.js, CSS Modules              | Showcase   |

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

### Turborepo Pipeline

```mermaid
build → depends on → ^build, lint, typecheck, ^prisma:generate
dev → depends on → ^prisma:generate
typecheck → depends on → ^typecheck
```

### Common Commands

### Root Commands

```bash
# Development
pnpm dev:cv              # Run CV app
pnpm dev:x-com-chat      # Run X-COM Chat app with Convex
pnpm dev:@space-explorer # Run both Space Explorer UI and API
pnpm dev:figmentation       # Run figmentation app
pnpm dev:financial       # Run Financial app

# Building
pnpm build               # Build all apps
pnpm build:cv            # Build CV app
pnpm build:figmentation     # Build figmentation app
pnpm build:financial     # Build Financial app
pnpm build:space-explorer/ui # Build Space Explorer UI

# Code Quality
pnpm lint                # Lint all apps
pnpm typecheck           # Type check all apps
pnpm check               # Run lint and typecheck

# Dependencies
pnpm packages:reinstall  # Reinstall all dependencies
```

### App-Specific Commands

Each app has its own scripts that follow similar patterns:

#### Next.js Apps (cv, x-com-chat, financial, figmentation)

```bash
# Inside app directory
pnpm dev                 # Start development server with Turbopack
pnpm start               # Alias for dev
pnpm build               # Build for production
pnpm serve               # Serve production build
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
```

#### Vite-based Apps (space-explorer-ui)

```bash
# Inside app directory
pnpm dev                 # Start development server
pnpm build               # Build for production
pnpm serve               # Build and preview production build
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
```

#### API Apps (space-explorer-api)

```bash
# Inside app directory
pnpm dev                 # Start development server with nodemon
pnpm start               # Alias for dev
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
pnpm prisma:generate     # Generate Prisma client
```

#### Database-related Commands (x-com-chat, financial, space-explorer-api)

```bash
# Inside app directory
pnpm db:push             # Update database schema (Prisma)
pnpm prisma:generate         # Generate Prisma client
pnpm db:seed             # Seed database with test data
pnpm db:reset            # Reset database (force)
pnpm db:reinit           # Reset, generate, and seed database
```

## Cross-App Conventions

### File Structure Patterns

```
apps/{app}/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # UI components
│   ├── lib/          # Core logic
│   ├── queries/      # Data fetching
│   └── theme/        # Styling
├── prisma/           # Database schema
└── turbo.jsonc       # App-specific Turbo config
```

### State Management Strategies

- **Client State**: Jotai atoms for UI state
- **Server State**: React Query for caching
- **Real-time**: Convex subscriptions
- **GraphQL**: Apollo Client cache

### Database Patterns

- **Development**: SQLite via Prisma
- **Real-time**: Convex for live updates
- **Migrations**: Prisma migrate workflow
- **Seeding**: `tsx prisma/seed/init`

## Technology Stack

### Core Technologies

- **Runtime**: Node.js ≥22.17.0, pnpm 10.14.0
- **Framework**: Next.js 15 (Turbopack), Vite 6
- **Language**: TypeScript 5.9.2, React 19.1.1

### Data Layer

- **ORM**: Prisma 6.14.0
- **Real-time**: Convex 1.26.1
- **GraphQL**: Apollo Server/Client
- **AI Integration**: Vercel AI SDK, Groq, OpenRouter

### Developer Experience

- **Monorepo**: Turborepo 2.5.6
- **Linting**: Biome 2.2.2, ultracite 5.2.5
- **Git Hooks**: Lefthook 1.12.3

## Coordination Protocols

### Multi-App Development

```bash
# Run multiple apps simultaneously
pnpm dev:@space-explorer     # Both UI and API
pnpm dev:x-com-chat          # Next.js + Convex backends

# Targeted operations
turbo cv#build               # Build specific app
turbo --filter=x-com-chat... # Include dependencies
```

### Dependency Management

```bash
# Workspace-wide operations
pnpm packages:reinstall      # Clean reinstall
pnpm add -D pkg -w          # Add to root
pnpm add pkg --filter=cv    # Add to specific app
```

### Quality Assurance

```bash
pnpm check                   # Lint + typecheck all
pnpm lint:errors            # Show only errors
pnpm format                 # Auto-fix formatting
```

## Environment Configuration

Each app maintains its own `.env.local` with specific requirements documented in
its CLAUDE.md file. Common patterns:

- **Auth**: Clerk keys for user management
- **AI**: API keys for LLM providers
- **Database**: Connection strings and deploy keys
- **Analytics**: Tracking and monitoring
