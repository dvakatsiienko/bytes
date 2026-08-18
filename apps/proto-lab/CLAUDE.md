# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## proto-lab — prototype platform

A permanent Vite app that replaces throwaway HTML prototypes. Everything is preinstalled so a
new prototype starts at zero setup cost.

The split is the whole point:

- **`src/frame/`** — the stable half: shell, palette tokens, fonts. Survives every reset.
- **`src/protos/`** — the swappable half: one live `current-<topic>` plus numbered archives.
- **`src/components/ui/`** — shadcn primitives, owned not sacred (convert-on-touch to house style).

The contract between the two halves is two exports from the live proto's `index.tsx`:
`protoMeta` (title + blurb, rendered in the header) and `Proto` (the component). The frame
resolves it with `import.meta.glob('/src/protos/current-*/index.tsx')`, so the folder name
can carry the topic and a rename never touches an import.

Two rules keep that true:

- **Inside a proto, imports are relative** (`./data`, `../data`). An `@/protos/...` path
  breaks the moment the proto is shifted. Frame imports (`@/components/ui/...`) are fine.
- **Archive numbers only count up.** A shifted proto is never renamed again, so a-z order
  in an editor equals shift order, and one shift is one renamed directory in the diff.

## Commands

```bash
pnpm dev          # vite on :5179
pnpm build        # vite build
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome
pnpm proto-new <topic>     # start a proto when nothing is live
pnpm proto-shift <topic>   # archive the live proto as NNN-<old topic>, start a blank one
pnpm proto-clear           # delete every proto, leave a blank current-scratch
pnpm proto-list            # show archives and the live proto, in order
```

## Design tokens

Defined once in `src/frame/theme.css`, light theme only, named after the thing not the role:
`--bone` (ground) · `--ink` (text) · `--cobalt` (primary / done) · `--amber` (in-flight) ·
`--mist` (queued) · `--rule` (hairlines). The shadcn variable set (`--background`,
`--primary`, …) is mapped onto these — change a palette value in one place.

Three faces: Bricolage Grotesque (display), Inter (body), JetBrains Mono (data and labels).

## Notes

- Dependencies stay installed across every lifecycle command on purpose. Pruning is manual.
- Archived protos are committed, not ignored — they are the record of what was tried.
- Not deployed. There is no `vercel.json` — add one if that ever changes.
