# AGENTS.md — x-com-chat

AI chat app with customizable alien 👽 friends. Each friend is a persona (a name +
a system prompt); chats stream from an LLM and persist in real time.

- **`FTR.md` + `GLOSSARY.md`** — every feature with its check, and the words they use. Read
  your section before changing what the app does.

🐾 **pet project** — basic on purpose (dima, 2026-09-27): every tree shares one Convex dev deployment and dima's own chat history. keep it; a test that sends a message, or runs `convex dev` from a worktree, says so in its report.

## Stack

Next.js 16 (App Router, React Compiler, `typedRoutes`), **Convex as the only backend** (no Prisma, no SQL, no React Query — reads go through Convex `useQuery`; `financial` is the React Query reference), Clerk wired through `src/proxy.ts` (Next 16's renamed middleware), AI SDK + Groq for streaming, Jotai for UI state, Tailwind v4 + kit.

## Architecture

### Data (Convex — `convex/`)
- `schema.ts` — `friend` (a persona + its system prompt) and `chats`; `messageList` stores raw AI SDK `UIMessage[]` as `v.array(v.any())` for forward-compat
- `chat.ts` — `seedFriends` (mutation), `getFriendList` / `getFriendById` /
  `getChatHistory` (queries), `saveChatHistory` (upsert mutation)
- `seed_data.ts` — the built-in `friendList`. Seed via `pnpm convex:seed`.

### Chat flow (`src/app/api/chat/route.ts`)
1. `POST /api/chat` receives the new message + chatId
2. `preloadQuery` pulls chat history + the friend (for its system prompt) from Convex
3. `streamText` (Groq, default `openai/gpt-oss-20b`) streams the reply;
   `customProvider` also exposes a reasoning model
   (`deepseek-r1-distill-llama-70b` via `extractReasoningMiddleware`)
4. `toUIMessageStreamResponse({ onEnd })` persists the full message list back to
   Convex via `fetchMutation(api.chat.saveChatHistory)`

### Frontend
- Routes: `(chat)/chat/[[...chatAddress]]` (the app), `settings`, `api/chat`.
  `/` redirects to `/chat` (see `next.config.ts`).
- Chat UI: `parts/Chat.tsx` (AI SDK `useChat`), `MessageList.tsx`, `Message/` (+ `Markdown.tsx`).
- State: `src/lib/atoms.ts` — `selectedFriendIdAtom`, `selectedChatIdAtom` (Jotai).
- Reads: `src/queries/chat.ts` — `useChatHistoryQuery` (Convex `useQuery`, not React Query).
- Shell: `src/components/AppSidebar/`, `Header.tsx`; theming in `src/theme/*.css`
  (`init.css` is the entry, pulls accent/gray + tailwind `@plugin`s).
- `src/components/ui/` — only the primitives carrying `brand:` styling (`sidebar`, `tooltip`,
  `textarea`); everything else comes from `@ui/kit/components`.

## Commands

`package.json` holds the scripts. run `pnpm dev:convex` beside `pnpm dev` (or `pnpm dev:x-com-chat` from the root for both); `pnpm convex:seed` seeds the built-in friends. `next build` type-checks (371 ms, measured clean).

## Environment

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# LLM
GROQ_API_KEY=...            # required
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

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md`
first** for important guidelines on how to correctly use Convex APIs and
patterns. The file contains rules that override what you may have learned about
Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
