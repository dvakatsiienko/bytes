/**
 * The async clipboard writes `image/png` in every browser and little else, so
 * whatever is on screen — the live canvas, a webp take, a flat svg — goes
 * through a canvas and out as png. `scale` draws an svg at 2× its own size.
 */
export const toPngBlob = async (
  source: HTMLCanvasElement | string,
  scale = 1,
): Promise<Blob> => {
  const canvas =
    typeof source === 'string' ? await rasterise(source, scale) : source;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('the image could not be encoded')),
      'image/png',
    );
  });
};

export const copyPng = (source: HTMLCanvasElement | string, scale = 1) =>
  // the promise form keeps safari's user-activation window open while encoding
  navigator.clipboard.write([
    new ClipboardItem({ 'image/png': toPngBlob(source, scale) }),
  ]);

export const svgDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** the live stage's canvas, when the viewport shows one */
export const stageCanvas = () =>
  document.querySelector<HTMLCanvasElement>('[data-testid="stage"] canvas');

const rasterise = async (url: string, scale: number) => {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth * scale;
  canvas.height = image.naturalHeight * scale;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no 2d context');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};
