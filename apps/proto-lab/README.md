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

The live proto must export from `index.tsx`:

```tsx
export const protoMeta = {
  question: 'what should a session progress board look like?',  // required
  title: 'session progress board',
  verdict: 'the tick rail reads faster than a bar',             // optional, once settled
};

export const Proto = () => { ... };

// or, when comparing takes instead of building one:
export const variants = { 'tick rail': () => { ... }, 'plain bar': () => { ... } };
```

A prototype exists to answer one **question**. It is required, shown in the header, and
`pnpm proto-list` reads it back out of every archive — so an old proto says what it was
for without being opened. Write the `verdict` in when you know it.

Exporting `variants` (two or more) puts a switcher at the bottom of the screen and syncs
the choice to `?v=`. Export `Proto` instead when there is only one take.

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
## House rules for a proto

Throwaway from the first line. No tests, no error handling beyond what makes it run, no
abstractions, no persistence — state lives in memory, because persistence is usually the
thing the proto is checking.

Surface the state instead of inferring it:

```tsx
import { StateInspector } from '@/frame/state-inspector';

<StateInspector state={{ selected, step, items }} />
```

## What is preinstalled

`react 19` · `tailwind v4` · `shadcn/ui` (new-york, in `src/components/ui`) ·
`motion` · `recharts` · `lucide-react` · `class-variance-authority`
