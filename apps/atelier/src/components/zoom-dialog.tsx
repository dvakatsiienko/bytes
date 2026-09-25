import { useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { Dialog, DialogContent, DialogTitle } from '@ui/kit/components/dialog';
import { useAtom } from 'jotai';
import {
  LocateFixedIcon,
  ScanIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { zoomAtom } from '../state.ts';
import { MAX_SCALE, MIN_SCALE, wheelTransform } from '../zoom.ts';

/** a button press or a +/− key multiplies the scale by this; the library's steps are absolute, so they follow the scale */
const PRESS_FACTOR = 1.5;
const ANIMATION_MS = 160;
/** air around a fitted image: clear of the box edge, the floating toolbar and the scale badge */
const FIT_INSET = 60;

const fitScale = (wrapper: HTMLElement, image: HTMLImageElement) =>
  Math.min(
    (wrapper.clientWidth - FIT_INSET * 2) / image.naturalWidth,
    (wrapper.clientHeight - FIT_INSET * 2) / image.naturalHeight,
  );

/** the whole image in the box; runs on both the library's init and the image's load, whichever comes last */
const fitView = (zoom: ReactZoomPanPinchRef, animationMs: number) => {
  const wrapper = zoom.instance.wrapperComponent;
  const image = zoom.instance.contentComponent?.querySelector('img');
  if (wrapper && image?.naturalWidth)
    zoom.centerView(fitScale(wrapper, image), animationMs);
};

/**
 * The library's own wheel zoom adds a step to the scale and settles on a bound
 * after each gesture: a pinch sank to 55 % and stayed there. The wheel is ours
 * instead; the library keeps drag, keys and the animated buttons.
 */
const handleWheel = (zoom: ReactZoomPanPinchRef) => (event: WheelEvent) => {
  const wrapper = zoom.instance.wrapperComponent;
  if (!wrapper) return;
  event.preventDefault();
  const box = wrapper.getBoundingClientRect();
  const { positionX, positionY, scale } = zoom.instance.state;
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
  );
  zoom.setTransform(next.x, next.y, next.scale, 0);
};

/**
 * Pixel inspection: opens fitted; pinch or ⌘-scroll zooms around the pointer,
 * a plain scroll or a drag pans, +/− and the arrows once the image has focus.
 * Past 100 % the image draws with hard pixels, so what you see is what the
 * file holds.
 */
export const ZoomDialog = () => {
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [scale, setScale] = useState(1);

  return (
    <Dialog
      onOpenChange={(open) => (open ? undefined : setZoom(null))}
      open={zoom !== null}>
      <DialogContent className='flex h-[90dvh] w-[94vw] max-w-none flex-col gap-3 p-3 sm:max-w-none'>
        <DialogTitle className='truncate pr-8 font-normal text-sm'>
          {zoom?.alt}
        </DialogTitle>
        {zoom ? (
          <TransformWrapper
            centerOnInit
            doubleClick={{ disabled: true }}
            keyboard={{
              disabled: false,
              panStep: 60,
              zoomStep: scale * (PRESS_FACTOR - 1),
            }}
            limitToBounds={false}
            maxScale={MAX_SCALE}
            minScale={MIN_SCALE}
            onInit={(ref) => {
              ref.instance.wrapperComponent?.addEventListener(
                'wheel',
                handleWheel(ref),
                { passive: false },
              );
              fitView(ref, 0);
            }}
            onTransform={(_ref, state) => setScale(state.scale)}
            wheel={{ disabled: true }}>
            {(controls) => {
              const fit = (animationMs: number) =>
                fitView(controls, animationMs);
              const toolListJSX = [
                {
                  icon: <ZoomInIcon />,
                  label: 'zoom in',
                  run: () =>
                    controls.zoomIn(scale * (PRESS_FACTOR - 1), ANIMATION_MS),
                  title: 'zoom in (+)',
                },
                {
                  icon: <ZoomOutIcon />,
                  label: 'zoom out',
                  run: () =>
                    controls.zoomOut(
                      scale * (1 - 1 / PRESS_FACTOR),
                      ANIMATION_MS,
                    ),
                  title: 'zoom out (−)',
                },
                {
                  icon: <ScanIcon />,
                  label: 'fit',
                  run: () => fit(ANIMATION_MS),
                  title: 'reset: fit the whole image',
                },
                {
                  icon: <span className='font-mono text-[12px]'>1:1</span>,
                  label: 'one to one',
                  run: () => controls.centerView(1, ANIMATION_MS),
                  title: 'one image pixel per screen pixel',
                },
                {
                  icon: <LocateFixedIcon />,
                  label: 'center',
                  run: () => controls.centerView(scale, ANIMATION_MS),
                  title: 'center the image, keep the scale',
                },
              ].map((tool) => {
                return (
                  <Button
                    aria-label={tool.label}
                    key={tool.label}
                    onClick={tool.run}
                    size='icon-sm'
                    title={tool.title}
                    variant='ghost'>
                    {tool.icon}
                  </Button>
                );
              });
              return (
                <div className='relative min-h-0 flex-1 overflow-hidden rounded-lg border border-foreground/15 bg-chip dark:bg-background'>
                  <div
                    aria-label='zoom'
                    className='absolute top-3 left-3 z-10 flex items-center gap-0.5 rounded-lg bg-popover p-1 shadow-float'
                    role='toolbar'>
                    {toolListJSX}
                  </div>
                  <TransformComponent
                    contentClass='cursor-grab active:cursor-grabbing'
                    wrapperClass='!h-full !w-full'>
                    {/* biome-ignore lint/correctness/useImageSize: any image can be zoomed; it draws at its own natural size on purpose */}
                    {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is the fit signal, not an interaction */}
                    <img
                      alt={zoom.alt}
                      className='max-w-none select-none'
                      draggable={false}
                      onLoad={() => fit(0)}
                      src={zoom.src}
                      style={{
                        imageRendering: scale > 1 ? 'pixelated' : 'auto',
                      }}
                    />
                  </TransformComponent>
                  <output
                    aria-label='scale'
                    className='pointer-events-none absolute right-3 bottom-3 z-10 rounded-md bg-popover px-2 py-1 font-mono text-[12px] tabular-nums shadow-float'>
                    {scale.toFixed(2)}×
                  </output>
                </div>
              );
            }}
          </TransformWrapper>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
