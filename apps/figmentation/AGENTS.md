# AGENTS.md — figmentation

CSS/design experiments showcase. Each route is an isolated visual demo — no
shared app logic, no backend.

## Demos

- `/clinique` — landing recreation, styled with CSS Modules (`styles.module.css`) + local SVGs
- `/tesla-landing` — landing recreation, themed via `src/theme/theme-tesla-landing.css`

## Stack

- **Next.js 16** (App Router), **React 19**, CSS Modules + theme CSS in `src/theme/`
  (`init.css` entry), `@ui/kit` workspace package, cva

## Commands

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm lint       # biome lint
pnpm typecheck  # tsc
```

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
