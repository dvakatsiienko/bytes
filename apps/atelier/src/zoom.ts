export const MAX_SCALE = 16;
/** the lowest zoom, as a share of fit: a little air around the whole image */
const MIN_OF_FIT = 0.9;
/** a scroll in lines (some mice) is about one line of text each */
const LINE_PX = 16;
/** one event's zoom is capped at one mouse notch, so a spike never jumps (at ±50 px a notch could not reach ×1.19) */
const MAX_DELTA_PX = 100;
/** px of scroll per doubling: a 100 px mouse notch is ×1.19 */
const WHEEL_PX_PER_DOUBLING = 400;
/** a pinch sends small deltas, so it doubles in a quarter of the distance */
const PINCH_PX_PER_DOUBLING = 100;
/** a toolbar press or a ± key multiplies the scale by this; small on purpose, and the one number to tune */
export const PRESS_FACTOR = 1.1;
/** a gesture that ends within 4 % of a landmark scale lands on it */
const SNAP_TOLERANCE = 0.04;
/** how far a pan may stretch past the art's edge before it springs back */
export const OVERSHOOT_PX = 80;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** from 0.9 × fit up to 16× */
export const rangeOf = (fit: number): Range => ({
  max: MAX_SCALE,
  min: fit * MIN_OF_FIT,
});

const toPx = (delta: number, wheel: Wheel) => {
  if (wheel.deltaMode === 1) return delta * LINE_PX;
  if (wheel.deltaMode === 2) return delta * wheel.pageHeight;
  return delta;
};

/**
 * The library's zoomIn / zoomOut ADD their step to the scale, so a fixed step
 * is not the same factor both ways. This is the step that makes a press
 * multiply (in) or divide (out) by the same factor, inside the range.
 */
export const pressStep = (scale: number, direction: 1 | -1, range: Range) =>
  Math.abs(
    clamp(scale * PRESS_FACTOR ** direction, range.min, range.max) - scale,
  );

/**
 * One wheel event against the zoom's transform (`translate(x, y) scale(s)`,
 * origin top left). A trackpad pinch arrives as a wheel event with `ctrlKey`;
 * it, ⌘-scroll and — where the scroll is the zoom — a plain scroll multiply
 * the scale by 2^(−px ÷ K) around the pointer, so the image point under it
 * stays put and an equal scroll back returns the exact scale. Any other
 * scroll pans.
 */
export const wheelTransform = (
  view: View,
  wheel: Wheel,
  range: Range,
  plainScroll: 'pan' | 'zoom' = 'pan',
): View => {
  if (!(wheel.ctrlKey || wheel.metaKey || plainScroll === 'zoom'))
    return {
      scale: view.scale,
      x: view.x - toPx(wheel.deltaX, wheel),
      y: view.y - toPx(wheel.deltaY, wheel),
    };

  const px = clamp(toPx(wheel.deltaY, wheel), -MAX_DELTA_PX, MAX_DELTA_PX);
  const perDoubling = wheel.ctrlKey
    ? PINCH_PX_PER_DOUBLING
    : WHEEL_PX_PER_DOUBLING;
  const scale = clamp(
    view.scale * 2 ** (-px / perDoubling),
    range.min,
    range.max,
  );
  const ratio = scale / view.scale;
  return {
    scale,
    x: wheel.pointX - (wheel.pointX - view.x) * ratio,
    y: wheel.pointY - (wheel.pointY - view.y) * ratio,
  };
};

/** the landmark the scale lands on at a gesture's end, if it is within 4 % of one */
export const snapScale = (scale: number, landmarks: readonly number[]) =>
  landmarks.find((mark) => Math.abs(scale / mark - 1) <= SNAP_TOLERANCE) ??
  scale;

/** per axis: art wider than the box covers it, give or take `slack`; art that fits sits in the middle, give or take `slack` */
const settleAxis = (
  offset: number,
  box: number,
  shown: number,
  slack: number,
) =>
  shown <= box
    ? clamp(offset, (box - shown) / 2 - slack, (box - shown) / 2 + slack)
    : clamp(offset, box - shown - slack, slack);

/** per axis mid-zoom: at least half of the art, or half the box, stays in view */
const overlapAxis = (offset: number, box: number, shown: number) => {
  const overlap = Math.min(shown, box) / 2;
  return clamp(offset, overlap - shown, box - overlap);
};

/**
 * Where the art rests: covering the box when it is larger, centred when it
 * fits. With `slack`, a pan in progress may stretch that far past the edge
 * and springs back when it rests.
 */
export const settleInView = (
  view: View,
  box: Box,
  content: Box,
  slack = 0,
): View => ({
  scale: view.scale,
  x: settleAxis(view.x, box.width, content.width * view.scale, slack),
  y: settleAxis(view.y, box.height, content.height * view.scale, slack),
});

/**
 * Mid-zoom the art only has to stay in sight: half of it, or half the box,
 * whichever is smaller. A pinch over the art keeps the point under the
 * pointer, so this bites only when the pointer sits beside the art.
 */
export const keepOverlap = (view: View, box: Box, content: Box): View => ({
  scale: view.scale,
  x: overlapAxis(view.x, box.width, content.width * view.scale),
  y: overlapAxis(view.y, box.height, content.height * view.scale),
});

/* Types */

export interface Range {
  max: number;
  min: number;
}

export interface Box {
  height: number;
  width: number;
}

export interface View {
  scale: number;
  x: number;
  y: number;
}

/** the wheel event's fields, the pointer relative to the zoom box, and the page height a page-mode scroll counts in */
export interface Wheel {
  ctrlKey: boolean;
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  metaKey: boolean;
  pageHeight: number;
  pointX: number;
  pointY: number;
}
