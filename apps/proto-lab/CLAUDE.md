# CLAUDE.md — proto-lab, prototype platform

A permanent Vite app that replaces throwaway HTML prototypes. Everything is preinstalled so a
new prototype starts at zero setup cost.

The split is the whole point:

- **`src/frame/`** — the stable half: shell, palette tokens, fonts. Survives every reset.
- **`src/protos/`** — the swappable half: one live `current-<topic>` plus numbered archives.
- **`src/components/ui/`** — shadcn primitives, owned not sacred (convert-on-touch to house style).

The contract between the two halves is what the live proto's `index.tsx` exports:
`protoMeta` (`question` required, `title`, optional `verdict`) plus either `Proto` or a
`variants` record. The frame
resolves it with `import.meta.glob('/src/protos/current-*/index.tsx')`, so the folder name
can carry the topic and a rename never touches an import.

Two rules keep that true:

- **Inside a proto, imports are relative** (`./data`, `../data`). An `@/protos/...` path
  breaks the moment the proto is shifted. Frame imports (`@/components/ui/...`) are fine.
- **Every proto answers one question**, declared in `protoMeta.question` and rendered in
  the header. `proto-list` greps it back out of each archive, so the folder stays readable
  after the proto is cold. `verdict` records what it settled.
- **A proto is throwaway.** No tests, no error handling, no abstractions, no persistence —
  memory only. `@/frame/state-inspector` renders live state so a wrong state model is
  visible instead of inferred.
- **Two or more `variants`** put a switcher on screen and sync `?v=`. One take exports
  `Proto`.
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

## Implementation flavours

Default choices applied unless told otherwise in the moment.

- **Motion** — use `motion` (motion.dev, `import { motion } from 'motion/react'`) for slight
  animations here and there, for pretty sakeness. Entrances, rail ticks, card stagger. Small
  and quick — under ~400ms, low travel, never a whole choreography. `theme.css` already honours
  `prefers-reduced-motion`; keep it that way.
- **shadcn first** — compose the new-york primitives in `src/components/ui` before writing raw
  markup; add a missing one with the shadcn cli rather than hand-rolling it. Restyle through the
  tokens above, not per-component overrides.
- **Frame vs content** — a new shared primitive goes to the frame, anything answering this
  proto's question stays in the proto. The frame never reaches into a proto.
- **Recognition before change** — on any resume or respawn, run `pnpm proto-list` and read the
  live proto first. Never wipe or shift what is there by default; `proto-shift` is only for a
  genuinely new question, and editing the live proto's content is an edit, not a shift.
- **Data** — mock data in the proto's own `data.ts`, typed with `satisfies`, no fetching.
  Charts use `recharts`.

## Use case — a board watched while dispatch works

This app is not only a prototype surface. Its live proto doubles as a **status board Dima
periodically glances at while dispatch grinds through its side of the work**. Dispatch streams
updates here; Dima reads them. That drives three standing rules.

**Ticket strip — a standing frame feature on every proto page.** `src/frame/ticket-strip.tsx`
renders `src/frame/tickets.ts` at the top of the page: in progress / done / touched. Always
keep and maintain this section: whenever a ticket update arrives (from Dima or dispatch),
edit `tickets.ts` in the same turn — the strip must never lag behind reality. Chips are
`linear://x-com/issue/<id>` links.

**Board defaults — every live board carries these sections.**

- **Roadmap checklist** at the top: compact, one item per line, checkbox per item. Three states,
  not two — done (struck through), in-flight, queued.
- **Tickets today**: processed / done / touched, live-updated as dispatch and `cc` stream in.
  Columns carry counts. Ticket chips are **links**, and they must open the Linear desktop app:
  `linear://x-com/issue/DOT-N`, never an https workspace url.
- Both are live data — update them on every stream, in the same turn the update arrives.
