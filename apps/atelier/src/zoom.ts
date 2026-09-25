export const MIN_SCALE = 0.1;
export const MAX_SCALE = 16;

/** a scroll in lines, not pixels (a mouse on some systems): about one line of text each */
const LINE_PX = 16;
/** one mouse-wheel notch reports ~100 px; capping a single event keeps a notch at ×1.5, not ×2.7 */
const MAX_ZOOM_DELTA = 40;
/** scale changes by e^(−0.01 × delta): a pinch's small deltas zoom smoothly, and in and out cancel */
const ZOOM_PER_DELTA = 0.01;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** a toolbar press or a +/− key multiplies the scale by this, so one in and one out cancel */
const PRESS_FACTOR = 1.5;

/**
 * The library's zoomIn / zoomOut ADD their step to the scale, so a fixed step
 * is ×1.5 one way and ×0.5 the other. This is the step that makes a press
 * multiply (in) or divide (out) by the same factor, inside the scale range.
 */
export const pressStep = (scale: number, direction: 1 | -1) =>
  Math.abs(
    clamp(scale * PRESS_FACTOR ** direction, MIN_SCALE, MAX_SCALE) - scale,
  );

/**
 * One wheel event against the zoom's transform (`translate(x, y) scale(s)`,
 * origin top left). A trackpad pinch arrives as a wheel event with `ctrlKey`;
 * it and ⌘-scroll zoom around the pointer, so the image point under it stays
 * put. Any other scroll pans.
 */
export const wheelTransform = (view: View, wheel: Wheel): View => {
  const unit = wheel.deltaMode === 1 ? LINE_PX : 1;
  if (!(wheel.ctrlKey || wheel.metaKey))
    return {
      scale: view.scale,
      x: view.x - wheel.deltaX * unit,
      y: view.y - wheel.deltaY * unit,
    };

  const delta = clamp(wheel.deltaY * unit, -MAX_ZOOM_DELTA, MAX_ZOOM_DELTA);
  const scale = clamp(
    view.scale * Math.exp(-delta * ZOOM_PER_DELTA),
    MIN_SCALE,
    MAX_SCALE,
  );
  const ratio = scale / view.scale;
  return {
    scale,
    x: wheel.pointX - (wheel.pointX - view.x) * ratio,
    y: wheel.pointY - (wheel.pointY - view.y) * ratio,
  };
};

/* Types */

export interface View {
  scale: number;
  x: number;
  y: number;
}

/** the wheel event's fields, with the pointer relative to the zoom box */
export interface Wheel {
  ctrlKey: boolean;
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  metaKey: boolean;
  pointX: number;
  pointY: number;
}
