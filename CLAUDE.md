# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Turborepo-powered monorepo containing several web applications and shared packages. The repository uses pnpm as the package manager and is structured with apps in the `/apps` directory and shared libraries in `/packages`.

## Applications

- **cv** - Personal CV/resume website built with Next.js and React
- **x-com-chat** - AI chat application using Next.js, Convex, and Prisma
- **space-explorer-ui** - Apollo GraphQL frontend built with Vite and React
- **space-explorer-api** - GraphQL API server using Apollo Server and Prisma
- **financial** - Financial dashboard app built with Next.js (WIP)
- **figmentation** - CSS showcase with Clinique demo using Next.js

## Shared Packages

- **eslint-config-polished** - Custom ESLint configuration
- **prettier-config-polished** - Custom Prettier configuration

## Common Commands

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
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript type checking
```

#### Vite-based Apps (space-explorer-ui)

```bash
# Inside app directory
pnpm dev                 # Start development server
pnpm build               # Build for production
pnpm serve               # Build and preview production build
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
```

#### API Apps (space-explorer-api)

```bash
# Inside app directory
pnpm dev                 # Start development server with nodemon
pnpm start               # Alias for dev
pnpm lint                # Run ESLint
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
pnpm prisma:generate     # Generate Prisma client
```

#### Database-related Commands (x-com-chat, financial, space-explorer-api)

```bash
# Inside app directory
pnpm db:push             # Update database schema (Prisma)
pnpm db:generate         # Generate Prisma client
pnpm db:seed             # Seed database with test data
pnpm db:reset            # Reset database (force)
pnpm db:reinit           # Reset, generate, and seed database
```

## Architecture

### Common Patterns

1. **Next.js Apps Structure**
   - `/src/app` - App router pages and layouts
   - `/src/components` - Reusable UI components
   - `/src/theme` - Theme configuration
   - `/src/lib` - Utility functions and shared code

2. **Space Explorer Structure**
   - UI: Vite-based React application using Apollo Client
   - API: Apollo Server with Prisma and SpaceX API integration

3. **Database Management**
   - Prisma ORM for database access
   - SQLite for development databases
   - Convex for real-time backend in x-com-chat

4. **State Management**
   - Jotai in x-com-chat
   - React Query for data fetching
   - Apollo Client for GraphQL state

5. **Task Dependencies**
   The `turbo.jsonc` file defines task dependencies:
   - `dev` depends on prisma:generate
   - `build` depends on ^build, lint, typecheck, and ^prisma:generate
   - Proper caching config is set up for all tasks

## Technology Stack

- **Core**: TypeScript, React 19, Next.js, Vite
- **Styling**: Tailwind CSS, styled-components
- **State**: Jotai, React Query, Apollo Client
- **API**: GraphQL, REST
- **Database**: Prisma, SQLite, Convex
- **Build Tools**: Turbo, SWC, ESLint, Prettier
