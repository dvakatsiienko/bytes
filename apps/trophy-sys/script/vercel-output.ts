import { cpSync, mkdirSync, writeFileSync } from 'node:fs';

/**
 * Assembles Vercel's Build Output API v3 directory.
 *
 * The `api/` convention cannot work here: Vercel decides which functions exist
 * by scanning the cloned tree *before* the build runs, so a bundle the build
 * produces arrives too late — the deploy goes green and every `/api` route
 * 404s. Measured 2026-09-04. Writing `.vercel/output` ourselves is the
 * supported way to declare a function the build produced, and it keeps the
 * bundle out of git.
 */
const OUT = '.vercel/output';

/** `index.js` is the bundle esbuild already wrote into the .func directory. */
const FUNCTION_CONFIG = {
  handler: 'index.js',
  launcherType: 'Nodejs',
  runtime: 'nodejs24.x',
  shouldAddHelpers: true,
};

/**
 * ⚠️ Load-bearing. esbuild emits ESM, the handler is a `.js`, and Node decides
 * module-vs-script from the nearest package.json — which inside a .func is this
 * one or nothing. Without it the function loads as CommonJS and dies on its
 * first `import` with FUNCTION_INVOCATION_FAILED. Vercel's own generated
 * function carried the app's package.json for exactly this reason; ours has to
 * bring its own.
 */
const FUNCTION_PACKAGE = { type: 'module' };

/**
 * `filesystem` serves the built assets first; everything else falls through to
 * the api function or the SPA shell. The api rule matches any depth — a
 * filename catch-all matches one segment only, which once cost a live outage.
 */
const OUTPUT_CONFIG = {
  routes: [
    { handle: 'filesystem' },
    { dest: '/api/handler', src: '/api/(.*)' },
    { dest: '/index.html', src: '/((?!api/).*)' },
  ],
  version: 3,
};

const funcDir = `${OUT}/functions/api/handler.func`;

mkdirSync(funcDir, { recursive: true });
cpSync('dist', `${OUT}/static`, { recursive: true });
writeFileSync(
  `${funcDir}/.vc-config.json`,
  `${JSON.stringify(FUNCTION_CONFIG, null, 2)}\n`,
);
writeFileSync(
  `${funcDir}/package.json`,
  `${JSON.stringify(FUNCTION_PACKAGE, null, 2)}\n`,
);
writeFileSync(
  `${OUT}/config.json`,
  `${JSON.stringify(OUTPUT_CONFIG, null, 2)}\n`,
);

console.log(`build output assembled in ${OUT}`);
