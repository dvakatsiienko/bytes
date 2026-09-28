# A Next app of isolated routes, Tailwind and kit for structure, CSS Modules for a study's own art

figmentation is a Next.js 16 App Router app on React 19.3 with the React Compiler on, deployed to Vercel. Each study is one route with nothing shared but the root layout (Inter, `src/theme/init.css`): layout and controls are Tailwind v4 utilities and `@ui/kit` components, a study's palette lives beside it (`theme-tesla-landing.css` as Tailwind `@theme` tokens, the clinique palette as CSS variables in `styles.module.css`), and a CSS Module carries what utilities say badly — named grid areas, keyframes, layered gradients, hover choreography. It was chosen because the point of the app is the visual study, not app logic: no backend, no shared state, and a new study is a new folder that cannot break the others.

## Considered options

- **CSS Modules only** — the app started as `cssorcery` (renamed in `6656ebbf`), and the root `AGENTS.md` still calls it «CSS modules by design» and exempts it from kit. The code has moved past that: both studies and the home page use Tailwind and `@ui/kit`, and CSS Modules are now the per-study layer, not the whole stack.
