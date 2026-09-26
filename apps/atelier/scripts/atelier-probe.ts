/**
 * `pnpm atelier:probe <piece> [day|night]`
 *
 * Does a piece render? Starts atelier's own vite server on a free port, opens
 * `/<piece>` in the bake's headless chromium, waits for the stage's
 * `data-rendered` (or `data-error`), and prints it with every console error.
 * Exits 1 when the piece did not render or the page logged an error, 2 when
 * there is no such piece.
 */
import { createServer } from 'vite';

import { isTime } from '../art/time.ts';
import { closeBrowser, getBrowser } from '../server/bake.ts';
import { appRoot } from '../server/takes.ts';

const RENDER_TIMEOUT = 60_000;

const [pieceId, time = 'day'] = process.argv.slice(2);
if (!(pieceId && isTime(time))) {
  console.error('usage: pnpm atelier:probe <piece> [day|night]');
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
  const page = await (await getBrowser()).newPage({
    viewport: { height: 800, width: 1280 },
  });
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const started = performance.now();
  const stage = page.locator('[data-testid=stage]');
  await page.goto(new URL(encodeURIComponent(pieceId), origin).href);
  await stage.waitFor({ timeout: RENDER_TIMEOUT });
  // the studio sends an unknown piece to the first one: a failed probe, not a render
  const isPiece =
    new URL(page.url()).pathname === `/${encodeURIComponent(pieceId)}`;
  if (isPiece) {
    if (time === 'night') await page.keyboard.press('n');
    await page
      .locator(
        `[data-testid=stage][data-rendered="${pieceId}:${time}"], [data-testid=stage][data-error]`,
      )
      .waitFor({ timeout: RENDER_TIMEOUT })
      .catch(() => undefined);
    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    const rendered = await stage.getAttribute('data-rendered');
    const failed = await stage.getAttribute('data-error');
    console.log(
      rendered
        ? `data-rendered: ${rendered} (${seconds} s)`
        : `data-rendered: none after ${seconds} s`,
    );
    if (failed) console.log(`data-error: ${failed}`);
    console.log(`console errors: ${errors.length}`);
    for (const error of errors) console.log(`  ${error}`);
    const isClean =
      rendered === `${pieceId}:${time}` && !failed && errors.length === 0;
    process.exitCode = isClean ? 0 : 1;
  } else {
    console.error(`no piece «${pieceId}» — see art/pieces.ts`);
    process.exitCode = 2;
  }
  await page.close();
} finally {
  await closeBrowser();
  await server.close();
}
