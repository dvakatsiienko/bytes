# AGENTS.md — atelier, the fleet's art studio

Every picture the fleet makes — a readme hero, a spot, an icon, an avatar, a badge, a favicon —
is drawn here as code, lit, baked and shipped. There is no image model: a piece is a seeded,
reproducible drawing, and the quality comes from the loop: render, look, critique, revise.

Local only: `pnpm dev`, no vercel project, no deploy. Scripts: `package.json`.

## The authorities — read before changing

- **`PRODUCT.md`** — what atelier is for and who uses it. Read before changing what the app does.
- **`DESIGN.md`** + `.impeccable/design.json` — the look («the crafter and the lamp»). Read before
  changing how anything renders. Both are `impeccable`'s files: never hand-edit them.

## The shape

- `art/` — the drawing: palettes, paper helpers, the scene modules, `templates/`. **Node-safe**: the
  scripts import it, so nothing here touches the DOM.
- `art/pieces.ts` — the one registry. A piece missing here does not exist to the studio or the scripts.
- `src/stage/` — three.js: paper sheets lit by a sun, the passes, `scenes.ts` (which pieces are lit).
- `server/` — the take store and the bake, mounted on the dev server under `/api`.
- `takes/<piece>/<nn>-<time>[-note]/` — every bake, git-tracked: `bake.webp`, `settings.json`,
  `take.json` (seed, source hash, note, stash), `piece.svg` for a flat piece. `current.json` names
  the take that ships, per time of day.
- `out/` — script output (icon sizes), git-ignored.

## Add a piece — any art ask

1. Copy the template for the kind from `art/templates/` (scene, spot, icon, avatar, badge,
   favicon) to `art/<name>.ts` and rename its exports.
2. Register it in `art/pieces.ts`: an id, a rail `group`, its `kind`, the alt-text `title`, the
   `size`, `draw`, and `ship` when a readme will show it.
3. A lit scene also joins `stageScenes` in `src/stage/scenes.ts`: its sheets (`layers`), which
   sheets the wind moves, and its lights and moving parts (`extras`).
4. Draw. The studio hot-reloads a saved `art/` file into the viewport — no reload, no rebuild.

Done when the piece shows in the rail and renders by day and by night:
`[data-testid=stage][data-rendered="<piece>:<time>"]` is the signal a headless check waits for.

## Bake, compare, ship

- **Bake** writes a take: the bench button, `b`, or `pnpm atelier:bake <piece> [day|night|both]`.
  `--loop [frames]` (or «bake a motion loop» in ⌘K) bakes the stage's six-second motion into a
  looping animated webp at 1×, 72 frames by default; `take.json` records `frames`.
  One code path for all three (`server/bake.ts`): a lit scene renders in headless chromium at
  2×, a flat piece goes svgo → resvg; sharp writes the webp. The first take of a time becomes
  current; `promote` changes it.
- **Stash** a take that is good but wrong for now, with both reasons. A take is never deleted —
  a stashed one comes back for the right job.
- **Ship**: `pnpm atelier:ship [piece…]` prints the plan; `--write` copies each current take to
  `<repo>/assets/atelier/<name>-light|dark.<svg|webp>`. It writes into three repos (frame, bytes,
  the profile) and never commits. `assets/atelier/` is atelier's own folder, so v1 art is never
  overwritten; the readmes switch to it on dima's `brand:use` call.
- **Icons**: `pnpm atelier:icons <piece>` → svg + png at 16–512 in `out/icons/<piece>/`.

## Gotchas

- A bake loads `art/` through vite's module loader, so it always draws the code on disk now. A
  node script that imports `art/` directly is fine too — nothing there needs a bundler.
- `ATELIER_TAKES_DIR` points the take store at a scratch folder: tests and verifier rounds use
  it, so they never write into the real takes. It is declared in the root `turbo.jsonc`.
- The stage's «exact» look is no tone mapping on sRGB maps: a lit spot shows its map's colour.
  The passes are three's own (`src/stage/renderer.ts`). They match pmndrs `postprocessing` in
  colour (measured on BYT-103); the two differ only in edge blur and antialiasing.
- Chromium's first bake on a fresh machine needs `pnpm exec playwright install chromium`; the
  bake error says so. On a mac it renders on the GPU (Metal), elsewhere in software (SwiftShader).
