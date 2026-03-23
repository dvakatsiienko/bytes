<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# cv — Personal Cover Website

A visit-card site. Two routes:

- `/` — CV page: name, contact links, photo, tech stack showcase via SVG icons (12 tool categories)
- `/cover` — Short bio: professional intro with dynamically calculated years of experience and social links

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler enabled)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** with custom CSS variable theme system (`src/theme/`)
- **CVA** for component variants
- **next-themes** for dark/light mode
- **`@ui/kit`** — shared workspace UI package

## Notable Patterns

- UI wrapped in a macOS-style browser frame component (`src/components/Browser/`)
- 41 custom SVG tech icons in `src/app/parts/svg/`
- Tool categories config in `src/app/parts/toolConfig.tsx`
- `__DEV__` / `__PROD__` flags in `src/frags.ts` — projects section hidden in production
- External links centralized in `src/links.ts`
- TypeScript build errors ignored (`ignoreBuildErrors: true`) — use `pnpm typecheck` manually
