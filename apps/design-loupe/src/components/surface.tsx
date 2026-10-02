import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import {
  MiniMap,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch';

import { Board } from '@/components/board';

import type { JobView } from '../../server/job.ts';
import { REFRAME_EVENT } from '@/hash.ts';
import type { Rect, Target } from '@/view.ts';
import {
  MAX_SCALE,
  MIN_SCALE,
  askIdOf,
  boundsOf,
  frameRect,
  wheelView,
} from '@/view.ts';

/**
 * Every board of the job on one pan / zoom surface, placed where the canvas
 * places it. A board is a cover until clicked; a click makes it live (hover,
 * play), Esc or a click on the desk makes it a cover again.
 */
export const Surface = (props: SurfaceProps) => {
  const zoomRef = useRef<ReactZoomPanPinchContentRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [liveBoard, setLiveBoard] = useState<string | null>(null);
  const bounds = useMemo(() => boundsOf(props.job.boards), [props.job.boards]);

  const askId = askIdOf(props.target);
  const activeAsk = props.job.asks.find((ask) => ask.id === askId);
  const framedBoard =
    props.target.kind === 'board'
      ? props.target.board
      : props.job.boards.find((board) => board.file === activeAsk?.board)?.name;

  // frames on a new target only: an answer refetches the job, and the view must not jump for it
  const frameKey = askId ?? framedBoard ?? 'overview';
  const frameNow = () => {
    const zoom = zoomRef.current;
    const wrapper = zoom?.instance.wrapperComponent;
    if (!(zoom && wrapper)) return;
    const board = props.job.boards.find(
      (candidate) => candidate.name === framedBoard,
    );
    const rect: Rect = board
      ? { h: board.h, w: board.w, x: board.x - bounds.x, y: board.y - bounds.y }
      : { ...bounds, x: 0, y: 0 };
    const view = frameRect(rect, {
      h: wrapper.clientHeight,
      w: wrapper.clientWidth,
    });
    zoom.setTransform(view.x, view.y, view.scale, 420, 'easeOut');
  };
  const frameRef = useRef(frameNow);
  frameRef.current = frameNow;
  // biome-ignore lint/correctness/useExhaustiveDependencies: frameKey is the trigger; the frame reads the latest props through the ref
  useEffect(() => {
    frameRef.current();
  }, [frameKey]);

  // the library's wheel zoom adds to the scale (one notch could jump from 0.5 to the floor); this one multiplies
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!wrapper) return;
    const handleWheel = (event: WheelEvent) => {
      const zoom = zoomRef.current;
      if (!zoom) return;
      event.preventDefault();
      const box = wrapper.getBoundingClientRect();
      const { positionX, positionY, scale } = zoom.instance.state;
      const view = wheelView(
        { scale, x: positionX, y: positionY },
        {
          ctrlKey: event.ctrlKey,
          deltaMode: event.deltaMode,
          deltaX: event.deltaX,
          deltaY: event.deltaY,
          metaKey: event.metaKey,
          pointX: event.clientX - box.left,
          pointY: event.clientY - box.top,
        },
      );
      zoom.setTransform(view.x, view.y, view.scale, 0);
    };
    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', handleWheel);
  }, [wrapper]);

  useEffect(() => {
    const handleReframe = () => frameRef.current();
    window.addEventListener(REFRAME_EVENT, handleReframe);
    return () => window.removeEventListener(REFRAME_EVENT, handleReframe);
  }, []);

  useEffect(() => {
    if (!liveBoard) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLiveBoard(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [liveBoard]);

  const boardListJSX = props.job.boards.map((board) => {
    const pinId =
      activeAsk && !activeAsk.isMoved && activeAsk.board === board.file
        ? activeAsk.id
        : undefined;
    return (
      <Board
        board={board}
        isLive={liveBoard === board.name}
        key={board.file}
        left={board.x - bounds.x}
        onLive={setLiveBoard}
        pinId={pinId}
        top={board.y - bounds.y}
      />
    );
  });

  const miniListJSX = props.job.boards.map((board) => {
    const isFramed = board.name === framedBoard;
    return (
      <div
        className={
          isFramed ? 'absolute bg-loupe' : 'absolute bg-muted-foreground/45'
        }
        key={board.file}
        style={{
          height: board.h,
          left: board.x - bounds.x,
          top: board.y - bounds.y,
          width: board.w,
        }}
      />
    );
  });

  return (
    <TransformWrapper
      doubleClick={{ disabled: true }}
      limitToBounds={false}
      maxScale={MAX_SCALE}
      minScale={MIN_SCALE}
      onInit={(ref) => {
        setWrapper(ref.instance.wrapperComponent);
        frameRef.current();
      }}
      onTransform={(_ref, state) => {
        contentRef.current?.style.setProperty('--zoom', String(state.scale));
      }}
      panning={{ excluded: ['loupe-board-live'] }}
      ref={zoomRef}
      wheel={{ disabled: true }}>
      <TransformComponent
        infinite
        wrapperClass='loupe-surface !h-full !w-full'
        wrapperProps={{
          'aria-label': `${props.job.title} — the boards`,
          // a press anywhere but on the live board, the desk past the boards included, ends it
          onPointerDown: (event) => {
            if (!(event.target as Element).closest('.loupe-board-live'))
              setLiveBoard(null);
          },
        }}>
        <div
          className='relative'
          ref={contentRef}
          style={{ height: bounds.h, width: bounds.w }}>
          {boardListJSX}
        </div>
      </TransformComponent>
      <div className='absolute bottom-4 left-4 overflow-hidden rounded-lg border bg-background/90 p-1.5 shadow-sm'>
        <MiniMap
          borderColor='var(--loupe)'
          height={120}
          width={Math.round(
            Math.min(200, Math.max(80, (120 * bounds.w) / bounds.h)),
          )}>
          <div
            className='relative'
            style={{ height: bounds.h, width: bounds.w }}>
            {miniListJSX}
          </div>
        </MiniMap>
      </div>
    </TransformWrapper>
  );
};

/* Types */

interface SurfaceProps {
  job: JobView;
  target: Target;
}
