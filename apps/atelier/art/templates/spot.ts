/**
 * TEMPLATE · spot — a 480 × 300 tile for a readme «tour» row: one object on a
 * wall, clipped to a rounded card with paper grain. Copy, rename, register.
 */
import { rosette } from '../flora.ts';
import type { Palette } from '../palette.ts';
import { defs, glowDot, n, seeded } from '../paper.ts';

export const spotSize = { h: 300, w: 480 };

export const templateSpot = (p: Palette, seed = 1) => {
  const { w, h } = spotSize;
  const rand = seeded(seed);
  const wall = `<rect width="${w}" height="${h}" fill="${p.room.wall}"/><rect y="200" width="${w}" height="${h - 200}" fill="${p.room.wallShade}"/><path d="M0 200H${w}" stroke="${p.room.trim}" stroke-width="5"/>`;
  const shelf = `<g filter="url(#lift)"><rect x="140" y="170" width="200" height="12" rx="3" fill="${p.room.floor}"/></g>`;
  const flowers = Array.from({ length: 3 }, (_, i) =>
    rosette(
      190 + i * 50,
      150 - rand() * 10,
      12,
      p.flora.coral,
      p.flora.marigold,
      p,
      i * 20,
    ),
  ).join('');
  const glow = p.isNight ? glowDot(n(240), 120, 3) : '';
  return `${defs(p)}<defs><clipPath id="spot"><rect width="${w}" height="${h}" rx="16"/></clipPath></defs><g clip-path="url(#spot)">${wall}${shelf}<g filter="url(#lift)">${flowers}</g>${glow}<rect width="${w}" height="${h}" filter="url(#grain)"/></g>`;
};
