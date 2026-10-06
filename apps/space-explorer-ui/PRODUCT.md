# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

vite + react 19 + apollo client 4 + react-router-dom 7 + tailwind v4 with `packages/kit` (shadcn on base-ui) + `cva`, react-hook-form + zod for the one form. it talks to `space-explorer-api` over graphql; typed documents come from codegen. deployed on vercel as a static build.

## Users

- **a visitor of dima's github profile** — someone reading the readme who opens the live link to see a graphql client that works.
- **dima** — the owner; the app is a showcase and a place to try apollo ideas, not a daily tool.

## Product Purpose

space explorer lets anyone log in with an email, look at real rocket launches, put seats on hold and book them as trips. it exists to show a complete apollo client: paging, a normalised cache with type policies, client state in the same cache, optimistic updates and a clean way out when the session dies.

success: a visitor books a trip and cancels it in under a minute, and nothing on the way looks broken.

## Positioning

a boarding-ticket take on a classic graphql tutorial: the same launches-and-trips domain, dressed as a terminal-era departures board in the gruvbox palette, with the rough edges of the tutorial fixed.

## Operating Context

- 🐾 a pet app — basic on purpose (dima, 2026-09-27). it talks to the api's tracked sqlite; a local run pins the api to `:4000`
- the api rebuilds its db on every deploy, so an old browser session is gone after each one — the ui ends it and returns to login
- the cart lives only in the browser and empties at logout
- launches come from a public gateway with a rolling window, so an old trip's launch can age out

## Capabilities and Constraints

- four pages behind a login: launches, one launch, cart, trips
- light, dark and auto themes; a static scanline overlay in dark, never animated
- auth is demo-grade: the email is the token
- no payments, no seat limits, no real booking — a trip is a row, not a ticket anyone honours

## Brand Commitments

- the ticket is the one shape: a body with the mission, a stub with the flight number and the action, joined by a perforation
- blue is the accent (the cold of vacuum); purple only for text selection
- one mono face everywhere, uppercase letter-spaced labels
- square corners

## Evidence on Hand

- the live app at [space-explorer-ui.vercel.app](https://space-explorer-ui.vercel.app) and its readme shot `assets/apps/space-explorer-ui.webp`
- `FTR.md` for every feature, `GLOSSARY.md` for the words

## Product Principles

- every error names what failed and leaves a way on (retry, log in again) — never a dead page
- a user sees their seat state on the ticket itself, before any page change
- nothing shows another user's data, however the last session ended
