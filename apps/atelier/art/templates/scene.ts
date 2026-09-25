/**
 * TEMPLATE · scene — a 1600 × 600 readme hero, cut into paper sheets so the
 * stage can light it. Copy to `art/<name>.ts`, rename the exports, register it
 * in `art/pieces.ts` (flat) and `src/stage/scenes.ts` (lit). See AGENTS.md.
 */
import { cloud, grassTuft, pine } from '../flora.ts';
import type { Palette } from '../palette.ts';
import type { Layer } from '../paper.ts';
import { defs, n, ridge, seeded } from '../paper.ts';

const W = 1600;
const H = 600;

/** the sheets back to front; `depth` is how far a sheet stands behind the front edge */
export const templateSceneLayers = (p: Palette, seed = 1): readonly Layer[] => {
  const rand = seeded(seed);
  const stars = p.isNight
    ? Array.from({ length: 50 }, () => {
        return `<circle cx="${n(rand() * W)}" cy="${n(rand() * 260)}" r="${n(0.6 + rand())}" fill="#FFF3C4" opacity="${n(0.4 + rand() * 0.5)}"/>`;
      }).join('')
    : '';
  const sky = `<linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[2]}"/></linearGradient><rect width="${W}" height="${H}" fill="url(#tsky)"/>${stars}`;
  const pines = Array.from({ length: 5 }, (_, i) =>
    pine(120 + i * 340 + rand() * 60, 470, 140 + rand() * 80, p, seed + i),
  ).join('');
  const tufts = Array.from({ length: 20 }, (_, i) =>
    grassTuft(
      rand() * W,
      520 + rand() * 60,
      10 + rand() * 10,
      p.flora.grass,
      seed + i,
    ),
  ).join('');
  return [
    { body: sky, depth: 9, name: 'sky' },
    {
      body: `<g opacity="${p.isNight ? 0.3 : 1}">${cloud(360, 110, 140, p, seed)}${cloud(1180, 80, 110, p, seed + 1)}</g>`,
      depth: 8.5,
      name: 'clouds',
    },
    {
      body: `<path filter="url(#lift)" d="${ridge({ amp: 22, floor: H, seed, waves: [480, 210], x0: -20, x1: W, y: 380 })}" fill="${p.hill.back}"/>`,
      depth: 5,
      name: 'hills',
    },
    {
      body: `<path filter="url(#lift)" d="${ridge({ amp: 12, floor: H, seed: seed + 1, waves: [560, 240], x0: -20, x1: W, y: 470 })}" fill="${p.hill.front}"/>${pines}`,
      depth: 2,
      name: 'ground',
    },
    { body: tufts, depth: 0, name: 'foreground' },
  ];
};

/** the same sheets as one flat svg body: what ships when the scene is not lit */
export const templateScene = (p: Palette, seed = 1) =>
  `${defs(p)}<clipPath id="tframe"><rect width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#tframe)">${templateSceneLayers(
    p,
    seed,
  )
    .map((layer) => layer.body)
    .join('')}<rect width="${W}" height="${H}" filter="url(#grain)"/></g>`;
