import { describe, expect, it } from 'vitest';

import type { View, Wheel } from './zoom.ts';
import { MAX_SCALE, MIN_SCALE, pressStep, wheelTransform } from './zoom.ts';

const start: View = { scale: 0.8, x: 40, y: -30 };
const wheelOf = (patch: Partial<Wheel>): Wheel => ({
  ctrlKey: false,
  deltaMode: 0,
  deltaX: 0,
  deltaY: 0,
  metaKey: false,
  pointX: 300,
  pointY: 200,
  ...patch,
});
/** trackpad pinch (ctrl), ⌘-scroll, a mouse notch in lines */
const zooms = [
  { ctrlKey: true, deltaY: -3 },
  { ctrlKey: true, deltaY: 7 },
  { deltaY: -100, metaKey: true },
  { deltaMode: 1, deltaY: 3, metaKey: true },
] as const;
const imagePointUnder = (view: View, x: number, y: number) => ({
  x: (x - view.x) / view.scale,
  y: (y - view.y) / view.scale,
});

describe('wheelTransform', () => {
  it('keeps the image point under the pointer in place on every zoom', () => {
    for (const zoom of zooms) {
      for (const [pointX, pointY] of [
        [0, 0],
        [300, 200],
        [913, 41],
      ] as const) {
        const next = wheelTransform(
          start,
          wheelOf({ ...zoom, pointX, pointY }),
        );
        const before = imagePointUnder(start, pointX, pointY);
        const after = imagePointUnder(next, pointX, pointY);
        expect(after.x).toBeCloseTo(before.x, 9);
        expect(after.y).toBeCloseTo(before.y, 9);
      }
    }
  });

  it('returns to the start scale when a zoom is undone by the opposite zoom', () => {
    for (const zoom of zooms) {
      const there = wheelTransform(start, wheelOf(zoom));
      const back = wheelTransform(
        there,
        wheelOf({ ...zoom, deltaY: -zoom.deltaY }),
      );
      expect(back.scale).toBeCloseTo(start.scale, 9);
    }
  });

  it('keeps growing while a pinch keeps going in, up to the max', () => {
    let view: View = { scale: 0.5, x: 0, y: 0 };
    const scales: number[] = [];
    for (let i = 0; i < 400; i += 1) {
      view = wheelTransform(view, wheelOf({ ctrlKey: true, deltaY: -4 }));
      scales.push(view.scale);
    }
    expect(scales.some((scale) => scale > 1)).toBe(true);
    expect(scales).toEqual(scales.toSorted((a, b) => a - b));
    expect(view.scale).toBe(MAX_SCALE);
  });

  it('never leaves the scale range, however hard the wheel goes', () => {
    for (const deltaY of [-1e6, 1e6]) {
      let view = start;
      for (let i = 0; i < 300; i += 1)
        view = wheelTransform(view, wheelOf({ ctrlKey: true, deltaY }));
      expect(view.scale).toBeGreaterThanOrEqual(MIN_SCALE);
      expect(view.scale).toBeLessThanOrEqual(MAX_SCALE);
    }
  });

  it('pans by the scroll and keeps the scale when no zoom key is held', () => {
    for (const [deltaMode, unit] of [
      [0, 1],
      [1, 16],
    ] as const) {
      const next = wheelTransform(
        start,
        wheelOf({ deltaMode, deltaX: 12, deltaY: -5 }),
      );
      expect(next).toEqual({
        scale: start.scale,
        x: start.x - 12 * unit,
        y: start.y + 5 * unit,
      });
    }
  });
});

describe('pressStep', () => {
  it('makes one press in and one press out cancel, from any scale inside the range', () => {
    for (const from of [0.2, 0.53, 1, 3.7, 10]) {
      const zoomedIn = from + pressStep(from, 1);
      expect(zoomedIn - pressStep(zoomedIn, -1)).toBeCloseTo(from, 9);
      const zoomedOut = from - pressStep(from, -1);
      expect(zoomedOut + pressStep(zoomedOut, 1)).toBeCloseTo(from, 9);
    }
  });

  it('never steps past the scale range', () => {
    expect(MAX_SCALE + pressStep(MAX_SCALE, 1)).toBe(MAX_SCALE);
    expect(MIN_SCALE - pressStep(MIN_SCALE, -1)).toBe(MIN_SCALE);
  });
});
