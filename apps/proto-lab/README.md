# proto-lab

A permanent Vite app used as the prototype surface — instead of throwaway HTML files.
The **frame** (shell, tokens, fonts, deps) stays. The **proto** is swappable.

## Run

```bash
pnpm dev:proto-lab   # from the repo root
pnpm dev             # from apps/proto-lab
```

<http://localhost:5179>

## Where a proto lives

`src/protos/` holds every prototype. Exactly one is live, and its folder is named
`current-<topic>`:

```
src/protos/
  001-session-progress-board/   shifted, never renamed again
  002-ledger-view/
  current-alien-roster/         the live one
```

Numbers only count up, so an editor's a-z sort is the order you built them in, and a
shift renames exactly one folder.

The live proto must export two things from `index.tsx`:

```tsx
export const protoMeta = { blurb: 'one line', title: 'name' };
export const Proto = () => { ... };
```

The frame finds it by glob, not by a fixed path — so renaming the folder never touches
an import. Inside a proto, **import relatively** (`./data`, `../data`). An `@/protos/...`
import would break the moment the proto is shifted.

## Lifecycle

```bash
pnpm proto-new ledger view     # start one when nothing is live
pnpm proto-shift ledger view   # archive the live one, start a blank 'ledger view'
pnpm proto-clear               # delete every proto, leave a blank 'current-scratch'
pnpm proto-list                # show what is there, in order
```

Shifted protos are kept so you can go back and look. Nothing else is touched — frame,
tokens and installed packages survive all four commands. Prune dependencies by hand.
## What is preinstalled

`react 19` · `tailwind v4` · `shadcn/ui` (new-york, in `src/components/ui`) ·
`motion` · `recharts` · `lucide-react` · `class-variance-authority`
