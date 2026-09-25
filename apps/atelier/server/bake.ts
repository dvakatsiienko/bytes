import { Resvg } from '@resvg/resvg-js';
import type { Browser } from 'playwright';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { optimize } from 'svgo';

import type * as piecesModule from '../art/pieces.ts';
import type { Time } from '../art/time.ts';
import { errorText } from '../src/error-text.ts';
import type * as scenesModule from '../src/stage/scenes.ts';
import type { Settings } from '../src/stage/settings.ts';

/** a still bakes at 2× the piece's own size; a loop at 1×, or 72 frames would weigh tens of MB */
const STILL_SCALE = 2;
const LOOP_SCALE = 1;
/** one loop of the stage's motion, as `LOOP_SECONDS` in the stage canvas */
const LOOP_MS = 6000;
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
    const pngs = await renderInBrowser(input, piece.size);
    const [still] = pngs;
    if (pngs.length === 1 && still) return { webp: await toWebp(still) };
    const delay = Math.round(LOOP_MS / pngs.length);
    const webp = await sharp(pngs, { join: { animated: true } })
      .webp({ delay: pngs.map(() => delay), effort: 6, loop: 0, quality: 88 })
      .toBuffer();
    return { webp };
  }
  if (input.frames > 1)
    throw new Error(`«${piece.id}» is a flat piece: it has no motion to loop`);

  const optimized = optimize(pieceSvg(piece, input.time, input.settings.seed), {
    multipass: true,
  }).data;
  const png = new Resvg(optimized, {
    fitTo: { mode: 'width', value: piece.size.w * STILL_SCALE },
  })
    .render()
    .asPng();
  return { svg: `${optimized}\n`, webp: await toWebp(png) };
};

const toWebp = (png: Buffer) =>
  sharp(png).webp({ effort: 6, quality: 92 }).toBuffer();

let browser: Promise<Browser> | null = null;

// On a mac, headless chromium renders on the GPU through Metal: a still bakes
// in ~2.8 s instead of ~8.3 s, and the two renders differ by 1.4/255 on
// average (edges only, measured on BYT-103). Elsewhere SwiftShader, the
// software WebGL every headless chromium has, which newer builds hide behind
// a flag.
const gpuArgs =
  process.platform === 'darwin'
    ? ['--use-angle=metal']
    : ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'];

const launch = () => chromium.launch({ args: gpuArgs });

/** one browser for the server's life: launching per bake costs a second each time */
export const getBrowser = () => {
  if (browser) return browser;
  const launching: Promise<Browser> = launch()
    .then((launched) => {
      // a crashed or closed chromium must not be handed to the next bake; a
      // late event from an old browser must not clear a newer one
      launched.on('disconnected', () => {
        if (browser === launching) browser = null;
      });
      return launched;
    })
    .catch((error: unknown) => {
      if (browser === launching) browser = null;
      const message = errorText(error);
      throw new Error(
        message.includes("Executable doesn't exist")
          ? 'playwright has no chromium yet — run `pnpm exec playwright install chromium` once'
          : message,
      );
    });
  browser = launching;
  return launching;
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
  const isLoop = input.frames > 1;
  const page = await (await getBrowser()).newPage({
    deviceScaleFactor: isLoop ? LOOP_SCALE : STILL_SCALE,
    viewport: { height: size.h, width: size.w },
  });
  try {
    const url = new URL(input.origin);
    url.searchParams.set('bake', input.piece);
    url.searchParams.set('time', input.time);
    url.searchParams.set('set', JSON.stringify(input.settings));
    url.searchParams.set('frames', String(input.frames));
    url.searchParams.set('dpr', String(isLoop ? LOOP_SCALE : STILL_SCALE));
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
    /** draws frame `index` of the loop (a still has only frame 0, already drawn) and reads it back */
    const grab = async (index: number) => {
      const dataUrl = await page.evaluate(
        async ([i, isFrame]) => {
          const bakeWindow = window as unknown as {
            atelierFrame: (i: number) => Promise<void>;
          };
          if (isFrame) await bakeWindow.atelierFrame(i);
          return document.querySelector('canvas')?.toDataURL('image/png') ?? '';
        },
        [index, isLoop] as const,
      );
      if (!dataUrl.startsWith('data:image/png;base64,'))
        throw new Error('bake produced no image');
      return Buffer.from(
        dataUrl.slice('data:image/png;base64,'.length),
        'base64',
      );
    };
    const pngs: Buffer[] = [];
    for (let index = 0; index < input.frames; index += 1) {
      // biome-ignore lint/performance/noAwaitInLoops: one canvas, so the frames are drawn one after another
      pngs.push(await grab(index));
    }
    return pngs;
  } finally {
    await page.close();
  }
};

/* Types */

interface BakeInput {
  /** 1 bakes a still; more bakes that many frames of the motion loop into an animated webp */
  frames: number;
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
