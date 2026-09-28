# A permanent Vite app with everything preinstalled, protos found by folder name

sketchbook is a Vite + React 19 single-page app (TanStack Router, Tailwind v4 with `@ui/kit`, `motion`, `recharts`, lucide icons, a shelf of fontsource faces), local only, never deployed. the frame finds its protos with `import.meta.glob` over `src/protos/current-*`, `bench-*` and `NNN-*`, so a folder rename is the whole of a shift and no import changes. it replaced throwaway html prototypes: a permanent app with every dependency already installed makes a new proto cost zero setup, and keeping the old pages in the same app lets dima flip back and compare.

## Considered options

- **throwaway html files** — what sketchbook replaced. each one started from nothing and died after one look, so nothing was comparable and every proto paid the setup again.
- **one app per prototype** — never taken: the setup cost is exactly what the app exists to remove. dependencies stay installed across every lifecycle command on purpose.
