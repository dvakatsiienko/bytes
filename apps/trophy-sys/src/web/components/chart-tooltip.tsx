import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** The one tooltip every chart uses, with the game icon slot. */
export const ChartTooltip = (props: ChartTooltipProps) => {
  const rowListJSX = props.rows.map((row) => {
    return (
      <div className='contents' key={row.label}>
        <dt className='text-mute'>{row.label}</dt>
        <dd className='text-right text-fg-soft'>{row.value}</dd>
      </div>
    );
  });

  return (
    <div className='pointer-events-none border border-line bg-bg-lift px-2 py-1.5 text-[12px] leading-relaxed'>
      <div className='flex items-center gap-1.5'>
        {props.iconUrl && (
          <img
            alt=''
            className='size-5 shrink-0 border border-line bg-bg-soft object-contain'
            height={20}
            src={props.iconUrl}
            width={20}
          />
        )}
        <span className='max-w-44 select-text truncate text-fg'>
          {props.title}
        </span>
      </div>

      {props.note && (
        <p className='mt-1 max-w-44 text-[12px] text-mute'>{props.note}</p>
      )}

      <dl className='mt-1 grid grid-cols-[auto_auto] gap-x-3'>{rowListJSX}</dl>
    </div>
  );
};

/**
 * Parks a tooltip beside a point in a chart, in a portal on the body.
 *
 * The portal is what makes it visible at all: three ancestors clip an
 * absolutely positioned card — visx's own `ParentSize` wraps children in an
 * `inset: 0; overflow: hidden` box, and both the panel body and `<main>`
 * scroll. A 177px card inside a 134px chart cannot be flipped into fitting, so
 * it has to leave the box rather than be placed cleverly inside it.
 *
 * Measured against the viewport in a layout effect, so the first paint is
 * already in the right place. Still deliberately not visx's own
 * `useTooltipInPortal`: that one rebuilds its portal whenever the measured
 * container bounds change, and the portal leaves the document with it.
 */
export const TooltipLayer = (props: TooltipLayerProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<Place | null>(null);

  // The two deps are never read here — they move the anchor, and the anchor is
  // what gets measured, so they are the signal that a new measurement is due.
  // biome-ignore lint/correctness/useExhaustiveDependencies: measured through the anchor, not read
  useLayoutEffect(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    const card = cardRef.current?.getBoundingClientRect();
    if (!(anchor && card)) return;

    const fitsRight =
      anchor.left + GAP + card.width <= window.innerWidth - EDGE;
    const fitsBelow =
      anchor.top + GAP + card.height <= window.innerHeight - EDGE;

    setPlace({
      left: clamp(
        fitsRight ? anchor.left + GAP : anchor.left - GAP - card.width,
        card.width,
        window.innerWidth,
      ),
      top: clamp(
        fitsBelow ? anchor.top + GAP : anchor.top - GAP - card.height,
        card.height,
        window.innerHeight,
      ),
    });
  }, [props.left, props.top]);

  return (
    <>
      <div
        className='pointer-events-none absolute'
        ref={anchorRef}
        style={{ left: props.left ?? 0, top: props.top ?? 0 }}
      />

      {createPortal(
        <div
          className={`pointer-events-none fixed z-50 ${place ? '' : 'invisible'}`}
          ref={cardRef}
          style={{ left: place?.left ?? 0, top: place?.top ?? 0 }}>
          {props.children}
        </div>,
        document.body,
      )}
    </>
  );
};

/* Helpers */
/** Distance from the anchor point to the card. */
const GAP = 12;
/** Breathing room kept between the card and the window edge. */
const EDGE = 8;

const clamp = (value: number, size: number, limit: number) =>
  Math.min(Math.max(value, EDGE), Math.max(limit - size - EDGE, EDGE));

/* Types */
export interface TooltipRow {
  label: string;
  value: string;
}

interface ChartTooltipProps {
  iconUrl?: string;
  /** A line of prose above the readings — what a bucket means, say. */
  note?: string;
  rows: TooltipRow[];
  title: string;
}

interface TooltipLayerProps {
  children: ReactNode;
  /** Where the tooltip points, in the chart's own coordinates. */
  left: number | undefined;
  top: number | undefined;
}

interface Place {
  left: number;
  top: number;
}
