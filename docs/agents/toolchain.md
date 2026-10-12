# bytes — the shared toolchain and its placement

read before touching any `package.json`, `.npmrc`, `pnpm-workspace.yaml`, or a vite or next react-compiler setup.

## The shared toolchain lives at the root

**The root `package.json` holds the toolchain every package shares. A tool a subset of apps chose
stays in those apps — one version, held by the shape test.** An app's manifest lists that, plus
what its own code imports at runtime and what a filtered deploy must see.

The shape of each, not the whole of either — **the manifests are the list**, and this file keeps no
copy of one to go stale. Root looks like `typescript`, `vitest`, biome, turbo, `@types/*`,
`tailwindcss` and `postcss`. Per app looks like `vite` and its plugins, the tailwind plugins a
given app's stylesheets call, `prisma`, `@graphql-codegen/cli`.

📌 Why not everything at the root, which is where BYT-91 first put it: **a root bump moves 32 of
32 task hashes** — measured on a real `prettier` 3.9.6 → 3.9.5, `prisma:generate` included despite
its hand-narrowed `inputs` — and rebuilds and redeploys every app. A tool three apps use, parked
at the root, taxes the other five on every one of its bumps. `vite` at the root makes a vite bump
redeploy four Next apps that never load it.

**The one-version guarantee no longer comes from there being one declaration.** It comes from
`package-json-shape`, which fails when a name carries two pins anywhere in the workspace and says
where each lives — the hook narrows its REPORT to the manifests you staged, never its comparison.
It earned its place immediately: it found `graphql` at two majors across the two space-explorer
apps, which nothing had compared before.

⚠️ Know exactly how far that reaches, because it is narrower than «enforced». It runs from
`lefthook.yaml` pre-commit, behind an `if command -v` guard, so it is **silently absent** anywhere
`plugin-x` is not installed: CI, containers, agent sessions. And renovate's automerged patch group
never fires a local hook at all — the common case is safe only because that group bumps every copy
of a name together.

**The structural answer is pnpm catalogs**, and it is the one to reach for when this bites: a
`catalog:` block in `pnpm-workspace.yaml` with `"vite": "catalog:"` in each manifest makes one pin
per name a property the package manager enforces at install, everywhere, for renovate too, with no
external binary. Not done here — it touches every manifest and deserves its own verification pass.

Why per-app placement still resolves: `pnpm run` puts the root `node_modules/.bin` on PATH for
every package, and node's module walk from `apps/x` reaches the root `node_modules`. A filtered
install (`pnpm i -F 'cv...'`, vercel's command) installs the root manifest's devDeps too —
measured in a clean clone on BYT-91: after `pnpm i -F 'cv...'` and
`pnpm i -F '@space-explorer/ui...'`, the root `.bin` carried `tsc`, `vite`, `run-p` and `run-s`,
and `tailwindcss`, `@tailwindcss/postcss` and `vite` all resolved from the app directory.

The exception: a tool that resolves its plugins from its own package location (eslint-style)
fails in pnpm's strict store. The fix is a `public-hoist-pattern[]` line in `.npmrc`, never a
copy into the app. The BYT-91 sweep needed none.

⚠️ React Compiler is the case where a missing declaration costs silence rather than an error, and
the two implementations do NOT travel together. From `@vitejs/plugin-react`'s own README:

- **a vite app** needs `vite` + `@vitejs/plugin-react` + **`oxc-transform-react`**. That is what
  `react({ compiler: true })` uses — the Rust port, an optional peer loaded from the plugin's own
  package location. `sketchbook`, `space-explorer-ui` and `trophy-sys` declare exactly those three
- **a next app** needs **`babel-plugin-react-compiler`**, for `reactCompiler: true`. `cv`,
  `figmentation` and `financial` declare it and nothing else of this group

`babel-plugin-react-compiler` is also an optional peer of the vite plugin, but only for its Babel
path, which additionally wants `@rolldown/plugin-babel`, `@babel/core` and the explicit
`reactCompilerPreset` helper. No vite config here uses that path, so a vite app declaring it would
be carrying a dependency it never loads.

📌 The hazard is real even so: optional peers resolve **per importer**, so a vite app that declares
`@vitejs/plugin-react` without `oxc-transform-react` gets the peer-unresolved instance and
`compiler: true` **degrades silently** — no error, just the slow path. Keep that pair together.

📌 What a ROOT-ONLY tool trips is biome's `noUndeclaredDependencies`: a file inside an app that
imports one resolves against the NEAREST manifest — the app's — and gets reported as undeclared,
one level from where the tool deliberately lives. The answer is a scoped exemption in
`biome-config-polished`, never a copy of the tool back into the app. Today only the vitest globs
need it, because `vitest` is the root-only tool an app file imports. Keep the exemption list that
short: one that nothing needs hides the next genuinely undeclared import until the build fails.
