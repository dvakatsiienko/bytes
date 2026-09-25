/**
 * atelier's own mark — «the crafter and the lamp»: a hanging shade, the bulb, and its light
 * falling on a paper card, the piece on the bench. Drawn at 512 × 512; it reads at 16 px as
 * three blocks (shade, glow, card). Colours are atelier's DESIGN.md tokens, not the story's.
 */
import type { Palette } from './palette.ts';
import type { Pt } from './paper.ts';
import { n, seeded } from './paper.ts';

const ink = { day: '#22324a', night: '#3a4270' };
/** the shade: navy by day; terracotta at night, so the brand colour carries the mark on indigo */
const shadeFill = { day: '#22324a', night: '#c8553d' };
/** a warmer gold for the night cone: plain lamp gold at low alpha on indigo reads olive */
const coneGold = { day: '#ffd978', night: '#ffb85c' };
const tile = { day: '#c8553d', night: '#121629' };
const lampGold = '#ffd978';
const bulbCore = '#fff6d0';
const paper = '#fff8ea';

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

export const atelierFavicon = (p: Palette, seed: number) => {
  const rand = seeded(seed || 1847);
  const time = p.isNight ? 'night' : 'day';
  const shade: Pt[] = [
    [214, 112],
    [298, 112],
    [390, 236],
    [122, 236],
  ];
  const cone: Pt[] = [
    [150, 236],
    [362, 236],
    [436, 404],
    [76, 404],
  ];
  const card: Pt[] = [
    [150, 372],
    [362, 360],
    [366, 432],
    [154, 444],
  ];
  const hill: Pt[] = [
    [176, 426],
    [226, 392],
    [262, 410],
    [300, 384],
    [342, 420],
    [342, 426],
  ];
  return [
    `<defs><radialGradient id="favGlow-${time}" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="${coneGold[time]}" stop-opacity="${p.isNight ? 0.7 : 0.55}"/><stop offset="1" stop-color="${coneGold[time]}" stop-opacity="0"/></radialGradient>`,
    `<filter id="favLift-${time}" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0a0e1e" flood-opacity="${p.isNight ? 0.55 : 0.35}"/></filter></defs>`,
    `<rect width="512" height="512" rx="112" fill="${tile[time]}"/>`,
    `<path d="${cut(cone, rand, 18, 1.2)}" fill="url(#favGlow-${time})"/>`,
    `<rect x="248" y="0" width="16" height="118" fill="${ink[time]}"/>`,
    `<g filter="url(#favLift-${time})"><path d="${cut(card, rand)}" fill="${paper}"/><path d="${cut(hill, rand, 10, 1.4)}" fill="${ink.day}"/><circle cx="300" cy="386" r="12" fill="${lampGold}"/></g>`,
    `<g filter="url(#favLift-${time})"><path d="${cut(shade, rand)}" fill="${shadeFill[time]}"/><path d="M126 234L386 234" stroke="${lampGold}" stroke-opacity="${p.isNight ? 0.9 : 0}" stroke-width="6" stroke-linecap="round"/></g>`,
    `<path d="M214 236A42 42 0 0 0 298 236Z" fill="${lampGold}"/><path d="M234 236A22 22 0 0 0 278 236Z" fill="${bulbCore}"/>`,
  ].join('');
};
