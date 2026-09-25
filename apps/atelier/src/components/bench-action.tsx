import type { ComponentProps } from 'react';
import { Button } from '@ui/kit/components/button';
import { cn } from 'cn';

/**
 * DESIGN.md «bench action», the one tactile control: the region's single
 * accent button, a 2px darker edge under it like a key, which collapses as the
 * button presses down 2px.
 */
export const BenchAction = (props: ComponentProps<typeof Button>) => {
  return (
    <Button
      {...props}
      className={cn(
        'h-8 rounded-md bg-lamp px-3 font-semibold text-lamp-ink shadow-[0_2px_0_var(--lamp-edge)] transition-[transform,box-shadow,filter] duration-80 ease-out hover:bg-lamp hover:brightness-105 active:not-aria-[haspopup]:translate-y-[2px] active:shadow-[0_0_0_var(--lamp-edge)] disabled:opacity-60',
        props.className,
      )}
    />
  );
};
