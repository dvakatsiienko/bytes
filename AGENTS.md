# AGENTS.md: bytes

a pnpm workspace monorepo orchestrated by Turborepo — multiple web applications plus shared infrastructure packages.

## App Registry

Each app keeps its memory in its own AGENTS.md. A block a tool generates there (x-com-chat's `convex-ai` markers) is tooling output, kept as is when editing.

- `cv` — Personal portfolio with tool showcase · Production
- `x-com-chat` — AI chat with customizable alien friends · Active Dev, 🐾 pet
- `space-explorer-ui` — GraphQL client demo · Demo, 🐾 pet
- `space-explorer-api` — GraphQL server demo · Demo, 🐾 pet
- `financial` — Financial dashboard with auth · WIP, 🐾 pet
- `sketchbook` — Prototype platform, swappable proto slot · Active Dev
- `atelier` — Art studio: scenes as code, lit and shot · Active Dev, local only
- `design-loupe` — Designer asks pinned to live boards, answered in place · Active Dev, local only
- `figmentation` — CSS/design experiments · Showcase
- `trophy-sys` — PSN trophy tracker, retro terminal UI · Active Dev

🐾 **pet** — a basic setup on purpose (dima, 2026-09-27): shared dev data, a tracked db, dev against the hosted db. an agent works inside that setup and never hardens it, flags it or «fixes» it as a defect until dima promotes the app; a test that writes data says so in its report. the app's own AGENTS.md names what is basic.

**Every app passes `pnpm apps:essentials`.** The essentials list lives in `script/apps-essentials.ts`, as data, with its waivers — read it there, never copy it. The pre-commit hook checks the apps a commit touches, ci checks every app, so a new app is red from its first commit until it carries them all. 🟡 lines (a doc gone stale, a verify skill calling a missing script) never fail.

## Shared packages

`packages/`: `biome-config-polished` (the lint and format rules every app extends), `prettier-config-polished` (legacy, migrating to biome), `kit` (the design system, § ui-kit), `typescript-config`, `utils`.

### Turbo filters, measured (2026-09-12)

- Two negative filters INTERSECT: `--filter='!a' --filter='!b'` drops both packages. The docs read
  as a union; check with `--dry=json` before relying on any filter combination.
- `turbo run <task> --dry=json` lists every package, including ones without that script
  (`<NONEXISTENT>`). A «does anything run X this time» gate must filter on the script's presence.

## Cross-App Conventions

### State Management Strategies

- **Client State**: Jotai atoms for UI state
- **Server State**: React Query for caching — used by `financial` and `trophy-sys`; prefer it over
  hand-rolled `useEffect` fetching in any new app
- **URL State**: TanStack Router in `trophy-sys`, React Router elsewhere — routing state goes in
  the path (see below), never in search params
- **Real-time**: Convex subscriptions
- **GraphQL**: Apollo Client cache

### URL Shape — routing state belongs in the path

**If a thing is a resource or a place, it gets a path segment. Search params are only for genuine
view state nobody would link to.**

- ✅ `/library/NPWR21924_00`
- 🚫 `/library?game=NPWR21924_00`

A tab is navigation. A selected game is a resource. Both are paths. Sorting, a filter toggle, an
open panel — those are view state and belong in search params.


<!-- why the url rule is written down: trophy-sys was first built with search-param routing and rebuilt on paths after review; that cost the router, every component reading the params, and the rewrite rule that makes deep links load. -->

### The shared toolchain lives at the root

**The root `package.json` holds the toolchain every package shares. A tool a subset of apps chose stays in those apps — one version, held by the shape test.** The reasons, the guard's reach, pnpm catalogs and the React Compiler pairs: `docs/agents/toolchain.md`.

### Database Patterns

- **Seeding**: `tsx prisma/seed/init`
- **Test data is copied real data.** Seed a sandbox by copying real rows into it — never symlink
  a live store, never point a seed, fixture, or test at live state.

### Deployment

Vercel's git integration is off: `.github/workflows/deploy.yml` deploys the apps turbo lists as affected after a green CI on `main`, `[skip ci]` on a `main` commit means «do not deploy», and previews come only by the `🚀 deploy:preview` label. Read `docs/agents/deploy.md` before touching a `vercel.json`, a workflow, `turbo.jsonc` `globalDependencies`, or deploying by hand.

## ui-kit

`packages/kit` is the one design system, on shadcn + Base UI. Architecture source of truth:
[BYT-24](https://linear.app/x-com/issue/BYT-24). Mechanics live in `packages/kit/AGENTS.md`.

- **kit is the source.** Apps import shadcn components from `@ui/kit/components/*`; an app never
  generates into its own `ui/` dir. A missing component is added from the app with `shadcn add` —
  the app's `components.json` `ui` alias routes the file into kit.
- **compose before eject.** Behaviour differences (lazy search, async states) live in an app-level
  composition over the kit primitive.
- **eject is gated.** On the smell («too unique, too many workarounds») print
  `eject request: <component> · why composing fails · what structure differs` and stop. Dima's `y`
  → copy the file from kit into the app's own `ui/` dir with a provenance header
  (`// ejected from @ui/kit/components/<name> · <date> · <why>`), one-way door. There is no cli
  verb for this: `shadcn eject` inlines `shadcn/tailwind.css`, unrelated. The kit starts at zero ejects.
- **no brand in kit.** No hex, no font names, no logos, no app-conditional logic.
- **kit stays slim.** A variant enters kit only when two apps need it; ≤4 of our own variants on
  top of the registry's, a fifth is an eject signal. A coder mid-task does not scan the monorepo
  for the second consumer: it leaves a `variant request: <component> · <variant> · <app>` line in
  its done-comment; promotion is a periodic sweep.
- **`baseColor` is `neutral`** and identical in every `components.json`; style, icons and `css`
  match too (the shadcn monorepo guide requires it).
- **`cva` 1.0 beta everywhere.** shadcn generates `class-variance-authority`; after every
  `shadcn add` swap the import to `cva` and wrap the args into its object form.
  `shadcn add --diff` always shows the cva import + wrap; read past it. Revisit when cva 1.0
  goes stable.
- **token layers are frozen:** L1 the 12-step accent/gray scales in `packages/kit/src/styles/`
  → L2 the shadcn vocabulary verbatim → L3 kit extensions. Never rename an L2 token.
- **surfaces:** `financial`, `space-explorer-ui` and `figmentation` are live test surfaces;
  `trophy-sys` adopts kit with its redesign.

## next apps

- Use the installed next skills in `.claude/skills/next-*` when working in a Next app.
- Adopt cache components when they land well and help.
- `@next/playwright` is allowed only as the harness for `next-cache-components-optimizer`'s
  `instant()` e2e; install it in the app that adopts it. `agent-browser` stays the fleet browser
  for everything else.

## the readme stays true

`README.md` shows live facts: the badge row, one row per app with its avatar, live url and a
screenshot behind «peek». **A change to what it shows lands with its README update in the same commit** —
a new or removed app, a moved url, a toolchain bump. `pnpm badges:sync` redraws `assets/badges/`
from the repo (it runs the tests to count them). The hero is `python3 script/readme-hero.py` and the app
avatars are `python3 script/readme-avatars.py`; both borrow the crew and the lettering from
`~/frame/brand/profile`, so they run on dima's mac only. An
app shot is retaken with agent-browser at 1280×800 on the production url and saved as
`assets/apps/<app>.webp`, under 300 kb.

## Agent skills

### Issue tracker

Linear per `rules-lazy/linear-flow.md` (it loads on a linear touch) — this repo's work lives on team `BYT`.
GitHub issues retired 2026-08 — closed history only, never operated (`docs/agents/issue-tracker.md`
kept for that history).

### Triage labels

Workspace-level families — role, kind, special, model routing. Project-meaning labels are banned. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context — root `GLOSSARY-MAP.md` points at per-app `GLOSSARY.md` files. See `docs/agents/domain.md`.

**An app with `FTR.md` keeps its map and its `GLOSSARY.md` in step with the code:** a change to what
the app does updates its ftr line, and any new domain word its `GLOSSARY.md` entry, in the same commit
(`x:ftr`). frame's `x lane gate` holds the ftr line at commit-msg and nudges the glossary until an app lists its `contract:` in `GLOSSARY-MAP.md`; a machine without `x` refuses the commit.

## worktrees — one shared checkout, coders branch in their own tree

- the main checkout stays on `main`; a `git switch` there moves every session. a `coder/*` branch lives in `.claude/worktrees/BYT-N-<slug>` — cc's own default, gitignored, the same place `EnterWorktree` puts a tree it makes (`camp .claude/worktrees/BYT-N-<slug> -b coder/BYT-N-<slug> main`).
- **`pnpm worktree:seed <path>` makes the tree runnable**: copies every gitignored `.env*`, `.claude/settings.local.json` and trophy-sys's caches from the main checkout — trophy-sys's Vercel-pulled `.env.local` (prod kv) arrives blanked; its NPSSO and grant are live copies — runs `CI=1 pnpm install` (lefthook must not rewrite the shared hooks), and writes `.worktree-offset`. cc's `EnterWorktree` hook runs it for a tree it creates; after a hand-made `camp`, run it yourself — with no path it seeds the newest tree, so `camp .claude/worktrees/BYT-N-x -b coder/BYT-N-x main && pnpm worktree:seed` is the whole move.
- **ports move with the tree**: every `dev` script starts through `script/with-port.ts <base>`, which exports `PORT = base + offset` (offset = the lowest multiple of 10 no other tree holds, 0 in the main checkout) and `PORT_OFFSET`. vite configs and the node apis read `PORT`; next reads it natively; trophy-sys's api adds the offset to 5178. an explicit `PORT` in the environment (the desktop launch entries) wins untouched.

- **a pathspec commit while the format hook re-sorts a file** commits the fixed file but leaves the pre-format copy staged (`MM`) — after a commit, `git status --short` the paths, and `git restore --staged <path>` once `git diff HEAD -- <path>` is empty (2026-09-26).

## vercel hazards

- **«skip unaffected projects» writes a canceled record for every untouched project on every push, before `git.deploymentEnabled: false` is read** — 91 preview records on 2026-09-25 from `coder/*` pushes. the setting (`enableAffectedProjectsDeployments`) is off on all 6 projects since 2026-09-26, proven by a probe push; a new project gets it off too ([BYT-106](https://linear.app/x-com/issue/BYT-106))
- **`vercel api … -X PATCH -d <json>` exits 0 and changes nothing** — write with `--input <file>`, and prove every write by reading the field back (2026-09-26)
- **every branch pushed to a repo with vercel projects is built by every project unless the branch itself carries the opt-out** — `git.deploymentEnabled: false` is read from each app's `vercel.json` on THAT commit, not from main; an orphan `badges` branch holding one svg started 6 preview builds, all dying on «Root Directory does not exist» and all counted on the daily 100 (bytes, 2026-09-24). a single-file or orphan branch carries `cp --parents apps/*/vercel.json` in the job that pushes it
- **a lockfile change that reshapes the pnpm store needs a cache-less first vercel build** — vercel restores the previous `node_modules`, and pnpm keeps a stale hoisted link (`@types/react@19.2.18` after the override pinned 19.3.0, 2026-09-21). `vercel deploy --prod --force` from the REPO ROOT with the root `.vercel` link switched to the project; an app-dir deploy dies on «Root Directory does not exist», and `vercel link` writes an `.env.local` (oidc token) plus an `.env*` gitignore line — revert both
