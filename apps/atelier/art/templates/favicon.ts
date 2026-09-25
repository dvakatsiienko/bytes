/**
 * TEMPLATE · favicon — drawn once at 512 × 512 with a shape that still reads
 * at 16 px (one bold mark, no thin lines). `pnpm atelier:icons <piece>`
 * writes every size a site needs.
 */
import type { Palette } from '../palette.ts';

export const faviconSize = { h: 512, w: 512 };

export const templateFavicon = (p: Palette) =>
  `<rect width="512" height="512" rx="112" fill="${p.isNight ? '#121629' : p.dino.hide}"/><circle cx="256" cy="220" r="104" fill="${p.glow}"/><rect x="136" y="366" width="240" height="44" rx="22" fill="${p.isNight ? p.dino.hide : '#FFFFFF'}"/>`;
