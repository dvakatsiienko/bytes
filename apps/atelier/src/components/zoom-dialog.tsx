import { useRef, useState } from 'react';
import { Button } from '@ui/kit/components/button';
import { Dialog, DialogContent, DialogTitle } from '@ui/kit/components/dialog';
import { useAtom } from 'jotai';
import { MinusIcon, PlusIcon, ScanIcon } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { zoomAtom } from '../state.ts';

/**
 * The library ADDS `step × deltaY` to the scale per wheel event. A mouse tick
 * is ~100 of deltaY, so a fixed step either crawls at 8× or leaps at 0.3×.
 * Scaling the step by the current scale makes every tick the same +15 %.
 */
const WHEEL_GROWTH_PER_DELTA = 0.0015;
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

/**
 * Pixel inspection: opens fitted, wheel or pinch to zoom, drag to pan, +/−
 * and the arrows once the image has focus. Past 100 % the image draws with
 * hard pixels, so what you see is what the file holds.
 */
export const ZoomDialog = () => {
  const [zoom, setZoom] = useAtom(zoomAtom);
  const [scale, setScale] = useState(1);
  const image = useRef<HTMLImageElement>(null);

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
            maxScale={16}
            minScale={0.1}
            onTransform={(_ref, state) => setScale(state.scale)}
            smooth
            wheel={{ step: WHEEL_GROWTH_PER_DELTA * scale }}>
            {(controls) => {
              const fit = (animationMs: number) => {
                const wrapper = controls.instance.wrapperComponent;
                if (wrapper && image.current?.naturalWidth) {
                  controls.centerView(
                    fitScale(wrapper, image.current),
                    animationMs,
                  );
                }
              };
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
                    <img
                      alt={zoom.alt}
                      className='max-w-none select-none'
                      draggable={false}
                      ref={(node) => {
                        image.current = node;
                        // fit once the image knows its size
                        if (node?.complete) fit(0);
                        else
                          node?.addEventListener('load', () => fit(0), {
                            once: true,
                          });
                      }}
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
