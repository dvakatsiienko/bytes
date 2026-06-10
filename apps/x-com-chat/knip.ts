import type { KnipConfig } from 'knip';

export default {
  /* vendored shadcn/ui primitives — kept complete by design, don't report their
   * unused re-exports (but still type-checked/linted as normal source) */
  ignore: ['src/components/ui/**'],
  /* provided by the workspace root, referenced only in package.json scripts */
  ignoreBinaries: ['rimraf', 'biome', 'tsc'],
  ignoreDependencies: [
    /* kept for ad-hoc execution of standalone TS files, not imported anywhere */
    'tsx',
  ],
  project: [
    'src/**/*.{js,jsx,ts,tsx,css}',
    'convex/**/*.{js,jsx,ts,tsx}',
    '!convex/_generated/**',
  ],
} satisfies KnipConfig;
