# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository Overview

This is a Turborepo-powered monorepo containing several web applications and
shared packages. The repository uses pnpm as the package manager and is
structured with apps in the `/apps` directory and shared libraries in
`/packages`.

## Applications

- **cv** - Personal CV/resume website built with Next.js and React
- **x-com-chat** - AI chat application using Next.js, Convex, and Prisma
- **space-explorer-ui** - Apollo GraphQL frontend built with Vite and React
- **space-explorer-api** - GraphQL API server using Apollo Server and Prisma
- **financial** - Financial dashboard app built with Next.js (WIP)
- **figmentation** - CSS showcase with Clinique demo using Next.js

## Shared Packages

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

5. **Task Dependencies** The `turbo.jsonc` file defines task dependencies:
   - `dev` depends on prisma:generate
   - `build` depends on ^build, lint, typecheck, and ^prisma:generate
   - Proper caching config is set up for all tasks

## Technology Stack

- **Core**: TypeScript, React 19, Next.js, Vite
- **Styling**: Tailwind CSS, styled-components
- **State**: Jotai, React Query, Apollo Client
- **API**: GraphQL, REST
- **Database**: Prisma, SQLite, Convex
- **Build Tools**: Turbo, SWC, Biome, Prettier

## Biome Configuration System

### Package Architecture

The repository uses a custom `biome-config-polished` package located in `/packages/biome-config-polished/` to provide comprehensive linting and formatting configuration across all apps.

**Key Files:**
- `/packages/biome-config-polished/config.jsonc` - Main configuration with all rules and overrides
- `/packages/biome-config-polished/package.json` - Package exports: `"exports": { ".": "./config.jsonc" }`
- `/biome.jsonc` - Root config that extends both "ultracite" and "biome-config-polished"

**Configuration Chain:**
```jsonc
// Root biome.jsonc
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["ultracite", "biome-config-polished"]
}
```

### Rule Categories & Organization

The configuration comprehensively covers all 7 Biome rule categories:

1. **a11y** - Accessibility rules (useButtonType, noNoninteractiveElementInteractions)
2. **complexity** - Code complexity detection (noExcessiveCognitiveComplexity disabled)
3. **correctness** - Guaranteed incorrect code detection (strict React rules, useUniqueElementIds disabled)
4. **nursery** - Experimental rules under development (useConsistentTypeDefinitions disabled)
5. **performance** - Runtime efficiency rules (noNamespaceImport disabled for utility)
6. **security** - Security vulnerability detection (noBlankTarget, noDangerouslySetInnerHtml)
7. **style** - Code style consistency (noDefaultExport enabled, enforces named exports)
8. **suspicious** - Likely incorrect code patterns (noConsole with allow list, React-specific rules)

### Advanced Override System

**CRITICAL**: Overrides must be at **root config level**, not nested inside `linter`:

```jsonc
{
  "linter": { /* linter config */ },
  "overrides": [  // ✅ Correct - root level
    {
      "linter": { "rules": { "style": { "noDefaultExport": "off" } } },
      "includes": ["**/app/**/{layout,page}.tsx"]
    }
  ]
}
```

**Three-Layer Override Strategy:**

#### 1. Config File Protection Override
```jsonc
{
  "assist": { "actions": { "source": { "useSortedKeys": "off" } } },
  "includes": [
    "biome.jsonc", "**/package.json", "**/tsconfig.json", 
    "**/components.json", "**/.prettierrc.js"
  ]
}
```
**Purpose**: Prevents auto-sorting of configuration files that benefit from manual organization.

#### 2. Framework Exception Override  
```jsonc
{
  "linter": { "rules": { "style": { "noDefaultExport": "off" } } },
  "includes": [
    // Next.js App Router
    "**/app/**/{layout,page,loading,error,not-found,default}.tsx",
    // Build configs
    "next.config.ts", "**/vite.config.ts",
    // Function-based APIs
    "**/convex/**", "*.d.ts"
  ]
}
```
**Purpose**: Allows default exports where frameworks require them (Next.js pages, config files, type definitions).

#### 3. Generated Code Exclusion Override
```jsonc
{
  "linter": { "enabled": false },
  "includes": [
    "apps/**/convex/_generated/**",
    "apps/**/graphql/index.{ts,tsx}"
  ]
}
```
**Purpose**: Completely disables linting for generated code that shouldn't be manually modified.

### Import Organization Strategy

**Sophisticated Grouping System:**
```jsonc
"organizeImports": {
  "groups": [
    // Core Dependencies
    { "type": false, "source": [":NODE:"] },  // Node built-ins
    "react", "react-router",                   // UI framework
    ["ramda", "use-debounce"],                // Utilities
    ["motion"],                               // Animations  
    ["cva", "classnames", "clsx"],            // Style utilities
    ":PACKAGE:",                              // Other packages
    
    ":BLANK_LINE:",                           // Visual separator
    
    // Application Code
    "@/app/**", "@/pages/**", "@/components/**",
    
    ":BLANK_LINE:",
    
    // Instruments & Utilities
    ["@/lib", "@/lib/**"], "@/helpers/**", "@/utils/**", "@/hooks/**",
    
    ":BLANK_LINE:",
    
    // Local Imports
    "./parts/**", ":PATH:"                    // Relative imports last
  ]
}
```

### Quick Reference Links

- **Getting Started**: https://biomejs.dev/guides/getting-started/
- **Configuration Guide**: https://biomejs.dev/guides/configure-biome/
- **Monorepo Setup**: https://biomejs.dev/guides/big-projects/
- **Rules Reference**: https://biomejs.dev/linter/javascript/rules/

### Common Configuration Gotchas

1. **Override Nesting**: Always place `overrides` at root config level, not inside `linter`
2. **Package Resolution**: Ensure `exports` field in package.json points to correct config file
3. **Extends Chain**: Order matters - later configs override earlier ones
4. **Generated Files**: Use complete linter disabling, not rule-by-rule exclusion
5. **Framework Files**: Use specific includes patterns for framework-required default exports

### Package Usage in Other Projects

**Installation:**
```bash
pnpm add -D biome-config-polished@workspace:*
```

**Basic Setup:**
```jsonc
// biome.jsonc
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["biome-config-polished"]
}
```

**With Additional Config:**
```jsonc
// biome.jsonc  
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": ["biome-config-polished"],
  "files": { "ignoreUnknown": false },
  "vcs": { "enabled": true, "clientKind": "git" }
}
```
