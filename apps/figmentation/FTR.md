# figmentation — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## / — engineering and design

- ⬜ a card per study, with its preview image, title and description
  - given the production build
  - then only the «Clinique» card shows
  - and in `pnpm dev` the «Tesla Landing» card shows beside it
- ⬜ «Visit» opens the study
  - when the user clicks «Visit», or anywhere on the card
  - then the study's own route opens in the same tab
- ⬜ «Figma file» opens the study's figma design
  - when the user clicks «Figma file»
  - then the figma file opens in a new tab and the card's own link does not fire
- ⬜ a card lifts and its image zooms on hover
- ⬜ the cards stack to one column on a phone, two at `md`, three at `xl`

## /clinique — product page

- ⬜ a sticky header: the clinique logo, four nav labels and «Bag (0)»
  - when the user scrolls
  - then the header stays on top over a blurred paper band
  - and below 640 px only the logo shows, centred
- ⬜ a nav label underlines on hover
- 🐞 the ticker: «allergy tested · 100% fragrance free · dermatologist developed» slides in a loop under the header
  - fails: the loop repaints forever, even while nobody watches it
- ⬜ the hero: the foundation bottle on a halo and a grain grid, beside breadcrumbs and the product copy
  - given a window 640 px or wider
  - then the image sits left and the copy right
  - and below 640 px breadcrumbs, image and copy stack in that order
- ⬜ the facts grid: benefits, coverage, finish, key ingredients
- ⬜ the shade chip «WN 04 BONE» and the quantity stepper — shown, not wired: − and + change nothing
- ⬜ «Add to Bag» — shown, not wired
- ⬜ «Works well with»: four product cards with a price and «Shop now»
  - when the user hovers a card
  - then the card lifts and its product tilts and grows
- ⬜ the footer: the logo and «figmentation study · not affiliated»

## /tesla-landing — Model Y landing, work in progress

- ⬜ the Model Y hero with «Order Now» and «View Inventory»
- ⬜ the header sits clear over the hero and turns white from 600 px wide
- ⬜ «Menu» opens a drawer from the top below 1280 px — its copy is still a placeholder («Are you absolutely sure?»)

## scripts

- ⬜ `pnpm dev` serves the app on 3000 + the worktree offset
- ⬜ `pnpm build` and `pnpm serve` build and serve the production app
