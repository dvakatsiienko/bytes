@AGENTS.md

# CLAUDE.md — x-com-chat

AI chat app with customizable alien 👽 friends. Each friend is a persona (a name +
a system prompt); chats stream from an LLM and persist in real time.

## Stack

- **Next.js 16** — App Router, Turbopack, React Compiler (`reactCompiler: true`), `typedRoutes`
- **React 19**, **TypeScript** (strict)
- **Convex** — the *only* backend: reactive DB, queries/mutations, live subscriptions
- **Clerk** — auth, wired through `src/proxy.ts` (Next 16's renamed middleware)
- **AI SDK 6** (`ai`) + **Groq** provider — streaming chat completions
- **Jotai** — client UI state
- **Tailwind v4** + **shadcn/ui** (new-york) + **cva** + **motion**

> No Prisma, no SQL database. Persistence is 100% Convex. (No React Query either —
> reads go through Convex `useQuery`; see `financial` for a React Query reference setup.)

## Architecture

### Data (Convex — `convex/`)
- `schema.ts` — two tables:
  - `friend` `{ name, system }` — the persona + its system prompt
  - `chats` `{ friendId, friendName?, messageList }`, indexed `by_friendId`
  - `messageList` stores raw AI SDK `UIMessage[]` as `v.array(v.any())` for forward-compat
- `chat.ts` — `seedFriends` (mutation), `getFriendList` / `getFriendById` /
  `getChatHistory` (queries), `saveChatHistory` (upsert mutation)
- `seed_data.ts` — the built-in `friendList`. Seed via `pnpm convex:seed`.

### Chat flow (`src/app/api/chat/route.ts`)
1. `POST /api/chat` receives the new message + chatId
2. `preloadQuery` pulls chat history + the friend (for its system prompt) from Convex
3. `streamText` (Groq, default `llama-3.1-8b-instant`) streams the reply;
   `customProvider` also exposes `llama-3.3-70b-versatile` and a reasoning model
   (`deepseek-r1-distill-llama-70b` via `extractReasoningMiddleware`)
4. `toUIMessageStreamResponse({ onFinish })` persists the full message list back to
   Convex via `fetchMutation(api.chat.saveChatHistory)`
- An OpenRouter provider is wired but **inactive** (`_openrouter`, models commented out).
  Its key comes from `OPENROUTER_API_KEY` (optional; Groq is the only required key).

### Frontend
- Routes: `(chat)/chat/[[...chatAddress]]` (the app), `settings`, `api/chat`.
  `/` redirects to `/chat` (see `next.config.ts`).
- Chat UI: `parts/Chat.tsx` (AI SDK `useChat`), `MessageList.tsx`, `Message/` (+ `Markdown.tsx`).
- State: `src/lib/atoms.ts` — `selectedFriendIdAtom`, `selectedChatIdAtom` (Jotai).
- Reads: `src/queries/chat.ts` — `useChatHistoryQuery` (Convex `useQuery`, not React Query).
- Shell: `src/components/AppSidebar/`, `Header.tsx`; theming in `src/theme/*.css`
  (`init.css` is the entry, pulls accent/gray/stone + tailwind `@plugin`s).
- `src/components/ui/` — vendored shadcn primitives (kept complete; knip ignores them).

## Commands

```bash
pnpm dev            # next dev --inspect
pnpm dev:convex     # convex dev (run alongside; or `pnpm dev:x-com-chat` from root for both)
pnpm convex:seed    # seed built-in friends (convex run chat:seedFriends)
pnpm build          # next build
pnpm serve          # next start
pnpm lint           # biome lint
pnpm typecheck      # next typegen && tsc
pnpm knip           # dead-code / unused-deps check (config in knip.ts)
```

> `next.config.ts` sets `typescript.ignoreBuildErrors: true` on purpose — type safety
> is enforced via `pnpm typecheck` (tsc) + Biome in CI, not at build time.

## Environment

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# LLM
GROQ_API_KEY=...            # required
OPENROUTER_API_KEY=...      # optional (provider currently inactive)
# Convex
NEXT_PUBLIC_CONVEX_URL=...
CONVEX_DEPLOYMENT=...
CONVEX_DEPLOY_KEY=...       # production / CI builds
```

Authorized auth origins are set in `src/proxy.ts` (`localhost:3000`,
`x-com-chat.vercel.app`).

## Conventions

- Components: named arrow exports, `props.x` accessor (no destructuring), file layout
  `imports → component → helpers → types` (see root guides).
- Convex: before backend work, read `convex/_generated/ai/guidelines.md` (overrides
  training-data assumptions). Convex agent skills live under `.agents/skills/`.
