import type { ReactNode } from 'react';
import { BookOpenIcon } from 'lucide-react';

import type { ReadmeWidth } from '../state.ts';

/** the content widths github gives a readme image: a phone page, and the desktop article column */
const widths = { desktop: 830, phone: 358 } as const;
const pads = { desktop: 24, phone: 16 } as const;
const BAR_HEIGHT = 32;

/** the height the frame adds around a piece: the bar (its rule inside), the padding and the two borders */
export const frameChromeHeight = (width: ReadmeWidth) =>
  width === 'fit' ? 0 : BAR_HEIGHT + pads[width] * 2 + 2;

/**
 * The piece as a readme shows it. `fit` is the bare piece at the bench's width;
 * `phone` and `desktop` wrap it in github's page chrome at the real content
 * width — or the bench's, when that is narrower — light by day and dark by
 * night, so a take is judged where it lands.
 */
export const ReadmeFrame = (props: ReadmeFrameProps) => {
  if (props.width === 'fit')
    return <div className='w-full'>{props.children}</div>;

  const width = widths[props.width];
  const pad = pads[props.width];
  return (
    <div
      className='mx-auto max-w-full overflow-hidden rounded-md border border-gh-line bg-gh'
      // github's column is fluid too: at most this wide, narrower on a narrower bench
      style={{ width: width + pad * 2 }}>
      <div
        className='flex items-center gap-2 border-gh-line border-b px-4 font-mono text-[12px] text-gh-muted'
        style={{ height: BAR_HEIGHT }}>
        <BookOpenIcon aria-hidden='true' className='size-3.5' />
        README.md
      </div>
      <div style={{ padding: pad }}>{props.children}</div>
    </div>
  );
};

/* Types */

interface ReadmeFrameProps {
  children: ReactNode;
  width: ReadmeWidth;
}
