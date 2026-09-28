# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

next.js 16 (app router) + react 19 + tailwind + typescript, prisma 7 over postgres, better-auth, react query, react-hook-form + zod, inside the bytes monorepo. the why lives in `docs/adr/0001-the-stack.md`.

## Users

- **a small-business owner** — the imagined user: bills a handful of customers, wants to see what is paid and what is owed at a glance.
- **dima** — the real user today: it is his study and demo piece, shown on the bytes readme.

## Product Purpose

financial keeps invoices straight: every invoice, its customer, its amount and whether it is paid, on one sheet. success: an owner sees collected and pending money in one look, and creates or corrects an invoice in under a minute, without a spreadsheet.

## Positioning

a ledger, not a saas dashboard. the look is greenbar paper — the banded continuous-feed sheets line printers used for statements — so figures read across a row the way an accountant reads them.

## Operating Context

- 🐾 a pet app: a basic setup on purpose. `pnpm dev` runs against the hosted prisma postgres, the same data production shows; a throwaway test uses a scratch postgres (`financial-run` shows how)
- deployed on vercel from `main` through the repo's Deploy workflow; live at financical.vercel.app
- one seeded user and sample customers, invoices and revenue come from `prisma/seed`

## Capabilities and Constraints

- invoices only: create, edit, delete, search, page through; customers and revenue are read-only here
- two statuses, pending and paid; one currency, dollars
- money is exact to the cent everywhere
- works from phone width up; the sidenav becomes an icon row on narrow screens
