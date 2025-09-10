# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GraphQL API server for Space Explorer, a demo application showcasing Apollo Server integration with external APIs and database persistence.

## Development Commands

```bash
# Development
pnpm dev                 # Start server with hot reload (tsx watch on port 4000)

# Code Quality
pnpm lint                # Run Biome linter
pnpm typecheck           # TypeScript type checking

# Code Generation
pnpm codegen:graphql     # Generate TypeScript types from GraphQL schema
pnpm prisma:generate     # Generate Prisma client (runs automatically on postinstall)
```

## Architecture

### GraphQL Layer

- **Schema-first approach**: Schema defined in `src/graphql/schema.graphql`
- **Resolver structure**: Modular resolvers by type in `src/resolvers/`
  - Each GraphQL type has its own resolver file (Query, Mutation, Launch, Mission, etc.)
  - Resolvers access data sources via context

### Data Sources Pattern

Two RESTDataSource implementations handle external data:

1. **SpaceXAPI** (`src/datasources/SpaceXAPI/`): 
   - Fetches launch data from SpaceX public API
   - Uses LaunchModel for data transformation
   - Handles rocket and launchpad data aggregation

2. **UserAPI** (`src/datasources/UserAPI.ts`):
   - Manages user authentication and trip bookings
   - Direct Prisma client access for database operations
   - Validates authentication state via context

### Database Configuration

- **SQLite** with Prisma ORM
- Custom Prisma client output: `src/lib/prisma-client`
- Schema: Users and Trips with UUID primary keys
- Database file: `prisma/db.sqlite`

### Authentication Flow

1. Client sends Base64-encoded email in Authorization header
2. Server decodes and validates email format using Zod
3. Verifies user exists in database
4. Injects authenticated email into context for resolvers
5. UserAPI methods validate auth state before operations

## Key Implementation Details

### Context Structure
```typescript
{
  dataSources: {
    spaceXAPI: SpaceXAPI instance,
    userAPI: UserAPI instance (initialized with userEmail)
  },
  userEmail: string | null
}
```

### Pagination Implementation
- Cursor-based pagination for launches query
- Returns `LaunchesPayload` with cursor, hasMore flag, and list
- Implemented in `src/utils/paginate.ts`

### Path Configuration
- TypeScript path alias: `@/` → `src/`
- ESM modules with `.ts` extension imports
- Custom dirname utility for ESM compatibility

### Environment Variables
- `DATABASE_URL`: SQLite connection string (default: `file:./db.sqlite`)
- `PORT`: Server port (default: 4000)

## Working with This Codebase

When modifying resolvers, maintain the separation of concerns pattern - each resolver should only handle its specific type's field resolution. Data fetching logic belongs in data sources, not resolvers.

When adding new GraphQL types:
1. Define schema in `src/graphql/schema.graphql`
2. Run `pnpm codegen:graphql` to generate TypeScript types
3. Create resolver file in `src/resolvers/`
4. Export from `src/resolvers/index.ts`

For database schema changes:
1. Modify `prisma/schema.prisma`
2. Run `pnpm prisma:generate` to update client
3. Create migration if needed for production