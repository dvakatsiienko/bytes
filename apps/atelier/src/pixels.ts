/**
 * The zoom a flat piece sits at on the plain stage: a whole multiple of its
 * size that fits the room, so every pixel stays square; a piece bigger than
 * the room is scaled down to fit instead.
 */
export const integerScale = (
  size: { w: number; h: number },
  width: number,
  height: number,
) => {
  const fit = Math.min(width / size.w, height / size.h);
  return fit >= 1 ? Math.floor(fit) : fit;
};

/** a pixel view's whole zooms: the largest that fits the room, and the fixed steps below it */
export const pixelZooms = (size: number, width: number, height: number) => {
  const fit = Math.max(1, Math.floor(Math.min(width, height) / size));
  return { fit, steps: [1, 8, 24].filter((step) => step < fit) };
};
