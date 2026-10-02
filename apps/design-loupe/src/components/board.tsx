import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { KeepScale, Virtualize } from 'react-zoom-pan-pinch';

import type { BoardView } from '../../server/job.ts';
import type { Rect } from '@/view.ts';
import { NEAR_MARGIN } from '@/view.ts';

/**
 * One board at its canvas place. It is a live frame only while it is in view
 * or one ring of neighbours out (`Virtualize`); further out it is a titled
 * placeholder. tldraw's embed recipe: the frame takes no pointer until the
 * board is clicked, so a drag over it pans the surface.
 */
export const Board = (props: BoardProps) => {
  // state, not a ref: the frame mounts only once Virtualize shows it, and the effects must follow it
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const pinRect = usePinRect(frame, props.pinId);

  // a live frame has the keyboard, so its own Esc must reach the surface too
  useEffect(() => {
    const view = frame?.contentWindow;
    if (!(props.isLive && frame && view)) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onLive(null);
    };
    view.addEventListener('keydown', handleKey);
    frame.focus();
    return () => view.removeEventListener('keydown', handleKey);
  }, [frame, props.isLive, props.onLive]);

  return (
    <div
      className={props.isLive ? 'loupe-board-live absolute' : 'absolute'}
      data-board={props.board.name}
      id={`board-${props.board.name}`}
      style={{
        height: props.board.h,
        left: props.left,
        top: props.top,
        width: props.board.w,
      }}>
      <KeepScale
        className='pointer-events-none absolute bottom-full left-0 pb-1.5'
        // the title keeps its screen size but never runs wider than its board, so zoomed out they never overlap
        style={{
          transformOrigin: 'bottom left',
          width: `calc(${props.board.w}px * var(--zoom, 1))`,
        }}>
        <span
          className='block truncate font-medium text-desk-ink text-sm'
          title={props.board.title}>
          {props.board.title}
        </span>
      </KeepScale>
      <Virtualize
        className='absolute inset-0 bg-background shadow-sm'
        height={props.board.h}
        margin={NEAR_MARGIN}
        placeholder={
          <div
            className='absolute inset-0 grid place-items-center bg-background/60 shadow-sm'
            data-placeholder>
            <KeepScale>
              <span className='text-desk-ink text-sm'>{props.board.title}</span>
            </KeepScale>
          </div>
        }
        width={props.board.w}
        x={props.left}
        y={props.top}>
        <iframe
          className='block border-0'
          height={props.board.h}
          // a cover board is a picture: nothing inside it takes Tab or a click until it is live
          inert={!props.isLive}
          key={props.board.rev}
          ref={setFrame}
          src={`/boards/${encodeURIComponent(props.board.file)}?rev=${props.board.rev}`}
          style={{ pointerEvents: props.isLive ? 'auto' : 'none' }}
          tabIndex={props.isLive ? 0 : -1}
          title={props.board.title}
          width={props.board.w}
        />
        {pinRect ? (
          <motion.div
            animate={{ opacity: 1 }}
            className='loupe-ring pointer-events-none absolute'
            data-ring={props.pinId}
            initial={{ opacity: 0 }}
            style={{
              // the ring stands 2 screen px off the pin, so its corner is the pin's corner plus that gap
              borderRadius: `calc(${pinRect.radius}px + 2px / var(--zoom, 1))`,
              height: pinRect.h,
              left: pinRect.x,
              top: pinRect.y,
              width: pinRect.w,
            }}
            transition={{ duration: 0.25 }}
          />
        ) : null}
      </Virtualize>
      {props.isLive ? null : (
        <button
          aria-label={`use ${props.board.title} — hover and play; Esc returns to panning`}
          className='absolute inset-0 cursor-grab bg-transparent outline-none transition-colors hover:bg-loupe/[0.04] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:cursor-grabbing'
          // a press that moves is a pan, never a click
          onClick={(event) => {
            const start = downAt.current;
            if (
              start &&
              Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4
            )
              return;
            props.onLive(props.board.name);
          }}
          // Tab onto a board half under the panel brings it on screen; a pointer press is not a reveal
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible'))
              props.onReveal(props.board.name);
          }}
          onPointerDown={(event) => {
            downAt.current = { x: event.clientX, y: event.clientY };
          }}
          title={props.board.title}
          type='button'
        />
      )}
    </div>
  );
};

/* Helpers */

/** how long after a load the pin is re-read, so the runtime's render and late fonts are caught */
const SETTLE_MS = 1500;

/**
 * The pin's box inside its board, in board px. The frame is 1:1 with the
 * board, so the element's rect in the frame's own viewport is its board
 * position; the ring drawn at that box sits over the comp, never inside it.
 */
const usePinRect = (
  frame: HTMLIFrameElement | null,
  pinId: string | undefined,
) => {
  const [rect, setRect] = useState<PinRect | null>(null);

  // a new revision remounts the frame (keyed by rev), so `frame` changes with it
  useEffect(() => {
    if (!(pinId && frame)) {
      setRect(null);
      return;
    }
    let raf = 0;
    let settleUntil = 0;
    const read = () => {
      const pin = frame.contentDocument?.getElementById(pinId);
      if (!pin) return setRect(null);
      const box = pin.getBoundingClientRect();
      const radius =
        Number.parseFloat(getComputedStyle(pin).borderTopLeftRadius) || 0;
      setRect((previous) =>
        previous &&
        previous.x === box.left &&
        previous.y === box.top &&
        previous.w === box.width &&
        previous.h === box.height &&
        previous.radius === radius
          ? previous
          : { h: box.height, radius, w: box.width, x: box.left, y: box.top },
      );
    };
    const settle = () => {
      read();
      if (performance.now() < settleUntil) raf = requestAnimationFrame(settle);
    };
    const handleLoad = () => {
      settleUntil = performance.now() + SETTLE_MS;
      cancelAnimationFrame(raf);
      settle();
      frame.contentWindow?.addEventListener('resize', read);
    };
    frame.addEventListener('load', handleLoad);
    if (frame.contentDocument?.readyState === 'complete') handleLoad();
    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener('load', handleLoad);
      frame.contentWindow?.removeEventListener('resize', read);
    };
  }, [frame, pinId]);

  return rect;
};

/* Types */

/** the pin's box and corner radius, in board px */
interface PinRect extends Rect {
  radius: number;
}

interface BoardProps {
  board: BoardView;
  isLive: boolean;
  left: number;
  /** a board name makes it live, null makes every board a cover again */
  onLive: (board: string | null) => void;
  /** keyboard focus landed on the board's cover */
  onReveal: (board: string) => void;
  /** the open ask's pin on this board, ringed */
  pinId: string | undefined;
  top: number;
}
