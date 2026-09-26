import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { Toolbar, ToolbarButton } from '@ui/kit/components/toolbar';
import { cn } from 'cn';
import {
  LocateFixedIcon,
  ScanIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import type {
  ReactZoomPanPinchContentRef,
  ReactZoomPanPinchContextState,
} from 'react-zoom-pan-pinch';
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  useTransformComponent,
  useTransformInit,
} from 'react-zoom-pan-pinch';

import { useMediaQuery } from '../hooks.ts';
import {
  OVERSHOOT_PX,
  keepOverlap,
  pressStep,
  rangeOf,
  settleInView,
  snapScale,
  wheelTransform,
} from '../zoom.ts';

/** every zoom and pan animation; 0 when the os asks for reduced motion */
const MOTION_MS = 150;
/** the wheel resting this long ends a gesture: then the scale snaps and the art settles */
const REST_MS = 200;
/** air around a fitted image in the viewer: clear of the box edge, the toolbar and the badge */
const FIT_INSET = 60;
/** an arrow key pans this far; with ⇧, five times as far */
const ARROW_PX = 48;
const ARROW_SHIFT = 5;

/**
 * `viewer`: the zoom dialog — opens fitted, every scroll zooms.
 * `canvas`: the piece on the bench, zoomed in place — 1× is its laid-out
 * size; pinch or ⌘-scroll zooms, and a plain scroll is the page's until the
 * art is zoomed in, then it pans.
 */
const modes = {
  canvas: { isInline: true, plainScroll: 'pan' },
  viewer: { isInline: false, plainScroll: 'zoom' },
} as const satisfies Record<string, ZoomMode>;

/**
 * Pinch or ⌘-scroll zooms around the pointer, a drag pans and springs back
 * from the edges, a double-click toggles fit and a closer look; + − 0 1 and
 * the arrows once the box has focus. A floating toolbar and a scale badge.
 * Past one image pixel per screen pixel the art draws with hard pixels.
 */
export const ZoomBox = (props: ZoomBoxProps) => {
  const mode = modes[props.mode];
  const ms = useMediaQuery('(prefers-reduced-motion: reduce)') ? 0 : MOTION_MS;
  // booleans, so a transform frame only re-renders the box when one flips
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPixelated, setIsPixelated] = useState(false);
  const [range, setRange] = useState(rangeOf(1));

  return (
    <TransformWrapper
      autoAlignment={{
        animationTime: ms && 200,
        animationType: 'easeOutCubic',
        sizeX: OVERSHOOT_PX,
        sizeY: OVERSHOOT_PX,
        velocityAlignmentTime: ms && 300,
      }}
      centerOnInit={!mode.isInline}
      centerZoomedOut={false}
      doubleClick={{ disabled: true }}
      keyboard={{ disabled: false }}
      limitToBounds
      maxScale={range.max}
      minScale={range.min}
      onPanningStop={(ref) => settle({ mode, ms, zoom: ref }, false)}
      onTransform={(ref, state) => {
        setIsZoomed(state.scale > fitOf(ref, mode) + 0.001);
        setIsPixelated(state.scale > oneToOne(ref) + 0.001);
      }}
      panning={{ disabled: mode.isInline && !isZoomed }}
      velocityAnimation={{
        animationTime: 250,
        animationType: 'easeOutQuad',
        disabled: ms === 0,
        inertia: 0.6,
        maxAnimationTime: 400,
        maxStrengthMouse: 8,
        maxStrengthTouch: 12,
        sensitivityMouse: 0.4,
        sensitivityTouch: 0.5,
      }}
      wheel={{ disabled: true }}>
      {(controls) => {
        const context = { mode, ms, zoom: controls };
        const toolListJSX = [
          {
            icon: <ZoomInIcon />,
            label: 'zoom in',
            run: () => press(context, 1),
            title: 'zoom in (+)',
          },
          {
            icon: <ZoomOutIcon />,
            label: 'zoom out',
            run: () => press(context, -1),
            title: 'zoom out (−)',
          },
          {
            icon: <ScanIcon />,
            label: 'fit',
            run: () => fit(context),
            title: 'fit the whole image (1)',
          },
          {
            icon: <span className='font-mono text-[12px]'>1:1</span>,
            label: 'one to one',
            run: () => showOneToOne(context),
            title:
              'one image pixel per screen pixel, where you last pointed (0)',
          },
          {
            icon: <LocateFixedIcon />,
            label: 'center',
            run: () => controls.centerView(controls.instance.state.scale, ms),
            title: 'center the image, keep the scale',
          },
        ].map((tool) => {
          return (
            <ToolbarButton
              aria-label={tool.label}
              key={tool.label}
              onClick={tool.run}
              render={
                <Button
                  className='hover:bg-foreground/10'
                  size='icon-sm'
                  variant='ghost'
                />
              }
              title={tool.title}>
              {tool.icon}
            </ToolbarButton>
          );
        });
        // the canvas keeps its tools out of the art until it is zoomed, hovered or focused
        const quietClass = mode.isInline
          ? 'opacity-0 transition-opacity duration-150 group-hover/zoom:opacity-100 group-focus-within/zoom:opacity-100 group-data-[zoomed=true]/zoom:opacity-100'
          : '';

        return (
          <div
            className={cn(
              'group/zoom relative overflow-hidden',
              props.className,
            )}
            data-zoomed={isZoomed}>
            <ZoomBehaviour
              mode={mode}
              ms={ms}
              onFit={(scale) => setRange(rangeOf(scale))}
            />
            <Toolbar
              aria-label='zoom'
              className={cn(
                'absolute top-3 left-3 z-10 rounded-lg p-1',
                floatingClass,
                quietClass,
              )}>
              {toolListJSX}
            </Toolbar>
            <TransformComponent
              contentClass={cn(
                mode.isInline ? '!w-full' : '',
                isZoomed || !mode.isInline
                  ? 'cursor-grab active:cursor-grabbing'
                  : '',
              )}
              contentStyle={{
                imageRendering: isPixelated ? 'pixelated' : 'auto',
              }}
              wrapperClass={mode.isInline ? '!w-full' : '!h-full !w-full'}
              wrapperProps={{
                'aria-label':
                  'zoom box: pinch or ⌘-scroll, double-click, + − 0 1, arrows to pan',
                role: 'group',
              }}>
              {props.children}
            </TransformComponent>
            <ScaleBadge className={quietClass} />
          </div>
        );
      }}
    </TransformWrapper>
  );
};

