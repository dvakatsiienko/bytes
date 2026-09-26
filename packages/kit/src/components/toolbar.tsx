'use client';

import { Toolbar as ToolbarPrimitive } from '@base-ui/react/toolbar';
import { cn } from 'cn';

function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      className={cn('flex items-center gap-0.5', className)}
      data-slot='toolbar'
      {...props}
    />
  );
}

function ToolbarButton(props: ToolbarPrimitive.Button.Props) {
  return <ToolbarPrimitive.Button data-slot='toolbar-button' {...props} />;
}

export { Toolbar, ToolbarButton };
