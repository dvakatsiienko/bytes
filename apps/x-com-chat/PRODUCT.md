# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

next.js 16 + react 19 + tailwind v4 + typescript, convex as the only backend, clerk for sign-in, the ai sdk streaming from groq, jotai for ui state, controls from `packages/kit` (shadcn on base-ui). the why lives in `docs/adr/0001-the-stack.md`.

## Users

- **dima** — the one real user today. he chats with the friends and uses the app as his test bed for ai chat ux.
- **a visitor from the portfolio** — opens the live app, signs in or not, and chats with a friend to see what it does.

## Product Purpose

x-com-chat is an ai chat where the other side is a friend, not an assistant. each alien friend has a name, a portrait and a persona, and answers in character. a conversation is kept and comes back on reload.

success: a visitor picks a friend, gets a streamed, in-character reply in a second or two, and the chat is still there when they return.

## Positioning

a chat with characters, not a general assistant. the friends are the product; the model behind them can change.

## Operating Context

- 🐾 a pet app, basic on purpose (dima, 2026-09-27): every tree shares one convex dev deployment and dima's own chat history. an agent keeps that setup and never «fixes» it.
- deployed on vercel at `x-com-chat.vercel.app`; ci cannot build it (prerender calls convex).
- chats are not per user yet: signing in changes nothing about which chats you see.
- the settings page is a stub, not connected.

## Capabilities and Constraints

- three built-in friends (jacob, sativa, akira); a new friend is a seed entry plus a portrait in `public/friends/`.
- replies stream and can be stopped; reasoning shows folded when the model sends it.
- keyboard first: ⌘K, ⌘↵, ⌘⇧K, ⌘P, ⌘B.
