/**
 * speak's mark — the read-aloud tool: a paper-cut speech bubble and two sound arcs leaving it.
 * Drawn at 512 × 512; it reads at 16 px as three blocks (tile, bubble, arcs). The tile is the
 * speak admin's own accent blue by day.
 */
import type { Palette } from './palette.ts';
import type { Pt } from './paper.ts';
import { n, seeded } from './paper.ts';

const tile = { day: '#3d5a98', night: '#121629' };
const paper = '#fff8ea';
const gold = '#ffd978';
const rim = '#ffffff';
const shadow = '#0a0e1e';

/** split every edge into ~`step` px pieces and nudge each point sideways: the hand-cut edge */
const trace = (
  poly: readonly Pt[],
  rand: () => number,
  step = 10,
  jitter = 2,
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

/** a soft squircle with a fat tail pulled from its lower left */
const bubble = (cx: number, cy: number, rx: number, ry: number): Pt[] => {
  const pts: Pt[] = [];
  for (let a = 0; a < 360; a += 6) {
    const t = (a * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    if (a === 120) pts.push([cx - rx * 0.66, cy + ry * 1.62]);
    else if (a < 96 || a > 144)
      pts.push([
        cx + rx * Math.sign(c) * Math.abs(c) ** 0.8,
        cy + ry * Math.sign(s) * Math.abs(s) ** 0.8,
      ]);
  }
  return pts;
};

/** a thick arc band around (cx, cy) from -`sweep` to +`sweep` degrees */
const band = (
  cx: number,
  cy: number,
  r: number,
  width: number,
  sweep: number,
): Pt[] => {
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let a = -sweep; a <= sweep; a += 4) {
    const t = (a * Math.PI) / 180;
    outer.push([
      cx + (r + width / 2) * Math.cos(t),
      cy + (r + width / 2) * Math.sin(t),
    ]);
    inner.push([
      cx + (r - width / 2) * Math.cos(t),
      cy + (r - width / 2) * Math.sin(t),
    ]);
  }
  return [...outer, ...inner.reverse()];
};

/** the sheet: a light rim peeking above, the shape, a soft shade under it */
const sheet = (d: string, fill: string, time: string) =>
  `<g filter="url(#speakLift-${time})"><path d="${d}" fill="${rim}" fill-opacity=".85" transform="translate(0 -5)"/><path d="${d}" fill="${fill}"/></g>`;

export const speak = (p: Palette, seed: number) => {
  const rand = seeded(seed || 7386);
  const time = p.isNight ? 'night' : 'day';
  const talk = trace(bubble(172, 236, 108, 100), rand);
  const near = trace(band(172, 236, 172, 48, 40), rand, 10, 1.6);
  const far = trace(band(172, 236, 268, 48, 34), rand, 10, 1.6);
  return [
    `<defs><filter id="speakLift-${time}" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="${shadow}" flood-opacity="${p.isNight ? 0.6 : 0.35}"/></filter></defs>`,
    `<rect width="512" height="512" rx="112" fill="${tile[time]}"/>`,
    sheet(far, gold, time),
    sheet(near, gold, time),
    sheet(talk, paper, time),
  ].join('');
};
