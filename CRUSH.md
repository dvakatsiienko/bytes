# CRUSH.md - Agent Configuration for Bytes Repository

## Build/Lint/Test Commands

### Root Commands
```bash
# Development
pnpm dev:cv              # Run CV app
pnpm dev:x-com-chat      # Run X-COM Chat app with Convex
pnpm dev:@space-explorer # Run both Space Explorer UI and API
pnpm dev:figmentation    # Run figmentation app
pnpm dev:financial       # Run Financial app

# Building
pnpm build               # Build all apps
pnpm build:cv            # Build CV app
pnpm build:figmentation  # Build figmentation app
pnpm build:financial     # Build Financial app
pnpm build:space-explorer/ui # Build Space Explorer UI

# Code Quality
pnpm lint                # Lint all apps
pnpm lint:errors         # Lint only errors
pnpm typecheck           # Type check all apps
pnpm check               # Run lint and typecheck

# Dependencies
pnpm packages:reinstall  # Reinstall all dependencies
```

### App-Specific Commands
Each app follows similar patterns:

#### Next.js Apps (cv, x-com-chat, financial, figmentation)
```bash
pnpm dev                 # Start development server with Turbopack
pnpm build               # Build for production
pnpm serve               # Serve production build
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
```

#### Vite-based Apps (space-explorer-ui)
```bash
pnpm dev                 # Start development server
pnpm build               # Build for production
pnpm serve               # Build and preview production build
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
```

#### API Apps (space-explorer-api)
```bash
pnpm dev                 # Start development server with nodemon
pnpm lint                # Run Biome
pnpm typecheck           # Run TypeScript type checking
pnpm codegen:graphql     # Generate GraphQL types
pnpm prisma:generate     # Generate Prisma client
```

#### Database-related Commands (x-com-chat, financial, space-explorer-api)
```bash
pnpm db:push             # Update database schema (Prisma)
pnpm prisma:generate     # Generate Prisma client
pnpm db:seed             # Seed database with test data
pnpm db:reset            # Reset database (force)
pnpm db:reinit           # Reset, generate, and seed database
```

## Code Style Guidelines

### General
- Format code using Prettier and Biome configurations
- Follow the nearest Prettier config and Biome config to minimize code movement

### Naming Conventions
- Use descriptive names with auxiliary verbs (isLoading, hasError)
- Prefix event handlers with "handle" (handleClick, handleSubmit)
- Use lowercase with dashes for directories (components/auth-wizard)
- Favor named exports for components
- For JSX lists, keep JSX clean:
  - Declare a list identifier in component body
  - Use variableNameListJSX pattern (e.g., usersListJSX)
  - This keeps code minimalistic, concise, and readable

### Imports
- Prefer named imports/exports over default imports/exports

### TypeScript
- Implement proper type safety and inference
- Prefer interfaces over types for Component Props
- Avoid enums
- Use `satisfies` operator for type validation

### React Component Architecture
- Prefer arrow function components over function declaration components
- Component body has two parts: body (logic only) and return (JSX only)
- Place types for Component props at the end of the file
- Prefer React Server Components (RSC) where possible
- Minimize 'use client' directives
- Implement proper error boundaries
- Use Suspense for async operations

### Error Handling
- Implement proper error boundaries in React components
- Handle async operations with appropriate error handling
- Use React Query or similar libraries for data fetching with built-in error handling

This file provides essential information for agentic coding agents operating in this repository.