/** the live scale; only this badge re-renders on every transform frame */
const ScaleBadge = (props: { className: string }) => {
  const scale = useTransformComponent(scaleOf);
  return (
    <output
      aria-label='scale'
      className={cn(
        'pointer-events-none absolute right-3 bottom-3 z-10 rounded-md px-2 py-1 font-mono text-[12px] tabular-nums',
        floatingClass,
        props.className,
      )}>
      {scale.toFixed(2)}×
    </output>
  );
};

/**
 * The box's own input, attached once the library has its elements and removed
 * with them: the wheel (the library's adds a step, ignores line and page
 * scrolls, and settles on a bound mid-gesture), keys, double-click, the last
 * pointer position, and safari's gesture events, which would zoom the page.
 */
const ZoomBehaviour = (props: ZoomBehaviourProps) => {
  const controls = useControls();
  // the listeners attach once; reduced motion may change while they live
  const ms = useRef(props.ms);
  ms.current = props.ms;
  useTransformInit(({ instance }) => {
    const wrapper = instance.wrapperComponent;
    const content = instance.contentComponent;
    if (!(wrapper && content)) return;
    const context: ZoomContext = {
      mode: props.mode,
      get ms() {
        return ms.current;
      },
      zoom: controls,
    };
    const lastPointer: { current: Point | null } = { current: null };
    const handleFit = () => {
      if (props.mode.isInline) return;
      props.onFit(fitOf(controls, props.mode));
      fit({ ...context, ms: 0 });
    };
    const handlePointerMove = (event: PointerEvent) => {
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };
    const wheel = handleWheel(context);
    const keys = handleKeys(context);
    const doubleClick = handleDoubleClick(context);
    wrapper.addEventListener('wheel', wheel, { passive: false });
    // ahead of the library's own key handler on the same box
    wrapper.addEventListener('keydown', keys, { capture: true });
    wrapper.addEventListener('dblclick', doubleClick);
    wrapper.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    wrapper.addEventListener('gesturestart', preventDefault);
    wrapper.addEventListener('gesturechange', preventDefault);
    // load does not bubble, but it does pass ancestors on the way down
    content.addEventListener('load', handleFit, { capture: true });
    // a resized window moves fit, and the range's floor with it
    const resize = new ResizeObserver(() => {
      if (!props.mode.isInline) props.onFit(fitOf(controls, props.mode));
    });
    resize.observe(wrapper);
    lastPointers.set(wrapper, lastPointer);
    handleFit();
    return () => {
      wrapper.removeEventListener('wheel', wheel);
      wrapper.removeEventListener('keydown', keys, { capture: true });
      wrapper.removeEventListener('dblclick', doubleClick);
      wrapper.removeEventListener('pointermove', handlePointerMove);
      wrapper.removeEventListener('gesturestart', preventDefault);
      wrapper.removeEventListener('gesturechange', preventDefault);
      content.removeEventListener('load', handleFit, { capture: true });
      resize.disconnect();
      lastPointers.delete(wrapper);
    };
  });
  return null;
};

