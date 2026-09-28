# A static Next.js site with Tailwind and kit, deployed on Vercel

cv is a Next.js 16 app-router site (React 19, React Compiler on) styled with Tailwind v4, the typography plugin and `@ui/kit`, with `next-themes` for light and dark, deployed on Vercel. It has no data layer: every word lives in the page source and `src/links.ts`. It was chosen because a visit card needs no server state, and Next on Vercel ships it with the rest of the monorepo's apps on one toolchain. It replaced an older `profile` app in the monorepo (`4a2eeffa`).

The redesign may reopen this; until then the stack stays as small as the page.
