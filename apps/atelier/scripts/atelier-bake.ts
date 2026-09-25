/**
 * `pnpm atelier:bake <piece> [day|night|both] [--note "<one line>"] [--set '<json>']`
 *
 * The studio's bake without the studio: starts atelier's own vite server on a
 * free port, bakes through the same function the bake button calls, saves the
 * takes, prints their ids, stops. `--set` overrides the default settings.
 */
import { parseArgs } from 'node:util';
import { createServer } from 'vite';

import type * as piecesModule from '../art/pieces.ts';
import { times as allTimes, isTime } from '../art/time.ts';
import { bake, closeBrowser } from '../server/bake.ts';
import { appRoot, saveTake } from '../server/takes.ts';
import type * as settingsModule from '../src/stage/settings.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    loop: { type: 'string' },
    note: { default: '', type: 'string' },
    set: { default: '{}', type: 'string' },
  },
});
const [pieceId, when = 'both'] = positionals;
if (!(pieceId && (when === 'both' || isTime(when)))) {
  console.error(
    'usage: pnpm atelier:bake <piece> [day|night|both] [--loop <frames>] [--note "…"] [--set \'{"look":"agx"}\']',
  );
  process.exit(2);
}

const server = await createServer({
  logLevel: 'warn',
  root: appRoot,
  server: { port: 0, strictPort: false },
});
try {
  await server.listen();
  const origin = server.resolvedUrls?.local[0];
  if (!origin) throw new Error('the vite server has no local url');
  const load = (path: string) => server.ssrLoadModule(path);
  const { findPiece } = (await load('/art/pieces.ts')) as typeof piecesModule;
  const { toSettings } = (await load(
    '/src/stage/settings.ts',
  )) as typeof settingsModule;
  if (!findPiece(pieceId))
    throw new Error(`no piece «${pieceId}» — see art/pieces.ts`);
  const settings = toSettings(JSON.parse(values.set));
  // --loop alone takes 72 frames: 12 per second over the six-second loop
  const frames =
    values.loop === undefined
      ? 1
      : Math.min(240, Math.max(2, Number.parseInt(values.loop, 10) || 72));
  const times = isTime(when) ? [when] : allTimes;
  for (const time of times) {
    // biome-ignore lint/performance/noAwaitInLoops: one at a time — they share one headless browser, and a take's number is the next free one
    const baked = await bake({
      frames,
      load,
      origin,
      piece: pieceId,
      settings,
      time,
    });
    const take = await saveTake({
      frames,
      note: values.note,
      piece: pieceId,
      settings,
      time,
      ...baked,
    });
    console.log(`baked ${pieceId} · ${time} → takes/${pieceId}/${take.id}/`);
  }
} finally {
  await closeBrowser();
  await server.close();
}
