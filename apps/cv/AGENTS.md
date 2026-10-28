# cv — Personal Cover Website

A visit-card site. Two routes:

- `/` — CV page: name, contact links, photo, tech stack showcase via SVG icons (12 tool categories)
- `/cover` — Short bio: professional intro with dynamically calculated years of experience and social links

- **`FTR.md` + `GLOSSARY.md`** — every feature with its check, and the words they use. Read
  your section before changing what the app does.

## Notable Patterns

- UI wrapped in a macOS-style browser frame component (`src/components/Browser/`)
- custom SVG tech icons in `src/app/parts/svg/`
- Tool categories config in `src/app/parts/toolConfig.tsx`
- External links centralized in `src/links.ts`
- `next build` type-checks; `pnpm typecheck` runs the same check on demand

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
