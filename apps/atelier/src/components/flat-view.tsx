import type { ReactNode, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from 'cn';
import { useAtom, useAtomValue } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import { pieceSvg } from '../../art/pieces.ts';
import { svgDataUrl } from '../image.ts';
import { integerScale, pixelZooms } from '../pixels.ts';
import { defaults } from '../stage/settings.ts';
import type { ReadmeWidth } from '../state.ts';
import { pixelSizeAtom, settingsByPieceAtom, timeAtom } from '../state.ts';
import { ReadmeFrame } from './readme-frame';
import { Segmented } from './segmented';

/**
 * A flat piece on the plain ground: at a whole multiple of its own size when it
 * fits, scaled down to fit when it does not. A favicon also shows where it
 * lands, at true size, and any of those sizes opens as a pixel view.
 */
export const FlatView = (props: FlatViewProps) => {
  const well = useRef<HTMLDivElement>(null);
  const room = useRoom(well);
  const [pixel, setPixel] = useAtom(pixelSizeAtom);
  const time = useAtomValue(timeAtom);
  const { seed } =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const isFavicon = props.piece.kind === 'favicon';
  const pixelSize =
    isFavicon && pixel?.piece === props.piece.id ? pixel.size : null;
  const src = svgDataUrl(pieceSvg(props.piece, time, seed));
  // the caption under the piece takes its line of the well
  const scale = room
    ? integerScale(props.piece.size, room.width, room.height - CAPTION_PX)
    : null;

  let wellJSX: ReactNode = null;
  if (pixelSize && room)
    wellJSX = (
      <PixelView
        height={room.height}
        key={`${pixelSize}:${src}`}
        size={pixelSize}
        src={src}
        width={room.width}
      />
    );
  else if (props.readme !== 'fit')
    wellJSX = (
      <ReadmeFrame width={props.readme}>
        <div
          className='mx-auto'
          style={{ width: `min(100%, ${props.piece.size.w}px)` }}>
          {props.children}
        </div>
      </ReadmeFrame>
    );
  else if (scale)
    wellJSX = (
      <figure className='flex flex-col items-center gap-2'>
        <div
          className='shadow-[0_18px_48px_-18px_rgb(0_0_0/0.35)]'
          data-testid='flat-piece'
          style={{
            // past one image pixel per screen pixel a flat piece draws with hard pixels
            imageRendering: scale > 1 ? 'pixelated' : 'auto',
            width: props.piece.size.w * scale,
          }}>
          {props.children}
        </div>
        <figcaption className='text-ground-muted text-sm tabular-nums'>
          {props.piece.size.w} × {props.piece.size.h} px, shown{' '}
          {Number.isInteger(scale)
            ? `${scale}×`
            : `${Math.round(scale * 100)} %`}
        </figcaption>
      </figure>
    );

  const landListJSX = lands.map((land) => {
    const isPressed = pixelSize === land.size;
    return (
      <li key={land.label}>
        <button
          aria-label={`${land.label}, ${land.size} px: ${isPressed ? 'back to the whole piece' : 'open its pixel view'}`}
          aria-pressed={isPressed}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg px-3 py-2 hover:bg-ground-ink/8',
            isPressed && 'bg-ground-ink/12 hover:bg-ground-ink/12',
          )}
          onClick={() =>
            setPixel(
              isPressed ? null : { piece: props.piece.id, size: land.size },
            )
          }
          type='button'>
          <span className='flex h-16 items-center'>
            <span
              className={cn(
                'flex items-center gap-2',
                // a browser tab: the icon beside the page's title, as a tab strip shows it
                land.chrome === 'tab' &&
                  'h-8 rounded-md bg-white px-3 text-[#2b3236] text-sm',
              )}>
              <img
                alt=''
                height={land.size}
                src={src}
                style={{ height: land.size, width: land.size }}
                width={land.size}
              />
              {land.chrome === 'tab' ? <span>{props.piece.id}</span> : null}
            </span>
          </span>
          <span className='text-ground-ink text-sm'>
            {land.label}, {land.size}
          </span>
        </button>
      </li>
    );
  });

  return (
    <main
      aria-label='the piece'
      className='absolute inset-0 isolate flex flex-col items-center gap-4 px-4 pt-[calc(28px+max(var(--tl,0px),var(--tr,0px)))] pb-[calc(28px+max(var(--bl,0px),var(--br,0px)))] text-ground-ink'>
      <div className='grid min-h-0 w-full flex-1 place-items-center' ref={well}>
        {wellJSX}
      </div>
      {isFavicon ? (
        <section
          aria-label='as it lands'
          className='flex flex-col items-center gap-2'>
          <h2 className='text-ground-muted text-sm'>
            as it lands, at true size
          </h2>
          <ul className='flex flex-wrap items-end justify-center gap-2'>
            {landListJSX}
          </ul>
        </section>
      ) : null}
    </main>
  );
};

/**
 * The favicon drawn at `size` px, one square per pixel, at a whole zoom; a
 * grid between the pixels from 8×. Pointing at a pixel names it and its colour.
 */