/* Styles */

/** DESIGN.md «float»: raised over whatever it floats on — the white mat by day, the indigo mat or the night ground by night */
const floatingClass =
  'bg-popover shadow-float ring-1 ring-foreground/15 dark:bg-segment-on';

/* Helpers */

const scaleOf = (context: ReactZoomPanPinchContextState) => context.state.scale;

const preventDefault = (event: Event) => event.preventDefault();

/** the library's own cancel is not exported; these are the public fields it clears */
const stopAnimation = (zoom: Zoom) => {
  const { instance } = zoom;
  if (instance.animationFrame !== null)
    cancelAnimationFrame(instance.animationFrame);
  instance.animationFrame = null;
  instance.isAnimating = false;
  instance.animation = null;
};

/** where each box last saw the pointer over the art, for «1:1 where you pointed» */
const lastPointers = new WeakMap<HTMLElement, { current: Point | null }>();

/** fit is the laid-out size on the canvas; in the viewer, the whole image with air around it */
const fitOf = (zoom: Zoom, mode: ZoomMode) => {
  if (mode.isInline) return 1;
  const wrapper = zoom.instance.wrapperComponent;
  const image = zoom.instance.contentComponent?.querySelector('img');
  if (!(wrapper && image?.naturalWidth)) return 1;
  return Math.min(
    (wrapper.clientWidth - FIT_INSET * 2) / image.naturalWidth,
    (wrapper.clientHeight - FIT_INSET * 2) / image.naturalHeight,
  );
};

/** the scale at which one pixel of the art's image fills one screen pixel; a canvas or an svg draws at 1 */
const oneToOne = (zoom: Zoom) => {
  const image = zoom.instance.contentComponent?.querySelector('img');
  return image?.naturalWidth && image.offsetWidth
    ? image.naturalWidth / image.offsetWidth
    : 1;
};

const sizesOf = (zoom: Zoom) => {
  const wrapper = zoom.instance.wrapperComponent;
  const content = zoom.instance.contentComponent;
  if (!(wrapper && content)) return null;
  return [
    { height: wrapper.clientHeight, width: wrapper.clientWidth },
    // the laid-out size; the transform scales it
    { height: content.offsetHeight, width: content.offsetWidth },
  ] as const;
};

const fit = (context: ZoomContext) => {
  const scale = fitOf(context.zoom, context.mode);
  if (context.mode.isInline) context.zoom.setTransform(0, 0, scale, context.ms);
  else context.zoom.centerView(scale, context.ms);
};

const showOneToOne = (context: ZoomContext) => {
  const wrapper = context.zoom.instance.wrapperComponent;
  const pointer = wrapper ? lastPointers.get(wrapper)?.current : null;
  const scale = oneToOne(context.zoom);
  if (pointer)
    context.zoom.zoomToPoint(scale, pointer.x, pointer.y, context.ms);
  else context.zoom.centerView(scale, context.ms);
};

/** one zoom press around the view centre: in multiplies, out divides, by the same small factor */
const press = (context: ZoomContext, direction: 1 | -1) => {
  const { scale } = context.zoom.instance.state;
  const range = rangeOf(fitOf(context.zoom, context.mode));
  const step = pressStep(scale, direction, range);
  if (direction === 1) context.zoom.zoomIn(step, context.ms);
  else context.zoom.zoomOut(step, context.ms);
};

/**
 * Where the art rests after a gesture: covering the box when larger, centred
 * when it fits. After a zoom, a scale within 4 % of 1:1 or of fit lands on it,
 * around the point the gesture happened at.
 */
const settle = (context: ZoomContext, isZoom: boolean, at?: Point) => {
  const sizes = sizesOf(context.zoom);
  if (!sizes) return;
  const { positionX: x, positionY: y, scale } = context.zoom.instance.state;
  const [box] = sizes;
  const snapped = isZoom
    ? snapScale(scale, [
        oneToOne(context.zoom),
        fitOf(context.zoom, context.mode),
      ])
    : scale;
  const ratio = snapped / scale;
  const pointX = at?.x ?? box.width / 2;
  const pointY = at?.y ?? box.height / 2;
  const rested = settleInView(
    {
      scale: snapped,
      x: pointX - (pointX - x) * ratio,
      y: pointY - (pointY - y) * ratio,
    },
    ...sizes,
  );
  if (rested.scale !== scale || rested.x !== x || rested.y !== y)
    context.zoom.setTransform(rested.x, rested.y, rested.scale, context.ms);
};

