/**
 * TEMPLATE · badge — a 220 × 40 readme badge: a label and a value, lettered in
 * Young Serif as paths so github renders it exactly.
 */
import { letter, textWidth } from '../lettering.ts';
import type { Palette } from '../palette.ts';
import { n } from '../paper.ts';

export const badgeSize = { h: 40, w: 220 };

export const templateBadge = (label: string, value: string) => (p: Palette) => {
  const labelWidth = textWidth(label, 16) + 28;
  const ink = p.isNight ? '#E8ECF6' : '#22324A';
  return `<rect width="220" height="40" rx="10" fill="${p.isNight ? '#1A2040' : '#FFFFFF'}" stroke="${p.isNight ? '#2C3460' : '#CFDBE5'}"/><rect width="${n(labelWidth)}" height="40" rx="10" fill="${p.dino.hide}"/><rect x="${n(labelWidth - 10)}" width="10" height="40" fill="${p.dino.hide}"/>${letter(label, 14, 26, 16, '#FFFFFF')}${letter(value, labelWidth + 12, 26, 16, ink)}`;
};
