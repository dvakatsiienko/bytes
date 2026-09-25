import { describe, expect, it } from 'vitest';

import type { View, Wheel } from './zoom.ts';
import {
  MAX_SCALE,
  OVERSHOOT_PX,
  PRESS_FACTOR,
  keepOverlap,
  pressStep,
  rangeOf,
  settleInView,
  snapScale,
  wheelTransform,
} from './zoom.ts';

const range = rangeOf(0.5);
const start: View = { scale: 0.8, x: 40, y: -30 };
const wheelOf = (patch: Partial<Wheel>): Wheel => ({
  ctrlKey: false,
  deltaMode: 0,
  deltaX: 0,
  deltaY: 0,
  metaKey: false,
  pageHeight: 800,
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
          range,
        );
        const before = imagePointUnder(start, pointX, pointY);
        const after = imagePointUnder(next, pointX, pointY);
        expect(after.x).toBeCloseTo(before.x, 9);
        expect(after.y).toBeCloseTo(before.y, 9);
      }
    }
  });

  it('returns to the exact start scale when a zoom is undone by the opposite zoom', () => {
    for (const zoom of zooms) {
      const there = wheelTransform(start, wheelOf(zoom), range);
      const back = wheelTransform(
        there,
        wheelOf({ ...zoom, deltaY: -zoom.deltaY }),
        range,
      );
      expect(back.scale).toBeCloseTo(start.scale, 12);
    }
  });

  it('takes a 100 px mouse notch to ×1.19 and a 25 px pinch to the same', () => {
    const notch = wheelTransform(
      start,
      wheelOf({ deltaY: -100 }),
      range,
      'zoom',
    );
    const pinch = wheelTransform(
      start,
      wheelOf({ ctrlKey: true, deltaY: -25 }),
      range,
    );
    expect(notch.scale / start.scale).toBeCloseTo(2 ** 0.25, 12);
    expect(pinch.scale / start.scale).toBeCloseTo(2 ** 0.25, 12);
  });

  it('counts a scroll in lines and in pages as the pixels it stands for, and caps one event at 100 px', () => {
    // zooming in, so the range's floor never clips the reading
    const inPx = (patch: Partial<Wheel>) =>
      Math.log2(
        wheelTransform(start, wheelOf({ ...patch, ctrlKey: true }), range)
          .scale / start.scale,
      ) * 100;
    expect(inPx({ deltaMode: 1, deltaY: -2 })).toBeCloseTo(32, 9);
    expect(inPx({ deltaY: -400 })).toBeCloseTo(100, 9);
    expect(inPx({ deltaMode: 2, deltaY: -1 })).toBeCloseTo(100, 9);
  });

  it('keeps the anchor pixel under the cursor through 20 notches in, up to 16×, and 20 out', () => {
    const pointX = 420;
    const pointY = 250;
    let view: View = { scale: 0.5, x: 10, y: 20 };
    const anchor = imagePointUnder(view, pointX, pointY);
    for (const deltaY of [
      ...Array.from({ length: 20 }, () => -100),
      ...Array.from({ length: 20 }, () => 100),
    ]) {
      view = wheelTransform(
        view,
        wheelOf({ deltaY, metaKey: true, pointX, pointY }),
        range,
      );
      const now = imagePointUnder(view, pointX, pointY);
      expect(now.x).toBeCloseTo(anchor.x, 6);
      expect(now.y).toBeCloseTo(anchor.y, 6);
    }
  });

  it('never leaves the range, however hard the wheel goes', () => {
    for (const deltaY of [-1e6, 1e6]) {
      let view = start;
      for (let i = 0; i < 400; i += 1)
        view = wheelTransform(view, wheelOf({ ctrlKey: true, deltaY }), range);
      expect(view.scale).toBeGreaterThanOrEqual(range.min);
      expect(view.scale).toBeLessThanOrEqual(MAX_SCALE);
    }
  });

  it('pans by the scroll in pixels and keeps the scale when the scroll is not the zoom', () => {
    for (const [deltaMode, unit] of [
      [0, 1],
      [1, 16],
    ] as const) {
      const next = wheelTransform(
        start,
        wheelOf({ deltaMode, deltaX: 12, deltaY: -5 }),
        range,
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
  it('multiplies by the press factor, and one press in and one out cancel', () => {
    for (const from of [0.6, 1, 3.7, 10]) {
      const zoomedIn = from + pressStep(from, 1, range);
      expect(zoomedIn / from).toBeCloseTo(PRESS_FACTOR, 12);
      expect(zoomedIn - pressStep(zoomedIn, -1, range)).toBeCloseTo(from, 12);
    }
  });

  it('never steps past the range', () => {
    expect(MAX_SCALE + pressStep(MAX_SCALE, 1, range)).toBe(MAX_SCALE);
    expect(range.min - pressStep(range.min, -1, range)).toBe(range.min);
  });
});

describe('rangeOf', () => {
  it('reaches from nine tenths of fit up to 16×', () => {
    expect(rangeOf(0.5)).toEqual({ max: 16, min: 0.45 });
    expect(rangeOf(1)).toEqual({ max: 16, min: 0.9 });
  });
});

describe('snapScale', () => {
  it('lands on a landmark within 4 %, and leaves any other scale alone', () => {
    for (const scale of [0.961, 1, 1.039])
      expect(snapScale(scale, [1, 0.53])).toBe(1);
    for (const scale of [0.95, 1.05, 0.7])
      expect(snapScale(scale, [1, 0.53])).toBe(scale);
    expect(snapScale(0.54, [1, 0.53])).toBe(0.53);
  });
});

describe('settleInView', () => {
  const box = { height: 300, width: 500 };
  const content = { height: 200, width: 400 };

  it('keeps art larger than the box covering it, however far it is pushed', () => {
    for (const scale of [1.6, 4]) {
      for (const [x, y] of [
        [9999, 9999],
        [-9999, -9999],
        [-40, 25],
      ] as const) {
        const view = settleInView({ scale, x, y }, box, content);
        expect(view.x).toBeLessThanOrEqual(0);
        expect(view.y).toBeLessThanOrEqual(0);
        expect(view.x + content.width * scale).toBeGreaterThanOrEqual(
          box.width,
        );
        expect(view.y + content.height * scale).toBeGreaterThanOrEqual(
          box.height,
        );
      }
    }
  });

  it('centres art that fits the box, wherever it was pushed', () => {
    for (const scale of [0.3, 1]) {
      const view = settleInView({ scale, x: 9999, y: -9999 }, box, content);
      expect(view.x).toBeCloseTo((box.width - content.width * scale) / 2, 9);
      expect(view.y).toBeCloseTo((box.height - content.height * scale) / 2, 9);
    }
  });

  it('lets a pan stretch the overshoot past the edge and no further', () => {
    const scale = 2;
    const pushed = settleInView(
      { scale, x: 9999, y: -9999 },
      box,
      content,
      OVERSHOOT_PX,
    );
    expect(pushed.x).toBe(OVERSHOOT_PX);
    expect(pushed.y).toBe(box.height - content.height * scale - OVERSHOOT_PX);
  });

  it('leaves a view that already covers the box alone', () => {
    const view = { scale: 2, x: -120, y: -80 };
    expect(settleInView(view, box, box)).toEqual(view);
  });
});

describe('keepOverlap', () => {
  const box = { height: 300, width: 500 };
  const content = { height: 200, width: 400 };
  const visible = (offset: number, shown: number, size: number) =>
    Math.min(size, offset + shown) - Math.max(0, offset);

  it('keeps half the art, or half the box, in sight however far it is pushed', () => {
    for (const scale of [0.3, 1, 4]) {
      for (const [x, y] of [
        [9999, 9999],
        [-9999, -9999],
      ] as const) {
        const view = keepOverlap({ scale, x, y }, box, content);
        const [shownX, shownY] = [
          content.width * scale,
          content.height * scale,
        ];
        expect(visible(view.x, shownX, box.width)).toBeCloseTo(
          Math.min(shownX, box.width) / 2,
          9,
        );
        expect(visible(view.y, shownY, box.height)).toBeCloseTo(
          Math.min(shownY, box.height) / 2,
          9,
        );
      }
    }
  });

  it('holds the point under the pointer through a whole pinch from fit, the pointer over the art', () => {
    const fit = 0.5;
    const fitted: View = {
      scale: fit,
      x: (box.width - content.width * fit) / 2,
      y: (box.height - content.height * fit) / 2,
    };
    for (const [pointX, pointY] of [
      [160, 110],
      [250, 150],
      [340, 190],
    ] as const) {
      let view = fitted;
      const before = imagePointUnder(view, pointX, pointY);
      for (let i = 0; i < 60; i += 1) {
        view = keepOverlap(
          wheelTransform(
            view,
            wheelOf({ ctrlKey: true, deltaY: -2.5, pointX, pointY }),
            rangeOf(fit),
          ),
          box,
          content,
        );
        const after = imagePointUnder(view, pointX, pointY);
        expect(after.x).toBeCloseTo(before.x, 9);
        expect(after.y).toBeCloseTo(before.y, 9);
      }
    }
  });
});
