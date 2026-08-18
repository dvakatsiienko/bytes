# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## proto-lab — prototype platform

A permanent Vite app that replaces throwaway HTML prototypes. Everything is preinstalled so a
new prototype starts at zero setup cost.

The split is the whole point:

- **`src/frame/`** — the stable half: shell, palette tokens, fonts. Survives every reset.
- **`src/protos/current/`** — the swappable half: exactly one prototype at a time.
- **`src/components/ui/`** — shadcn primitives, owned not sacred (convert-on-touch to house style).

The contract between the two halves is two exports from `src/protos/current/index.tsx`:
`protoMeta` (title + blurb, rendered in the header) and `Proto` (the component).
The frame imports nothing else from a proto — so `node --run reset` can delete the folder
wholesale and rewrite a stub.

## Commands

```bash
pnpm dev          # vite on :5179
pnpm build        # vite build
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome
node --run reset  # clear src/protos/current, keep the frame and node_modules
```

## Design tokens

Defined once in `src/frame/theme.css`, light theme only, named after the thing not the role:
`--bone` (ground) · `--ink` (text) · `--cobalt` (primary / done) · `--amber` (in-flight) ·
`--mist` (queued) · `--rule` (hairlines). The shadcn variable set (`--background`,
`--primary`, …) is mapped onto these — change a palette value in one place.

Three faces: Bricolage Grotesque (display), Inter (body), JetBrains Mono (data and labels).

## Notes

- Dependencies stay installed across resets on purpose. Pruning is manual and periodic.
- Not deployed. There is no `vercel.json` — add one if that ever changes.