const PixelView = (props: PixelViewProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<ImageData | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  // the caption and the zoom switch sit under the pixels
  const zooms = pixelZooms(
    props.size,
    props.width,
    props.height - CAPTION_PX - 48,
  );
  const [zoom, setZoom] = useState(zooms.fit);
  const shown = Math.min(zoom, zooms.fit);
  // one square is `shown` css px; the canvas draws it in whole device pixels, so a 2× screen stays sharp
  const [ratio] = useState(() => Math.max(1, Math.round(devicePixelRatio)));
  const cell = shown * ratio;

  // the browser draws the svg at the size it lands at; that small image is what we enlarge
  useEffect(() => {
    let isLive = true;
    const image = new Image();
    image.src = props.src;
    image
      .decode()
      .then(() => {
        const small = document.createElement('canvas');
        small.width = props.size;
        small.height = props.size;
        const context = small.getContext('2d');
        if (!(context && isLive)) return;
        context.drawImage(image, 0, 0, props.size, props.size);
        setPixels(context.getImageData(0, 0, props.size, props.size));
      })
      .catch(() => undefined);
    return () => {
      isLive = false;
    };
  }, [props.src, props.size]);

  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!(context && pixels)) return;
    const side = props.size * cell;
    context.clearRect(0, 0, side, side);
    for (let y = 0; y < props.size; y += 1)
      for (let x = 0; x < props.size; x += 1) {
        const at = (y * props.size + x) * 4;
        const [r, g, b, a] = pixels.data.slice(at, at + 4);
        context.fillStyle = `rgb(${r} ${g} ${b} / ${(a ?? 255) / 255})`;
        context.fillRect(x * cell, y * cell, cell, cell);
      }
    if (shown < 8) return;
    context.fillStyle = 'rgb(128 138 144 / 0.55)';
    for (let line = 1; line < props.size; line += 1) {
      context.fillRect(line * cell, 0, ratio, side);
      context.fillRect(0, line * cell, side, ratio);
    }
  }, [pixels, cell, ratio, shown, props.size]);

  const zoomOptions = [
    { label: `fit ${zooms.fit}×`, value: 'fit' },
    ...zooms.steps.map((step) => {
      return { label: `${step}×`, value: String(step) };
    }),
  ];

  return (
    <figure className='flex flex-col items-center gap-2'>
      <canvas
        aria-label={`${props.size} px pixel view at ${shown}×`}
        className='cursor-crosshair shadow-[0_18px_48px_-18px_rgb(0_0_0/0.35)]'
        data-testid='pixel-view'
        data-zoom={shown}
        height={props.size * cell}
        onPointerLeave={() => setPicked(null)}
        onPointerMove={(event) => {
          if (!pixels) return;
          const last = props.size - 1;
          const x = Math.min(
            last,
            Math.floor(event.nativeEvent.offsetX / shown),
          );
          const y = Math.min(
            last,
            Math.floor(event.nativeEvent.offsetY / shown),
          );
          const at = (y * props.size + x) * 4;
          const hex = [...pixels.data.slice(at, at + 3)]
            .map((channel) => channel.toString(16).padStart(2, '0'))
            .join('');
          setPicked(`pixel ${x}, ${y} #${hex}`);
        }}
        ref={canvas}
        role='img'
        style={{ height: props.size * shown, width: props.size * shown }}
        width={props.size * cell}
      />
      <figcaption className='flex w-full items-center justify-between gap-6 text-ground-ink text-sm tabular-nums'>
        <span>
          {props.size} × {props.size} px, shown {shown}×
        </span>
        <span>{picked ?? 'point at a pixel'}</span>
      </figcaption>
      <div className='glass w-72'>
        <Segmented
          ariaLabel='pixel zoom'
          onValueChange={(next) =>
            setZoom(next === 'fit' ? zooms.fit : Number(next))
          }
          options={zoomOptions}
          value={shown === zooms.fit ? 'fit' : String(shown)}
        />
      </div>
    </figure>
  );
};

/** the well's size in css px, followed as the window changes */
const useRoom = (well: RefObject<HTMLDivElement | null>) => {
  const [room, setRoom] = useState<{ width: number; height: number } | null>(
    null,
  );
  useEffect(() => {
    const node = well.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setRoom({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [well]);
  return room;
};

/* Helpers */

/** the caption's line under a piece or a pixel view, with its gap */
const CAPTION_PX = 32;

/** where a favicon lands, at the size it lands at */
const lands = [
  { chrome: 'tab', label: 'browser tab', size: 16 },
  { chrome: 'none', label: 'tab on retina', size: 32 },
  { chrome: 'none', label: 'home screen', size: 64 },
] as const;

/* Types */

interface FlatViewProps {
  children: ReactNode;
  piece: Piece;
  readme: ReadmeWidth;
}

interface PixelViewProps {
  height: number;
  size: number;
  src: string;
  width: number;
}
