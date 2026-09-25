import type { ReactNode } from 'react';
import { BookOpenIcon } from 'lucide-react';

import type { ReadmeWidth } from '../state.ts';

/** the content widths github gives a readme image: a phone page, and the desktop article column */
const widths = { desktop: 830, phone: 358 } as const;

/**
 * The piece as a readme shows it. `fit` is the bare piece at the bench's width;
 * `phone` and `desktop` wrap it in github's page chrome at the real content
 * width, light by day and dark by night, so a take is judged where it lands.
 */
export const ReadmeFrame = (props: ReadmeFrameProps) => {
  if (props.width === 'fit')
    return <div className='w-full'>{props.children}</div>;

  const width = widths[props.width];
  const pad = props.width === 'phone' ? 16 : 24;
  return (
    <div
      className='mx-auto overflow-hidden rounded-md border border-gh-line bg-gh'
      style={{ width: width + pad * 2 }}>
      <div className='flex items-center gap-2 border-gh-line border-b px-4 py-2 font-mono text-[12px] text-gh-muted'>
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
