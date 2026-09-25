import type * as React from 'react';
import { cn } from 'cn';

/**
 * A colour well with its hex beside it, in mono so the value can be read and
 * copied. The native picker does the picking; the browser owns that UI.
 */
function ColorField({
  value,
  onValueChange,
  className,
  ...props
}: ColorFieldProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      data-slot='color-field'>
      <input
        className='size-7 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0'
        onChange={(event) => onValueChange(event.currentTarget.value)}
        type='color'
        value={value}
        {...props}
      />
      <span className='font-mono text-xs text-muted-foreground select-all'>
        {value}
      </span>
    </span>
  );
}

export { ColorField };

/* Types */

interface ColorFieldProps
  extends Omit<
    React.ComponentProps<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'type'
  > {
  onValueChange: (value: string) => void;
  /** `#rrggbb` */
  value: string;
}
