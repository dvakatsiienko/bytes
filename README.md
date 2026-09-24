🫙 **bytes**: the apps.

<p align="center">
  <img src="assets/badges/apps.svg" alt="apps">
  <img src="assets/badges/packages.svg" alt="packages">
  <img src="assets/badges/tests.svg" alt="tests">
  <img src="assets/badges/deps.svg" alt="deps">
  <img src="assets/badges/node.svg" alt="node">
  <img src="assets/badges/pnpm.svg" alt="pnpm">
</p>

<picture><source media="(prefers-color-scheme: dark)" srcset="assets/hero-dark.svg"><img src="assets/hero-light.svg" width="100%" alt="bytes — the apps: a glass jar with a brass lid, fireflies glowing inside"></picture>

### 🧭 toc

- [trophy-sys](#-trophy-sys) — psn trophies in a dos terminal
- [x-com chat](#-x-com-chat) — chat with alien friends
- [space explorer](#%EF%B8%8F-space-explorer) — a graphql client and its server
- [financial](#-financial) — invoices on one sheet
- [cv](#-cv) — the cover page
- [figmentation](#%EF%B8%8F-figmentation) — figma files, rebuilt in css
- [shared](#-shared) — the kit, the configs, the workbench

## 🎮 trophy-sys

a playstation trophy tracker that looks like a dos terminal: the whole psn library, every
trophy per game and dlc, and what is new since the last look.

[live](https://trophy-sys.vercel.app) | [source](apps/trophy-sys)

<img src="assets/apps/trophy-sys.webp" width="100%" alt="trophy-sys: the library of synced games next to one game's trophy list">

## 👽 x-com chat

an ai chat with alien friends, each with its own quirks. a friend's picture shifts as the chat
goes on.

[live](https://x-com-chat.vercel.app) | [source](apps/x-com-chat)

<img src="assets/apps/x-com-chat.webp" width="100%" alt="x-com chat: a conversation with jacob, his portrait on the left">

## 🛰️ space explorer

a graphql pair: an apollo client books a seat on the next spacex launch, an apollo server with
prisma answers it.

[live](https://space-explorer-ui.vercel.app) | [api](https://space-explorer-api.up.railway.app/) | [ui source](apps/space-explorer-ui) | [api source](apps/space-explorer-api)

<img src="assets/apps/space-explorer-ui.webp" width="100%" alt="space explorer: the boarding card with an apollo rocket and an email login">

## 🏄 financial

invoicing, kept straight: what was billed, what was paid, what is still owed, on one sheet.

[live](https://financical.vercel.app) | [source](apps/financial)

<img src="assets/apps/financial.webp" width="100%" alt="financial: a sheet of march payments, all settled">

## 🦦 cv

the cover page: a short brief and the tools in use, grouped by what they do.

[live](https://ripeluokte.vercel.app) | [source](apps/cv)

<img src="assets/apps/cv.webp" width="100%" alt="cv: the brief card and the grid of tools">

## ☘️ figmentation

figma files rebuilt in plain css modules. clinique is the first one.

[live](https://figmentation.vercel.app/clinique) | [source](apps/figmentation) | [figma file](https://www.figma.com/design/C83qYEFPJ8C66yIrTjEk29/Clinique?m=auto&t=p08olW2Pvhdsl68U-6)

<img src="assets/apps/figmentation.webp" width="100%" alt="figmentation: the clinique product page for even better glow">

## 🧰 shared

- [`kit`](packages/kit) — the one design system, shadcn on base ui
- [`biome-config-polished`](packages/biome-config-polished) — lint and format rules for every app
- [`prettier-config-polished`](packages/prettier-config-polished) — the same, for prettier, [on npm](https://www.npmjs.com/package/prettier-config-polished)
- [`typescript-config`](packages/typescript-config) and [`utils`](packages/utils) — the base tsconfigs and small helpers
- [`proto-lab`](apps/proto-lab) — a local vite workbench for prototypes, never deployed

## 🏎️ run it

a pnpm workspace, run by [turborepo](https://turborepo.com).

```bash
pnpm i
pnpm dev:trophy-sys   # or any dev:<app>
pnpm badges:sync      # redraw the badges above
```
