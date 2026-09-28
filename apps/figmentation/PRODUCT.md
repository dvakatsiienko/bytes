# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

next.js 16 (app router) + react 19.3 with the react compiler, tailwind v4 through `@ui/kit`'s globals, css modules for a study's own art, cva. inside the bytes monorepo, deployed to vercel. the decision and its history: `docs/adr/0001-the-stack.md`.

## Users

- **dima** — the author. he draws a study in figma, then codes it, to practise both halves.
- **visitors of his portfolio** — they open a study from the home page and compare it with its figma file.

## Product Purpose

figmentation keeps the sites dima recreated while learning ui design in figma. each study is a real page redrawn in figma first, then built in code, and the home page lists them with a link to both.

success: a study looks like its figma file at every width, and a visitor can open both side by side in one click.

## Positioning

design and engineering from one hand: every study ships with the figma file it came from, so the design decisions are visible, not only the result.

## Operating Context

- deployed on vercel; a study still in progress shows its card only in `pnpm dev`, its route stays reachable
- no backend, no auth, no data: every page is static content
- studies are isolated — each one owns its palette, its images under `public/<study>/` and its figma file

## Capabilities and Constraints

- a study recreates a real brand's page for practice and says so («not affiliated»); the brand's assets stay inside that study
- controls in a study are shown, not wired: a bag button or a quantity stepper does nothing
- the study's figma file is the source; the code follows it
