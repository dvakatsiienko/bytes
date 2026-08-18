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

`src/protos/current/` — one folder, one prototype. It must export two things from
`index.tsx`:

```tsx
export const protoMeta = { blurb: 'one line', title: 'name' };
export const Proto = () => { … };
```

The frame reads `protoMeta` for the header and mounts `Proto` in the main slot.
Anything the proto needs (`data.ts`, `parts/`) goes in the same folder.

## Reset

```bash
node --run reset
```

Wipes `src/protos/current/` and writes a blank proto. Nothing else is touched —
frame, tokens, and installed packages stay. Prune dependencies by hand when they pile up.

## What is preinstalled

`react 19` · `tailwind v4` · `shadcn/ui` (new-york, in `src/components/ui`) ·
`motion` · `recharts` · `lucide-react` · `class-variance-authority`
