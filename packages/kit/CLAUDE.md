# packages/kit — mechanics

The contract (rules, why) is the `## ui-kit` section of the root `CLAUDE.md`. This file is only how.

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

## check drift

```bash
pnpm dlx shadcn@latest add <component> --diff
```

The cva import + wrap always shows; read past it. Anything else is drift.

## consumption

Source import, no prebuild. `package.json#exports` maps `./components/*` to raw `.tsx`; Next apps
transpile the workspace package by themselves, Vite apps set `resolve.dedupe: ['react', 'react-dom']`.
Apps import `@ui/kit/globals.css` and never `tailwindcss` directly.
