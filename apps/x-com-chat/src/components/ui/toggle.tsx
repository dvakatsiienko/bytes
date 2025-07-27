'use client';

import { cva, type VariantProps } from 'cva';
import * as TogglePrimitive from '@radix-ui/react-toggle';

import { cn } from '@/utils/cn';

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ className, size, variant }))}
      data-slot='toggle'
      {...props}
    />
  );
}

/* Styles */
const toggleVariants = cva({
  base: cn(
    'inline-flex items-center justify-center gap-2 disabled:pointer-events-none disabled:opacity-50',
    'rounded-md outline-none focus-visible:border-ring aria-invalid:border-destructive',
    'focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
    'hover:bg-muted data-[state=on]:bg-accent',
    'whitespace-nowrap font-medium text-sm hover:text-muted-foreground',
    'data-[state=on]:text-accent-foreground',
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    'transition-[color,box-shadow]',
  ),
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  variants: {
    size: {
      default: 'h-9 min-w-9 px-2',
      lg: 'h-10 min-w-10 px-2.5',
      sm: 'h-8 min-w-8 px-1.5',
    },
    variant: {
      default: 'bg-transparent',
      outline: cn(
        'border border-input border-solid bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground',
        // custom
        'brand:hover:bg-input/90 brand:data-[state=on]:bg-input',
        'dark:brand:data-[state=on]:bg-background/40 dark:brand:hover:bg-background/40',
      ),
    },
  },
});

export { Toggle, toggleVariants };
