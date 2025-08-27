# CLAUDE.md - x-com-chat App Knowledge Base

AI-powered chat application with customizable alien friends and real-time
messaging.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15.5.0 with App Router and Turbopack
- **Real-time Backend**: Convex 1.26.1 for message persistence and live updates
- **State Management**: Jotai 2.13.1 for UI state coordination
- **Database**: Prisma 6.14.0 with SQLite for friend profiles
- **AI Providers**: Groq (fast inference), OpenRouter (model variety)
- **Authentication**: Clerk for user management
- **UI Components**: Radix UI primitives with custom shadcn components
- **Styling**: Tailwind CSS v4 with CSS variables for theming

### Data Flow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React UI  │────▶│  Jotai State │────▶│   Convex    │
│             │     │              │     │  Mutations  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       │                    │                     ▼
       ▼                    ▼              ┌─────────────┐
┌─────────────┐     ┌──────────────┐     │  Real-time  │
│ React Query │────▶│    Prisma    │     │   Updates   │
│   Caching   │     │   (Friends)  │     └─────────────┘
└─────────────┘     └──────────────┘
```

## Key Architectural Decisions

### Dual Database Strategy

- **Convex**: Real-time message storage, chat sessions, live subscriptions
- **Prisma/SQLite**: Friend profiles, system prompts, user preferences
- **Rationale**: Convex excels at real-time but Prisma provides better
  relational queries

### Chat Routing Pattern

- **Route**: `/chat/[[...chatAddress]]/page.tsx`
- **Dynamic segments**: Supports flexible URL structures
- **Friend selection**: Via URL params or UI selection
- **Chat ID generation**: UUID-based with prefixes (e.g., `msgc-` for user
  messages)

### Message Persistence

- **Convex Schema**: `chats` table with `messageList` as flexible array
- **Message format**: AI SDK's `UIMessage` type stored as-is
- **Indexing**: By `chatId` for efficient queries
- **Real-time sync**: Automatic via Convex subscriptions

## Core Components

### Chat System (`src/app/(chat)/chat/`)

```typescript
// Main chat interface
Chat.tsx; // Core chat UI with useChat hook
MessageList.tsx; // Message rendering with virtualization
Message.tsx; // Individual message component
Markdown.tsx; // Markdown renderer with syntax highlighting
```

### State Management (`src/lib/atoms.ts`)

```typescript
selectedFriendIdAtom; // Currently selected friend
selectedChatIdAtom; // Active chat session
```

### Data Fetching (`src/queries/`)

```typescript
chat.ts; // Chat history queries via Convex
friends.ts; // Friend profiles via Prisma
```

### Database Schemas

#### Convex (`convex/_schema.ts`)

```typescript
friend: {
  name: string
  system: string      // System prompt
}
chats: {
  chatId: string
  friendId: string
  friendName?: string
  messageList: any[]  // Flexible message storage
}
```

#### Prisma (`prisma/schema.prisma`)

```prisma
model Friend {
  id     String @id
  name   String
  email  String @unique
  system String // System prompt for AI
}
```

## AI Integration

### Chat Completion Flow

1. **Provider selection**: Groq (default) or OpenRouter
2. **System prompts**: Per-friend personality configuration
3. **Streaming**: Real-time token streaming via AI SDK
4. **Message handling**: Auto-save to Convex on completion

### Provider Configuration

```typescript
// Groq: Fast inference, llama models
// OpenRouter: Access to multiple models
// Configured via environment variables
```

## Development Workflows

### Running the App

```bash
# Terminal 1: Next.js development server
pnpm dev

# Terminal 2: Convex backend watcher
pnpm dev:convex

