# AGENTS.md: trophy-sys/src/web

Web conventions: routing, theme, kit wiring, chrome. `charts/` nests below with its own file.

- Server state is TanStack Query (`hooks/queries.ts`); routing is TanStack Router with real
  paths — `/library`, `/library/$gameId`, `/campaign`, `/journal`, `/console` — not search
  params, because the tabs are navigation and a game is a resource. `router.tsx` holds the tree;
  `layout.tsx`, `library.tsx`, `campaign.tsx`, `journal.tsx` and `console.tsx` are the route
  components. Deep links work because `vercel.json` rewrites every non-`/api` path to
  `index.html`.
- **The root route is a bare `<Outlet />`.** The app's routes hang off a pathless `_shell` layout
  route rendering `Layout`, and `/console` is a *sibling* of `_shell`, not a child — so the console
  still renders when every PSN call is failing, which is exactly when a dead NPSSO needs replacing.
  A `defaultErrorComponent` catches the rest. 📌 `useParams({ from })` takes a route **id**, and
  those ids now carry the segment: `'/_shell/library/$gameId'`.
- Retro look = gruvbox-material, matching the `sline` statusline palette. Colors are Tailwind
  theme tokens in `src/web/theme.css` (`text-orange`, `bg-bg-lift`, `text-gold`…) — no hex in
  components. Progress bars are `█`/`░` runs from `barRender`, not DOM elements.
- **`@ui/kit` is wired in** — `components.json`, the `@ui/kit: workspace:*` dependency,
  and `resolve.dedupe` in `vite.config.ts`. Kit components resolve `lucide-react` from kit's own
  manifest; the app lists it only once its own code imports an icon. Import as `@ui/kit/components/button`;
  the monorepo's kit rules in `packages/kit/AGENTS.md` apply here now. `theme.css` maps the shadcn L2
  token vocabulary onto the existing gruvbox `--p-*` palette, with `--radius: 0px` — a kit component
  lands retro without per-component overrides, and the raw `--p-*` variables stay the only thing
  redefined per theme.
- Chrome is unselectable: the `body` rule in `theme.css` sets `user-select: none`, and strings
  carrying a real name (game titles, trophy names and descriptions, group names) opt back in with
  Tailwind's `select-text`. Inputs are exempted in the same base layer. `::selection` is derived
  from the palette's blue, so both themes are served by one rule.
- `.panel` + `.panel-title` is the boxed-with-a-label frame used by every region; the title is
  absolutely positioned outside the border, so a panel must not be the scroll container itself —
  put `overflow-y-auto` on a child.

📌 `cache.ts` memoizes **successes only**, so a client retry replays the entire scan. That is why
`retry` is 1 globally — react-query's default of 3 would replay a failed scan three more times.
