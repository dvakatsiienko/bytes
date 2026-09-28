<p align="center">
  <a href="https://github.com/dvakatsiienko/bytes/actions/workflows/ci.yml"><img src="https://raw.githubusercontent.com/dvakatsiienko/bytes/badges/ci.svg" alt="ci"></a>
  <img src="assets/badges/tests.svg" alt="tests">
  <img src="assets/badges/renovate.svg" alt="renovate">
  <img src="assets/badges/node.svg" alt="node">
  <img src="assets/badges/pnpm.svg" alt="pnpm">
  <img src="assets/badges/apps.svg" alt="apps">
  <img src="assets/badges/packages.svg" alt="packages">
  <img src="assets/badges/deps.svg" alt="deps">
</p>

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg"><img src="assets/hero-light.svg" width="100%" alt="bytes — the apps: inside a paper-cut log cabin, a paper t-rex reads in the armchair by day and sleeps on the rug by the fire at night"></picture>

## 🛸 apps

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/trophy-sys-dark.svg"><img align="right" width="110" src="assets/avatars/trophy-sys-light.svg" alt="trophy-sys: its jar"></picture>

**trophy-sys** — a playstation trophy tracker that looks like a dos terminal.

[live](https://trophy-sys.vercel.app) | [source](apps/trophy-sys)

<details><summary>peek</summary><img src="assets/apps/trophy-sys.webp" width="100%" alt="trophy-sys: the library of synced games next to one game's trophy list"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/x-com-chat-dark.svg"><img align="right" width="110" src="assets/avatars/x-com-chat-light.svg" alt="x-com chat: its jar"></picture>

**x-com chat** — an ai chat with alien friends, each with its own quirks.

[live](https://x-com-chat.vercel.app) | [source](apps/x-com-chat)

<details><summary>peek</summary><img src="assets/apps/x-com-chat.webp" width="100%" alt="x-com chat: a conversation with jacob, his portrait on the left"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/space-explorer-dark.svg"><img align="right" width="110" src="assets/avatars/space-explorer-light.svg" alt="space explorer: its jar"></picture>

**space explorer** — a graphql pair: book a seat on the next spacex launch.

[live](https://space-explorer-ui.vercel.app) | [source](apps/space-explorer-ui) | [api](https://space-explorer-api.up.railway.app/) | [api source](apps/space-explorer-api)

<details><summary>peek</summary><img src="assets/apps/space-explorer-ui.webp" width="100%" alt="space explorer: upcoming launches as mission cards, each with its rocket, site and flight number, dark theme"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/cv-dark.svg"><img align="right" width="110" src="assets/avatars/cv-light.svg" alt="cv: its jar"></picture>

**cv** — the cover page: a short brief and the tools in use.

[live](https://ripeluokte.vercel.app) | [source](apps/cv)

<details><summary>peek</summary><img src="assets/apps/cv.webp" width="100%" alt="cv: the brief card and the grid of tools"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/financial-dark.svg"><img align="right" width="110" src="assets/avatars/financial-light.svg" alt="financial: its jar"></picture>

**financial** — invoicing, kept straight: billed, paid, still owed.

[live](https://financical.vercel.app) | [source](apps/financial)

<details><summary>peek</summary><img src="assets/apps/financial.webp" width="100%" alt="financial: the dashboard with collected and pending totals, twelve months of revenue and the latest invoices"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/figmentation-dark.svg"><img align="right" width="110" src="assets/avatars/figmentation-light.svg" alt="figmentation: its jar"></picture>

**figmentation** — design studies: a figma file, rebuilt in code.

[live](https://figmentation.vercel.app) | [source](apps/figmentation)

<details><summary>peek</summary><img src="assets/apps/figmentation.webp" width="100%" alt="figmentation: the clinique study, a foundation bottle beside its product details"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/sketchbook-dark.svg"><img align="right" width="110" src="assets/avatars/sketchbook-light.svg" alt="sketchbook: its jar"></picture>

**sketchbook** — the prototype bench: one live proto, old pages kept to flip back to.

local only | [source](apps/sketchbook)

<details><summary>peek</summary><img src="assets/apps/sketchbook.webp" width="100%" alt="sketchbook: an archived page, the memory map with its counts, link graph and roster"></details>

<br clear="all">

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/avatars/atelier-dark.svg"><img align="right" width="110" src="assets/avatars/atelier-light.svg" alt="atelier: its jar"></picture>

**atelier** — the art studio: every picture drawn as code, lit, and kept as takes.

local only | [source](apps/atelier)

<details><summary>peek</summary><img src="assets/apps/atelier.webp" width="100%" alt="atelier: the homestead scene on the stage, the pieces list on the left and its light settings on the right"></details>

<br clear="all">

## 🧰 libraries

- [`biome-config-polished`](packages/biome-config-polished) — the lint and format rules every app extends
- [`prettier-config-polished`](packages/prettier-config-polished) — the prettier rules, [on npm](https://www.npmjs.com/package/prettier-config-polished)

## 🏎️ run it

a pnpm workspace, run by [turborepo](https://turborepo.com).

```bash
pnpm i
pnpm dev:trophy-sys   # or any dev:<app>
pnpm badges:sync      # redraw the badges above
```
