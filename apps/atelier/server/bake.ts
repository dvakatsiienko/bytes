import { Resvg } from '@resvg/resvg-js';
import type { Browser } from 'playwright';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { optimize } from 'svgo';

import type * as piecesModule from '../art/pieces.ts';
import type { Time } from '../art/time.ts';
import type * as scenesModule from '../src/stage/scenes.ts';
import type { Settings } from '../src/stage/settings.ts';

/** every bake is 2× the piece's own size */
const SCALE = 2;
const BAKE_TIMEOUT = 90_000;

/**
 * One bake, for the dev server's button and for `atelier:bake` alike. `load`
 * is vite's module loader, so a bake always draws the art as it is on disk
 * now, never a copy cached when the server started.
 */
export const bake = async (input: BakeInput): Promise<BakeOutput> => {
  const { findPiece, pieceSvg } = (await input.load(
    '/art/pieces.ts',
  )) as typeof piecesModule;
  const { stageScenes } = (await input.load(
    '/src/stage/scenes.ts',
  )) as typeof scenesModule;
  const piece = findPiece(input.piece);
  if (!piece) throw new Error(`no piece «${input.piece}»`);

  if (stageScenes[piece.id]) {
    const png = await renderInBrowser(input, piece.size);
    return { webp: await toWebp(png) };
  }

  const optimized = optimize(pieceSvg(piece, input.time, input.settings.seed), {
    multipass: true,
  }).data;
  const png = new Resvg(optimized, {
    fitTo: { mode: 'width', value: piece.size.w * SCALE },
  })
    .render()
    .asPng();
  return { svg: `${optimized}\n`, webp: await toWebp(png) };
};

const toWebp = (png: Buffer) =>
  sharp(png).webp({ effort: 6, quality: 92 }).toBuffer();

let browser: Promise<Browser> | null = null;

// SwiftShader is the software WebGL a headless chromium has on any machine;
// newer chromium only enables it behind this flag.
const launch = () =>
  chromium.launch({
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  });

/** one browser for the server's life: launching per bake costs a second each time */
const getBrowser = () => {
  browser ??= launch().catch((error: unknown) => {
    browser = null;
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      message.includes("Executable doesn't exist")
        ? 'playwright has no chromium yet — run `pnpm exec playwright install chromium` once'
        : message,
    );
  });
  return browser;
};

export const closeBrowser = async () => {
  const open = browser;
  browser = null;
  if (open) await (await open).close();
};

const renderInBrowser = async (
  input: BakeInput,
  size: { w: number; h: number },
) => {
  const page = await (await getBrowser()).newPage({
    deviceScaleFactor: SCALE,
    viewport: { height: size.h, width: size.w },
  });
  try {
    const url = new URL(input.origin);
    url.searchParams.set('bake', input.piece);
    url.searchParams.set('time', input.time);
    url.searchParams.set('set', JSON.stringify(input.settings));
    await page.goto(url.href);
    // the bake view sets `data-baked` on <html>: «ok» after the first frame, or the error
    const handle = await page.waitForFunction(
      () => document.documentElement.dataset.baked,
      null,
      {
        timeout: BAKE_TIMEOUT,
      },
    );
    const state = await handle.jsonValue();
    if (state !== 'ok') throw new Error(`bake failed in the browser: ${state}`);
    const dataUrl = await page.evaluate(
      () => document.querySelector('canvas')?.toDataURL('image/png') ?? '',
    );
    if (!dataUrl.startsWith('data:image/png;base64,'))
      throw new Error('bake produced no image');
    return Buffer.from(
      dataUrl.slice('data:image/png;base64,'.length),
      'base64',
    );
  } finally {
    await page.close();
  }
};

/* Types */

interface BakeInput {
  load: (url: string) => Promise<Record<string, unknown>>;
  /** the dev server's own url, which serves the bake view */
  origin: string;
  piece: string;
  settings: Settings;
  time: Time;
}

interface BakeOutput {
  /** the optimised svg, for a flat piece only */
  svg?: string;
  webp: Buffer;
}
