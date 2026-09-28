# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

vite + react 19 + tailwind v4 + typescript, tanstack router, `motion`, `recharts`, lucide icons, controls from `packages/kit` (shadcn on base-ui), inside the bytes monorepo. the stack pick is `docs/adr/0001-the-stack.md`.

## Users

- **dima** — asks the question, looks at the page, settles the verdict. he also glances at the live proto as a status board while dispatch works.
- **the fleet's agents** — the hands. a session builds the proto, streams board updates into it, and shifts it when a new question arrives.

## Product Purpose

sketchbook is where a question about app state or interaction gets answered with a page instead of a paragraph. one proto is live at a time and answers one question; when the question is settled, the page is archived and stays openable, so the book keeps the record of what was tried.

success: a new question gets a running page with no setup, and an old answer is one click away.

## Positioning

a permanent sketchbook, not a pile of throwaway html. the frame never changes between protos; only the page does. a question about how an image looks belongs to atelier, not here.

## Operating Context

- local only: vite dev on dima's mac, `:5179`, no deploy, no auth
- memory only: a proto never persists anything
- archived protos are committed, they are the record
- the live proto can double as a status board fed by dispatch

## Capabilities and Constraints

- one live proto, any number of archived pages, any number of bench lanes
- a proto is throwaway: no tests, no error handling, no abstractions, mock data in its own folder
- lifecycle commands live in `scripts/proto.ts`: new, shift, clear, list