const handleWheel = (context: ZoomContext) => {
  let rest: ReturnType<typeof setTimeout> | undefined;
  return (event: WheelEvent) => {
    const wrapper = context.zoom.instance.wrapperComponent;
    const sizes = sizesOf(context.zoom);
    if (!(wrapper && sizes)) return;
    const { positionX, positionY, scale } = context.zoom.instance.state;
    const fitScale = fitOf(context.zoom, context.mode);
    const isZoom =
      event.ctrlKey || event.metaKey || context.mode.plainScroll === 'zoom';
    // nothing to pan: the page keeps its scroll
    if (!isZoom && scale <= fitScale + 0.001) return;
    event.preventDefault();
    // a settle still easing would overwrite this step on its next frame
    stopAnimation(context.zoom);
    const box = wrapper.getBoundingClientRect();
    const point = { x: event.clientX - box.left, y: event.clientY - box.top };
    const next = wheelTransform(
      { scale, x: positionX, y: positionY },
      {
        ctrlKey: event.ctrlKey,
        deltaMode: event.deltaMode,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        metaKey: event.metaKey,
        pageHeight: wrapper.clientHeight,
        pointX: point.x,
        pointY: point.y,
      },
      rangeOf(fitScale),
      context.mode.plainScroll,
    );
    // mid-gesture: a zoom only keeps the art in sight, so the pointer holds; a pan may stretch past the edge
    const shown = isZoom
      ? keepOverlap(next, ...sizes)
      : settleInView(next, ...sizes, OVERSHOOT_PX);
    context.zoom.setTransform(shown.x, shown.y, shown.scale, 0);
    clearTimeout(rest);
    rest = setTimeout(() => settle(context, isZoom, point), REST_MS);
  };
};

/** + / = and − / _ press like the toolbar; 0 is 1:1, 1 is fit; the arrows pan, ⇧ five times as far */
const handleKeys = (context: ZoomContext) => (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const step = ARROW_PX * (event.shiftKey ? ARROW_SHIFT : 1);
  const pan = arrowPans[event.key];
  if (event.key === '+' || event.key === '=') press(context, 1);
  else if (event.key === '-' || event.key === '_') press(context, -1);
  else if (event.key === '0')
    context.zoom.centerView(oneToOne(context.zoom), context.ms);
  else if (event.key === '1') fit(context);
  else if (pan) {
    const sizes = sizesOf(context.zoom);
    if (!sizes) return;
    const { positionX, positionY, scale } = context.zoom.instance.state;
    const next = settleInView(
      { scale, x: positionX + pan.x * step, y: positionY + pan.y * step },
      ...sizes,
    );
    context.zoom.setTransform(next.x, next.y, scale, context.ms);
  } else return;
  event.preventDefault();
  event.stopImmediatePropagation();
};

/** an arrow moves the view, as a scroll would: left reveals what is left, so the art moves right */
const arrowPans: Partial<Record<string, Point>> = {
  ArrowDown: { x: 0, y: -1 },
  ArrowLeft: { x: 1, y: 0 },
  ArrowRight: { x: -1, y: 0 },
  ArrowUp: { x: 0, y: 1 },
};

/** a double-click toggles fit and a closer look — twice fit, or 1:1 if that is closer still — at the cursor */
const handleDoubleClick = (context: ZoomContext) => (event: MouseEvent) => {
  const { scale } = context.zoom.instance.state;
  const fitScale = fitOf(context.zoom, context.mode);
  if (Math.abs(scale / fitScale - 1) > 0.04) return fit(context);
  const closer = Math.min(
    rangeOf(fitScale).max,
    Math.max(fitScale * 2, oneToOne(context.zoom)),
  );
  context.zoom.zoomToPoint(closer, event.clientX, event.clientY, context.ms);
};

/* Types */

interface ZoomBoxProps {
  children: ReactNode;
  className?: string;
  mode: keyof typeof modes;
}

interface ZoomBehaviourProps {
  mode: ZoomMode;
  ms: number;
  /** the viewer's fit, once the image knows its size and on every resize: the range follows it */
  onFit: (scale: number) => void;
}

interface ZoomMode {
  isInline: boolean;
  plainScroll: 'pan' | 'zoom';
}

type Zoom = ReactZoomPanPinchContentRef;

interface ZoomContext {
  mode: ZoomMode;
  ms: number;
  zoom: Zoom;
}

interface Point {
  x: number;
  y: number;
}
