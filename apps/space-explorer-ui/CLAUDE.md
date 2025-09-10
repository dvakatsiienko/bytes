# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev                      # Start Vite dev server on port 5173

# Building & Production
pnpm build                    # Run typecheck and build concurrently
pnpm build:vite              # Build production bundle only
pnpm serve                   # Clean build and preview production bundle

# Code Quality
pnpm lint                    # Run Biome linter
pnpm typecheck              # TypeScript type checking

# GraphQL Code Generation
pnpm codegen:graphql        # Generate TypeScript types from GraphQL schema
                           # Requires API server running on localhost:4000
```

## Architecture Overview

This is a Vite-powered React application that serves as a GraphQL client for the Space Explorer API. It demonstrates modern GraphQL patterns with Apollo Client, featuring real-time data synchronization and optimistic UI updates.

### Tech Stack
- **Build Tool**: Vite with React SWC plugin for fast HMR
- **UI Framework**: React 19 with React Router v7
- **GraphQL Client**: Apollo Client with custom link chain
- **Styling**: Styled Components v6
- **Forms**: React Hook Form with Zod validation
- **TypeScript**: Strict mode with path aliases

## GraphQL Workflow

### Code Generation Prerequisites
The GraphQL codegen requires the API server to be running:
```bash
# In space-explorer-api directory
pnpm dev  # Starts server on localhost:4000
```

### Schema Sources
The app combines two schema sources (configured in `graphql-codegen.yml`):
1. **Remote Schema**: http://localhost:4000/ (API server)
2. **Client Schema**: src/graphql/schema/client-schema.graphql (local fields)

### Generated Types Location
All GraphQL operations generate TypeScript types in `src/graphql/index.tsx`

## Apollo Client Configuration

The Apollo Client setup (`src/lib/apollo/`) uses a sophisticated link chain:

```
loggerLink → errorLink → authLink → httpLink
```

- **loggerLink**: Console logging for development (apollo-link-logger)
- **errorLink**: Global error handling with GraphQL error extraction
- **authLink**: Injects authorization headers from localStorage
- **httpLink**: Connects to GraphQL endpoint at localhost:4000

### Cache Configuration
- InMemoryCache with custom type policies (`src/lib/apollo/typePolicies.ts`)
- Supports pagination and field merging strategies
- Client-side type definitions for local state management

## Project Structure

```
src/
├── lib/apollo/          # Apollo Client setup and configuration
│   ├── links/          # Custom Apollo links (auth, error, http)
│   ├── client.tsx      # Main client instance
│   └── typePolicies.ts # Cache field policies
├── graphql/            # GraphQL operations and schemas
│   ├── queries/        # Query definitions (.graphql files)
│   ├── mutations/      # Mutation definitions
│   ├── schema/         # Client-side schema extensions
│   └── index.tsx       # Generated types (DO NOT EDIT)
├── pages/              # Route components
├── components/         # Reusable UI components
│   └── SVG/           # SVG components organized by feature
└── styles.ts          # Global styles with styled-components
```

## TypeScript Configuration

### Path Aliases
```typescript
@/* → src/*  // Use @/components instead of ../../../components
```

### Strict Mode Enabled
All strict TypeScript checks are enabled. Ensure new code maintains type safety.

## Component Patterns

### Styled Components
Global styles are defined in `src/styles.ts` using createGlobalStyle. Component-specific styles use styled-components directly.

### SVG Organization
SVGs are React components organized by feature area (e.g., `components/Footer/SVG/`, `components/LoginForm/SVG/`)

### Form Validation
Forms use React Hook Form with Zod resolvers for runtime validation (see `components/LoginForm/resolver.ts` for pattern)

## Important Notes

- **API Dependency**: Most development requires the space-explorer-api server running on port 4000
- **Authentication**: Uses localStorage for token persistence (cleared on logout)
- **Error Handling**: Apollo error link provides centralized GraphQL error handling
- **Type Safety**: Always run `pnpm codegen:graphql` after modifying .graphql files