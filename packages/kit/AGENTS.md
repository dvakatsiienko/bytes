# packages/kit — mechanics

`packages/kit` is the one design system, on shadcn + Base UI. Architecture source of truth:
[BYT-24](https://linear.app/x-com/issue/BYT-24). Read this file before any UI work in any app: the rules first, then the mechanics.

## rules

- **kit is the source.** Apps import shadcn components from `@ui/kit/components/*`; an app never
  generates into its own `ui/` dir. A missing component is added from the app with `shadcn add` —
  the app's `components.json` `ui` alias routes the file into kit.
- **compose before eject.** Behaviour differences (lazy search, async states) live in an app-level
  composition over the kit primitive.
- **eject is gated.** On the smell («too unique, too many workarounds») print
  `eject request: <component> · why composing fails · what structure differs` and stop. Dima's `y`
  → copy the file from kit into the app's own `ui/` dir with a provenance header
  (`// ejected from @ui/kit/components/<name> · <date> · <why>`), one-way door. There is no cli
  verb for this: `shadcn eject` inlines `shadcn/tailwind.css`, unrelated. The kit starts at zero ejects.
- **no brand in kit.** No hex, no font names, no logos, no app-conditional logic.
- **kit stays slim.** A variant enters kit only when two apps need it; ≤4 of our own variants on
  top of the registry's, a fifth is an eject signal. A coder mid-task does not scan the monorepo
  for the second consumer: it leaves a `variant request: <component> · <variant> · <app>` line in
  its done-comment; promotion is a periodic sweep.
- **`baseColor` is `neutral`** and identical in every `components.json`; style, icons and `css`
  match too (the shadcn monorepo guide requires it).
- **token layers are frozen:** L1 the 12-step accent/gray scales in `packages/kit/src/styles/`
  → L2 the shadcn vocabulary verbatim → L3 kit extensions. Never rename an L2 token.
- **surfaces:** `financial`, `space-explorer-ui` and `figmentation` are live test surfaces;
  `trophy-sys` adopts kit with its redesign.

## mechanics

## add a component

Run from the app that needs it, never from kit:

```bash
pnpm dlx shadcn@latest add <component>
```

The app's `components.json` has `"ui": "@ui/kit/components"`, so the file lands in
`packages/kit/src/components/`. The cli is always `pnpm dlx shadcn@latest`, never a global install.

## the cva swap

shadcn generates `import { cva, type VariantProps } from "class-variance-authority"`. Replace it:

```ts
import { cva, type VariantProps } from 'cva';
```

`cva` 1.0 beta takes an object: `cva({ base, variants, defaultVariants })`, not positional args.
Revisit when cva 1.0 goes stable.

## regenerate a primitive

Delete the file in `packages/kit/src/components/`, then run `add` from any app. Re-apply the cva
swap.

## eject a component

Only on Dima's `y` to an eject request (the gate is in § rules). Copy
`src/components/<name>.tsx` into the app's `src/components/ui/`, first line:

```ts
// ejected from @ui/kit/components/<name> · <date> · <why>
```

Then point the app's imports at the local copy. `shadcn eject` is a different thing (it inlines
`shadcn/tailwind.css`); never use it for this.

## check drift

```bash
pnpm dlx shadcn@latest add <component> --diff
```

The cva import + wrap always shows; read past it. Anything else is drift.

## consumption

Source import, no prebuild. `package.json#exports` maps `./components/*` to raw `.tsx`; Next apps
transpile the workspace package by themselves, Vite apps set `resolve.dedupe: ['react', 'react-dom']`.
Apps import `@ui/kit/globals.css` and never `tailwindcss` directly.
