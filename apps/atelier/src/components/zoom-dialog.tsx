import { useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { Dialog, DialogContent, DialogTitle } from '@ui/kit/components/dialog';
import { useAtom } from 'jotai';
import { MinusIcon, PlusIcon, ScanIcon } from 'lucide-react';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { zoomAtom } from '../state.ts';
import { MAX_SCALE, MIN_SCALE, wheelTransform } from '../zoom.ts';

/** a button press or a +/− key multiplies the scale by this; the library's steps are absolute, so they follow the scale */
const PRESS_FACTOR = 1.5;
const ANIMATION_MS = 160;
/** air around a fitted image, so it never sits flush on the box edge */
const FIT_INSET = 32;

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
              return (
                <>
                  <div className='flex items-center gap-1'>
                    <Button
                      aria-label='zoom out'
                      onClick={() =>
                        controls.zoomOut(
                          scale * (1 - 1 / PRESS_FACTOR),
                          ANIMATION_MS,
                        )
                      }
                      size='icon-sm'
                      title='zoom out (−)'
                      variant='outline'>
                      <MinusIcon />
                    </Button>
                    <Button
                      aria-label='zoom in'
                      onClick={() =>
                        controls.zoomIn(
                          scale * (PRESS_FACTOR - 1),
                          ANIMATION_MS,
                        )
                      }
                      size='icon-sm'
                      title='zoom in (+)'
                      variant='outline'>
                      <PlusIcon />
                    </Button>
                    <Button
                      onClick={() => fit(ANIMATION_MS)}
                      size='sm'
                      title='fit the whole image'
                      variant='outline'>
                      <ScanIcon /> fit
                    </Button>
                    <Button
                      onClick={() => controls.centerView(1, ANIMATION_MS)}
                      size='sm'
                      title='one image pixel per screen pixel'
                      variant='outline'>
                      1:1
                    </Button>
                    <span className='ml-2 font-mono text-[12px] text-muted-foreground tabular-nums'>
                      {Math.round(scale * 100)} %
                    </span>
                  </div>
                  <TransformComponent
                    contentClass='cursor-grab active:cursor-grabbing'
                    wrapperClass='min-h-0 flex-1 !w-full rounded-md bg-chip'>
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
                </>
              );
            }}
          </TransformWrapper>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
