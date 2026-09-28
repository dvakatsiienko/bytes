# cv — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

📌 basic shape on purpose: the redesign rewrites this map.

## every page — the browser frame

- ⬜ the browser frame holds every page
  - when anyone opens any route
  - then the page sits inside a window with three dots, a «cv · cover» tab bar and a theme toggle, and scrolls inside that window
- ⬜ the «cv · cover» tabs mark the open page
  - when the visitor clicks «cover»
  - then `/cover` opens and «cover» is the highlighted tab
- ⬜ theme: light, dark, system
  - when the visitor clicks the moon in the header
  - then the site turns dark and stays dark on the next visit

## / — cv

- ⬜ the «brief» block
  - then it lists name, email, location, links (full cv, github, linkedin, telegram), role and languages, with the photo on the right from the `sm` width up
- ⬜ «tools I use»
  - then eleven groups show their tools as icon chips: core, style, state, network, components, UX · motion, auth, db, AI, bundlers, LLM
- ⬜ «portfolio»
  - then each job shows its dates, employer link, role and a short story, newest first

## /cover — cover

- ⬜ the cover letter counts its years
  - when anyone opens `/cover`
  - then the years of experience (total, react, next.js, typescript, tailwind) are computed from the current year
- ⬜ «see more tools I use» jumps to the tools
  - when the visitor clicks the link
  - then `/` opens scrolled to «tools I use»
- ⬜ the contact line links email, linkedin, telegram and the full cv

## every route — not found

- ⬜ an unknown path shows «Not Found» inside the frame

## scripts

- ⬜ `pnpm dev:analyze` opens next's bundle analyzer
- ⬜ `pnpm dev:vc` runs the site under `vercel dev`
