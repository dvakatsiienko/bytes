/**
 * TEMPLATE · icon — a 256 × 256 app or feature icon. Draw in a 100 × 100 box
 * centred on the origin (as `signs.ts` icons do); the frame places it. Copy,
 * rename, register; `pnpm atelier:icons <piece>` exports png sizes.
 */
import type { Palette } from '../palette.ts';
import { defs } from '../paper.ts';

export const iconSize = { h: 256, w: 256 };

/** the mark itself, in the 100 × 100 box around (0, 0) */
const mark = (p: Palette) =>
  `<circle r="34" fill="${p.brass.base}"/><circle r="22" fill="${p.brass.lit}"/><path d="M0 -44v14M0 30v14M-44 0h14M30 0h14" stroke="${p.brass.shade}" stroke-width="7" stroke-linecap="round"/>`;

export const templateIcon = (p: Palette) =>
  `${defs(p)}<rect width="256" height="256" rx="56" fill="${p.isNight ? p.sky[0] : p.room.wall}"/><g transform="translate(128 128) scale(1.6)" filter="url(#lift)">${mark(p)}</g>`;
