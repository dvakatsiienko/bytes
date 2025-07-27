'use client';

import * as React from 'react';
import type { VariantProps } from 'cva';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

import { toggleVariants } from '@/components/ui/toggle';

import { cn } from '@/utils/cn';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className,
      )}
      data-size={size}
      data-slot='toggle-group'
      data-variant={variant}
      {...props}>
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleVariants({
          className: cn(
            'min-w-0 flex-1 shrink-0',
            'rounded-none first:rounded-l-md last:rounded-r-md',
            'data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
            'shadow-none',
            'focus:z-10 focus-visible:z-10',
            className,
          ),
          size: context.size || size,
          variant: context.variant || variant,
        }),
      )}
      data-size={context.size || size}
      data-slot='toggle-group-item'
      data-variant={context.variant || variant}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
