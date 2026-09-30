/**
 * atelier's own mark — «the lens ring»: a small piece of art in the middle, and
 * four glass pills hugging its four sides, the way the studio frames every piece.
 * Drawn at 512 × 512 on a 32-unit grid, so at 16 px every part lands on whole
 * pixels: a 10 × 8 px coloured piece inside four 1 px bars.
 * The tile is the ground (light by day, the smoke at night) and the pills are the
 * glass; only the art carries colour, as in the studio (DESIGN.md).
 */
import type { Palette } from './palette.ts';
import type { Pt } from './paper.ts';
import { n, seeded } from './paper.ts';

const tile = { day: '#d3d9dc', night: '#0e1216' };
/** the glass: smoke on the light ground, ink on the dark one */
const pill = { day: '#2b3236', night: '#f2f5f7' };
const sky = { day: '#9cc9df', night: '#2c4474' };
const farHill = { day: '#7fb08a', night: '#4a7a62' };
const nearHill = { day: '#3f7a4e', night: '#23443a' };
const light = { day: '#ffd978', night: '#f2f5f7' };

/** split every edge into ~`step` px pieces and nudge each point sideways: the hand-cut edge */
const cut = (
  poly: readonly Pt[],
  rand: () => number,
  step = 14,
  jitter = 1.8,
) => {
  const out: Pt[] = [];
  poly.forEach(([x1, y1], i) => {
    const [x2, y2] = poly[(i + 1) % poly.length] as Pt;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const parts = Math.max(1, Math.round(len / step));
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    for (let k = 0; k < parts; k += 1) {
      const t = k / parts;
      const push = k === 0 ? 0 : (rand() - 0.5) * 2 * jitter;
      out.push([
        x1 + (x2 - x1) * t + nx * push,
        y1 + (y2 - y1) * t + ny * push,
      ]);
    }
  });
  return `M${out.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;
};

/**
 * the four pills, one per edge: top and bottom lie across, the sides stand up
 * (x, y, w, h). Every edge sits on a 32-unit grid, one pixel at 16 px, so each
 * pill is a crisp pixel thick with a pixel of gap to the art.
 */
const pills = [
  [160, 64, 192, 32],
  [448, 160, 32, 192],
  [160, 416, 192, 32],
  [32, 160, 32, 192],
] as const;

export const atelierFavicon = (p: Palette, seed: number) => {
  const rand = seeded(seed || 1847);
  const time = p.isNight ? 'night' : 'day';
  // the piece: 320 × 256 (10 × 8 px at 16), filling the tile inside its pills
  const art: Pt[] = [
    [96, 128],
    [416, 128],
    [416, 384],
    [96, 384],
  ];
  const far: Pt[] = [
    [96, 300],
    [170, 256],
    [246, 282],
    [320, 244],
    [416, 284],
    [416, 384],
    [96, 384],
  ];
  const near: Pt[] = [
    [96, 330],
    [200, 304],
    [300, 336],
    [416, 312],
    [416, 384],
    [96, 384],
  ];
  const pillListSvg = pills
    .map(([x, y, w, h]) => {
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${pill[time]}"/>`;
    })
    .join('');
  return [
    `<defs><clipPath id="favArt-${time}"><path d="${cut(art, rand, 16, 1.4)}"/></clipPath>`,
    '</defs>',
    `<rect width="512" height="512" rx="112" fill="${tile[time]}"/>`,
    // flat, no lift: at 16 px a shadow only smears the pixel between the art and a pill
    `<g clip-path="url(#favArt-${time})">`,
    `<rect x="88" y="120" width="336" height="272" fill="${sky[time]}"/>`,
    `<circle cx="352" cy="192" r="32" fill="${light[time]}"/>`,
    `<path d="${cut(far, rand, 12, 1.6)}" fill="${farHill[time]}"/>`,
    `<path d="${cut(near, rand, 12, 1.6)}" fill="${nearHill[time]}"/>`,
    '</g>',
    pillListSvg,
  ].join('');
};
