# A Next app with Convex as its only backend, replies streamed from Groq

x-com-chat is a Next.js 16 app (App Router, React 19, React Compiler, Tailwind v4 with `@ui/kit`, Jotai for ui state, motion) on Vercel. Convex is the only backend: friends and chats live there, the chat page reads them live, and every reply is saved back as the raw AI SDK message list. Replies stream through the AI SDK from Groq (`openai/gpt-oss-20b` by default). Clerk handles sign-in. What it buys, as the code shows it: live, reactive storage with no server or database of our own to run, and a model provider swappable behind one `customProvider`. (the original reasons were never written down; this record is drafted from the code and history.)

## Considered options

- **Prisma on a SQL database** — the app's first store. Removed in favour of Convex (`f4d42a42`): a live subscription replaced hand-written fetching, and no database or migrations are left to run.
- **React Query for reads** — not used here on purpose: reads go through Convex's own `useQuery`. `financial` is the React Query reference.

## Consequences

- messages are stored untyped (`v.any()`), so an AI SDK major bump never needs a data migration.
- every tree shares one Convex dev deployment and dima's chat history — the app is a 🐾 pet, basic on purpose.
