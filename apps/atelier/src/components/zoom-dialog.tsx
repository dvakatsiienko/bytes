import { Dialog, DialogContent, DialogTitle } from '@ui/kit/components/dialog';
import { useAtom } from 'jotai';

import { zoomAtom } from '../state.ts';
import { ZoomBox } from './zoom-box';

/** pixel inspection: the image in the zoom viewer, fitted when it opens */
export const ZoomDialog = () => {
  const [zoom, setZoom] = useAtom(zoomAtom);

  return (
    <Dialog
      onOpenChange={(open) => (open ? undefined : setZoom(null))}
      open={zoom !== null}>
      <DialogContent
        className='flex h-[90dvh] w-[94vw] max-w-none flex-col gap-3 p-3 sm:max-w-none'
        data-viewer>
        <DialogTitle
          className='truncate pr-8 font-normal text-sm'
          title={zoom?.alt}>
          {zoom?.alt}
        </DialogTitle>
        {zoom ? (
          <ZoomBox
            className='min-h-0 flex-1 rounded-lg border border-foreground/15 bg-chip dark:bg-background'
            mode='viewer'>
            {/* biome-ignore lint/correctness/useImageSize: any image can be zoomed; it draws at its own natural size on purpose */}
            <img
              alt={zoom.alt}
              className='max-w-none select-none'
              draggable={false}
              src={zoom.src}
            />
          </ZoomBox>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
