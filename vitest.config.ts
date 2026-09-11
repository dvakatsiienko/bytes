import { defineConfig } from 'vitest/config';

/**
 * The aggregate run: `pnpm test` at the root executes every package that has a
 * vitest config, in one pass, under one reporter. CI does not use this file —
 * it runs `turbo run test`, which invokes each package's own config so results
 * stay cacheable and `--affected` keeps working.
 *
 * `reporters` and `coverage` are root-only options in Vitest 5: a project
 * config that sets them is ignored, so they live here and nowhere else.
 *
 * There is deliberately no `exclude` for `.claude/worktrees/**`. A flat config
 * needs one — its repo-rooted include counts a coder worktree's copy of every
 * test a second time (measured in dotfiles, 166 = 2 × 83). With `projects`
 * set, the root config collects no files itself and each project's include is
 * rooted at its own package, so nothing can reach a worktree. Verified here by
 * planting a worktree copy and running with and without the exclude: the same
 * 9 files either way, never 18. A future root-level project would bring the
 * hazard back with it.
 */
export default defineConfig({
  test: {
    // `.mts` is not a preference: the three Next apps are CommonJS packages,
    // and Vite's native config loader rejects ESM syntax in a `.ts` config
    // there. Next's own Vitest guide names the same extension.
    projects: [
      'apps/*/vitest.config.{ts,mts}',
      'packages/*/vitest.config.{ts,mts}',
    ],
    // Only the local run is overridden. Vitest's own default is
    // `[agent ? 'minimal' : 'default', ...(GITHUB_ACTIONS ? ['github-actions'] : [])]`
    // (see `reporters` in vitest/dist/chunks/defaults), so spelling out
    // `['default']` under CI would suppress both the workflow annotations and
    // the quieter reporter it picks for an agent.
    ...(process.env.CI ? {} : { reporters: ['tree'] }),
  },
});
