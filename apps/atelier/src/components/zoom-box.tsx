import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { cn } from 'cn';
import {
  LocateFixedIcon,
  ScanIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import type { Range } from '../zoom.ts';
import {
  MAX_SCALE,
  clampToBox,
  pressStep,
  viewerRange,
  wheelTransform,
} from '../zoom.ts';

const ANIMATION_MS = 160;
/** air around a fitted image in the viewer: clear of the box edge, the toolbar and the badge */
const FIT_INSET = 60;

/**
 * `viewer`: the zoom dialog — opens fitted, free to pan past the edges.
 * `canvas`: the piece on the bench — 1× is its laid-out size, it never zooms
 * out past that or pans past the art's edge, and a plain scroll is the page's
 * until it is zoomed in.
 */
const modes = {
  canvas: {
    fit: (zoom: ReactZoomPanPinchRef, animationMs: number) =>
      zoom.setTransform(0, 0, 1, animationMs),
    isBounded: true,
    range: { max: MAX_SCALE, min: 1 },
  },
  viewer: {
    fit: (zoom: ReactZoomPanPinchRef, animationMs: number) => {
      const wrapper = zoom.instance.wrapperComponent;
      const image = zoom.instance.contentComponent?.querySelector('img');
      if (wrapper && image?.naturalWidth)
        zoom.centerView(
          Math.min(
            (wrapper.clientWidth - FIT_INSET * 2) / image.naturalWidth,
            (wrapper.clientHeight - FIT_INSET * 2) / image.naturalHeight,
          ),
          animationMs,
        );
    },
    isBounded: false,
    range: viewerRange,
  },
} satisfies Record<string, ZoomMode>;

/**
 * Pinch or ⌘-scroll zooms around the pointer; a plain scroll or a drag pans;
 * + / − and 0 once the box has focus; a floating toolbar and a scale badge.
 * Past one image pixel per screen pixel the art draws with hard pixels.
 */
export const ZoomBox = (props: ZoomBoxProps) => {
  const mode = modes[props.mode];
  const [view, setView] = useState({ isPixelated: false, scale: 1 });
  const isZoomed = view.scale > mode.range.min + 0.001;

  return (
    <TransformWrapper
      centerOnInit={!mode.isBounded}
      doubleClick={{ disabled: true }}
      keyboard={{ disabled: false, panStep: 60 }}
      limitToBounds={mode.isBounded}
      maxScale={mode.range.max}
      minScale={mode.range.min}
      onInit={(ref) => {
        const wrapper = ref.instance.wrapperComponent;
        wrapper?.addEventListener('wheel', handleWheel(ref, mode), {
          passive: false,
        });
        // ahead of the library's own key handler on the same box: it would add one fixed step both ways
        wrapper?.addEventListener('keydown', handlePressKeys(ref, mode), {
          capture: true,
        });
        if (props.mode === 'viewer') {
          // load does not bubble, but it does pass ancestors on the way down
          ref.instance.contentComponent?.addEventListener(
            'load',
            () => mode.fit(ref, 0),
            { capture: true },
          );
          mode.fit(ref, 0);
        }
      }}
      onTransform={(ref, state) =>
        setView({
          isPixelated: state.scale > oneToOne(ref) + 0.001,
          scale: state.scale,
        })
      }
      panning={{ disabled: mode.isBounded && !isZoomed }}
      wheel={{ disabled: true }}>
      {(controls) => {
        const toolListJSX = [
          {
            icon: <ZoomInIcon />,
            label: 'zoom in',
            run: () => press(controls, mode, 1),
            title: 'zoom in (+)',
          },
          {
            icon: <ZoomOutIcon />,
            label: 'zoom out',
            run: () => press(controls, mode, -1),
            title: 'zoom out (−)',
          },
          {
            icon: <ScanIcon />,
            label: 'fit',
            run: () => mode.fit(controls, ANIMATION_MS),
            title: 'reset: fit the whole image (0)',
          },
          {
            icon: <span className='font-mono text-[12px]'>1:1</span>,
            label: 'one to one',
            run: () => controls.centerView(oneToOne(controls), ANIMATION_MS),
            title: 'one image pixel per screen pixel',
          },
          {
            icon: <LocateFixedIcon />,
            label: 'center',
            run: () => controls.centerView(view.scale, ANIMATION_MS),
            title: 'center the image, keep the scale',
          },
        ].map((tool) => {
          return (
            <Button
              aria-label={tool.label}
              className='hover:bg-foreground/10'
              key={tool.label}
              onClick={tool.run}
              size='icon-sm'
              title={tool.title}
              variant='ghost'>
              {tool.icon}
            </Button>
          );
        });
        // the canvas keeps its tools out of the art until it is zoomed, hovered or focused
        const quietClass = mode.isBounded
          ? 'opacity-0 transition-opacity duration-150 group-hover/zoom:opacity-100 group-focus-within/zoom:opacity-100 group-data-[zoomed=true]/zoom:opacity-100'
          : '';

        return (
          <div
            className={cn(
              'group/zoom relative overflow-hidden',
              props.className,
            )}
            data-zoomed={isZoomed}>
            <div
              aria-label='zoom'
              className={cn(
                'absolute top-3 left-3 z-10 flex items-center gap-0.5 rounded-lg p-1',
                floatingClass,
                quietClass,
              )}
              role='toolbar'>
              {toolListJSX}
            </div>
            <TransformComponent
              contentClass={cn(
                mode.isBounded ? '!w-full' : '',
                isZoomed || !mode.isBounded
                  ? 'cursor-grab active:cursor-grabbing'
                  : '',
              )}
              contentStyle={{
                imageRendering: view.isPixelated ? 'pixelated' : 'auto',
              }}
              wrapperClass={mode.isBounded ? '!w-full' : '!h-full !w-full'}
              wrapperProps={{
                'aria-label':
                  'zoom box: pinch or ⌘-scroll, + and −, arrows to pan',
                role: 'group',
              }}>
              {props.children}
            </TransformComponent>
            <output
              aria-label='scale'
              className={cn(
                'pointer-events-none absolute right-3 bottom-3 z-10 rounded-md px-2 py-1 font-mono text-[12px] tabular-nums',
                floatingClass,
                quietClass,
              )}>
              {view.scale.toFixed(2)}×
            </output>
          </div>
        );
      }}
    </TransformWrapper>
  );
};

/* Styles */

/** DESIGN.md «float»: raised over whatever it floats on — the white mat by day, the indigo mat or the night ground by night */
const floatingClass =
  'bg-popover shadow-float ring-1 ring-foreground/15 dark:bg-segment-on';

/* Helpers */

/** the scale at which one pixel of the art's image fills one screen pixel; a canvas or an svg draws at 1 */
const oneToOne = (zoom: ReactZoomPanPinchRef) => {
  const image = zoom.instance.contentComponent?.querySelector('img');
  return image?.naturalWidth && image.offsetWidth
    ? image.naturalWidth / image.offsetWidth
    : 1;
};

/**
 * The library's own wheel zoom adds a step to the scale and settles on a bound
 * after each gesture: a pinch sank to 55 % and stayed there. The wheel is ours
 * instead; the library keeps drag, the arrows and the animated buttons.
 */
const handleWheel =
  (zoom: ReactZoomPanPinchRef, mode: ZoomMode) => (event: WheelEvent) => {
    const wrapper = zoom.instance.wrapperComponent;
    if (!wrapper) return;
    const { positionX, positionY, scale } = zoom.instance.state;
    const isZoomGesture = event.ctrlKey || event.metaKey;
    // an unzoomed canvas leaves a plain scroll to the page
    if (mode.isBounded && !isZoomGesture && scale <= mode.range.min + 0.001)
      return;
    event.preventDefault();
    const box = wrapper.getBoundingClientRect();
    const next = wheelTransform(
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
      mode.range,
    );
    const shown = mode.isBounded
      ? clampToBox(next, {
          height: wrapper.clientHeight,
          width: wrapper.clientWidth,
        })
      : next;
    zoom.setTransform(shown.x, shown.y, shown.scale, 0);
  };

/** one zoom press around the box centre: in multiplies, out divides, by the same factor */
const press = (
  zoom: ReactZoomPanPinchRef,
  mode: ZoomMode,
  direction: 1 | -1,
) => {
  const step = pressStep(zoom.instance.state.scale, direction, mode.range);
  if (direction === 1) zoom.zoomIn(step, ANIMATION_MS);
  else zoom.zoomOut(step, ANIMATION_MS);
};

/** + / = and − / _ press like the toolbar; 0 fits, like the fit tool */
const handlePressKeys =
  (zoom: ReactZoomPanPinchRef, mode: ZoomMode) => (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === '+' || event.key === '=') press(zoom, mode, 1);
    else if (event.key === '-' || event.key === '_') press(zoom, mode, -1);
    else if (event.key === '0') mode.fit(zoom, ANIMATION_MS);
    else return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

/* Types */

interface ZoomBoxProps {
  children: ReactNode;
  className?: string;
  mode: keyof typeof modes;
}

interface ZoomMode {
  fit: (zoom: ReactZoomPanPinchRef, animationMs: number) => void;
  isBounded: boolean;
  range: Range;
}