# Optional: Run both with Turbo
pnpm dev:x-com-chat  # From monorepo root
```

### Database Operations

#### Prisma Workflows

```bash
pnpm prisma:generate    # Generate client
pnpm db:push           # Push schema changes
pnpm db:reset          # Force reset database
pnpm db:seed           # Seed with test data
pnpm db:reinit         # Full reset + seed
```

#### Convex Operations

- Schema changes: Edit `convex/_schema.ts` then `npx convex dev`
- Migrations: Automatic via Convex CLI
- Data inspection: Use Convex dashboard

### Build Process

```bash
pnpm build            # Production build with Turbopack
pnpm build:analyze    # Bundle analysis
pnpm typecheck       # Type checking with Next.js typegen
```

## Environment Variables

### Required Keys

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Providers
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...  # Optional

# Database
DATABASE_URL=file:./prisma/x-com-chat.sqlite
CONVEX_DEPLOY_KEY=...         # For production

# Convex (auto-generated)
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

### Authorized Domains

Configured in `src/middleware.ts`:

- `http://localhost:3000`
- `https://x-com-chat.vercel.app`

## Critical File Map

```
apps/x-com-chat/
├── convex/
│   ├── _schema.ts              # Real-time data structure
│   └── chat.ts                 # Chat mutations/queries
├── prisma/
│   ├── schema.prisma           # Friend profiles schema
│   └── seed/init.ts           # Seed data
├── src/
│   ├── app/(chat)/chat/       # Chat UI components
│   ├── lib/atoms.ts           # Global state atoms
│   ├── queries/               # Data fetching logic
│   ├── middleware.ts          # Auth middleware
│   └── components/
│       ├── AppSidebar/        # Navigation sidebar
│       └── ui/                # Shadcn components
└── turbo.jsonc               # App-specific Turbo config
```

## UI/UX Patterns

### Component Library

- **Base**: Radix UI primitives for accessibility
- **Styled**: Custom shadcn components with CVA variants
- **Animation**: Motion (framer-motion successor) for transitions
- **Icons**: Lucide React + custom SVGs

### Theming System

```css
/* CSS variables in src/theme/ */
accent.css    # Primary colors
gray.css      # Neutral palette
stone.css     # Alternative neutrals
```

### Responsive Design

- Mobile-first approach
- Sidebar navigation with sheet component
- Responsive chat layout with flexbox/grid

## Performance Optimizations

### Code Splitting

- Route-based splitting via Next.js
- Dynamic imports for heavy components
- Turbopack for fast HMR in development

### Data Caching

- React Query for friend data
- Convex built-in caching for messages
- Next.js ISR for static content

### Bundle Optimization

- Tree shaking with Turbopack
- Analyze with `pnpm build:analyze`
- Selective Radix imports

## Testing Approach

### Type Safety

```bash
pnpm typecheck        # Full type checking
```

### Linting

```bash
pnpm lint            # Biome linting
pnpm lint:errors     # Show only errors
```

### Manual Testing

1. Create test friends with different personalities
2. Test message persistence across sessions
3. Verify real-time updates with multiple tabs
4. Check responsive design on various devices

## Deployment

### Vercel Deployment

- Auto-deploy from main branch
- Environment variables via Vercel dashboard
- Convex backend auto-scales

### Production Checklist

- [ ] Set production API keys
- [ ] Configure Clerk production domain
- [ ] Set up Convex production deployment
- [ ] Update authorized domains in middleware
- [ ] Enable monitoring/analytics

## Common Issues & Solutions

### Issue: Messages not persisting

- Check Convex connection in browser console
- Verify `NEXT_PUBLIC_CONVEX_URL` is set
- Ensure `convex dev` is running

### Issue: Authentication errors

- Verify Clerk keys match environment
- Check authorized domains in middleware
- Clear cookies and re-authenticate

### Issue: AI responses failing

- Validate API keys are set correctly
- Check provider status pages
- Fallback to alternative provider

## Future Enhancements

### Planned Features

- Friend image generation via ImageGen API
- Dynamic friend avatars based on chat context
- Group chat support
- Voice message support
- Message search and filtering

### Technical Improvements

- Migration to Server Components where possible
- Implement message pagination for long chats
- Add comprehensive error boundaries
- Enhance offline support with PWA features
