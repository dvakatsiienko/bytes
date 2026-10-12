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
- `next build` type-checks. `ignoreBuildErrors` was set here once and removed after the app measured clean against it; `pnpm typecheck` still runs the same check on demand
