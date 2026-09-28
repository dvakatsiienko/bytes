# sketchbook — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## / — the live proto

- ⬜ the live proto fills the page
  - given a `current-<topic>` proto exists
  - when dima opens `/`
  - then its take renders under the header, the ticket strip and above the footer
- ⬜ the «answering» header shows the proto's question
  - given the live proto declares a question
  - then the header reads «sketch·book», and on the right «answering» over the question
  - and a settled proto also shows «settled: <verdict>» in cobalt
- ⬜ the ticket strip
  - given `tickets.ts` holds at least one ticket
  - then a «tickets» row groups the chips under «in progress», «done» and «touched», each with its dot
  - and a chip opens the ticket in the linear desktop app
- ⬜ the variant switcher
  - given the live proto exports two or more variants
  - when dima clicks a variant's pill at the bottom of the page
  - then that variant renders, the path becomes `/<variant>` and `?v=` follows
  - decision: a variant is a place, so it lives in the path
- ⬜ the footer names the proto folder
  - then the footer reads «<folder> · throwaway on purpose — no tests, no persistence, no abstractions»
- ⬜ with nothing live, `/` lands on the first bench lane
  - given no `current-*` proto exists and a bench lane does
  - when dima opens `/`
  - then `/bench/<first lane>` opens
- ⬜ with nothing at all, the page says what to run
  - given no live proto, no bench lane and no page exist
  - then the page reads «no live proto — run pnpm proto:new <topic>»

## every page — the bench nav

- ⬜ the «bench» row lists every bench lane
  - given one or more `bench-<lane>` folders exist
  - when dima clicks a lane
  - then `/bench/<lane>` opens and the lane is underlined
- ⬜ the «pages» row lists every archived page
  - given one or more numbered archives exist
  - when dima clicks a page
  - then `/pages/<NNN-topic>` opens and the page is underlined
- ⬜ theme: light, dark
  - when dima clicks «☀ light» / «☾ dark» at the right of the nav
  - then the theme flips; the first load follows the system setting

## /bench/<lane> — a bench lane

- ⬜ a bench lane owns the page below the nav
  - when dima opens `/bench/<lane>`
  - then only the lane renders — no header, no ticket strip, no footer, so nothing biases the judging
  - and an unknown lane reads «no such lane»

## /pages/<NNN-topic> — an archived page

- ⬜ an archived page opens as it was left
  - when dima opens `/pages/<NNN-topic>`
  - then its single take, or its first variant, renders
  - and an unknown page reads «no such page»

## proto tools — used inside a proto

- ⬜ the state panel
  - given a proto renders the state panel
  - then a «state» panel at the bottom left shows the proto's whole state as json, live
  - and its «−» / «+» folds it

## scripts

- ⬜ `pnpm proto:new <topic>` starts a proto
  - makes: `src/protos/current-<topic>/index.tsx`, a blank proto
  - given nothing is live
- ⬜ `pnpm proto:shift <topic>` turns the page
  - makes: the live proto renamed to the next `NNN-<old topic>`, and a blank `current-<topic>`
  - then the old page stays openable at `/pages/<NNN-old topic>`
- ⬜ `pnpm proto:clear` empties the book
  - makes: a blank `current-scratch`, every other proto deleted
- ⬜ `pnpm proto:list` prints the book
  - then every archive and the live proto print in order, each with its question
