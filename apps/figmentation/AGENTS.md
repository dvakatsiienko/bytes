# AGENTS.md — figmentation

CSS/design experiments showcase. Each route is an isolated visual demo — no
shared app logic, no backend.

- **`FTR.md` + `GLOSSARY.md`** — every feature with its check, and the words they use. read your section before changing what the app does.

## Demos

- `/clinique` — landing recreation, styled with CSS Modules (`styles.module.css`) + local SVGs
- `/tesla-landing` — landing recreation, themed via `src/theme/theme-tesla-landing.css`

## Stack

- **Next.js 16** (App Router), **React 19**, CSS Modules + theme CSS in `src/theme/`
  (`init.css` entry), `@ui/kit` workspace package, cva

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
