'use client';

import { useRef } from 'react';
import { type VariantProps, cva } from 'cva';
import useEventListener from '@use-it/event-listener';

import { cn } from '@/utils/cn';

function Textarea({ className, ...props }: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ref = props.ref ?? textareaRef;

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      ref.current?.focus();
    }
  });

  return (
    // TODO themed caret color
    <textarea
      autoFocus
      className={textareaCn({
        className: cn(
          'field-sizing-content flex min-h-16 w-full px-3 py-2',
          'rounded-md border border-border',
          'bg-transparent brand:bg-gradient-to-tr brand:from-gradient-input-primary-1 brand:to-gradient-input-primary-2 dark:bg-input/30',
          'text-base placeholder:text-muted-foreground md:text-sm',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'transition-[color,box-shadow]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // TODO make focus-visible less exposed
          // 'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
          className,
        ),
        depth: 'inner',
        intent: props.intent,
      })}
      data-slot='textarea'
      name={props.name ?? 'textarea'}
      onChange={props.onChange}
      onKeyDown={props.onKeyDown}
      placeholder={`⌘+K ${props.placeholder ?? 'Notes...'}`}
      ref={ref}
      value={props.value}
      {...props}
    />
  );
}

/* Styles */
const textareaCn = cva({
  base: [
    'w-full resize-none pb-10',
    'rounded-md',
    'text-base placeholder:text-muted-foreground md:text-sm',
  ],
  defaultVariants: {
    depth: 'inner',
    intent: 'primary',
  },
  variants: {
    depth: {
      inner: [
        /* Effect of «depth» */
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.05)]',
        'focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)]',

        'dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.1)]',
        'dark:focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]',
        /* Effect of «depth» */
      ],
    },
    intent: {
      primary: 'bg-input',
      unset: null,
    },
  },
});

/* Types */
interface TextareaProps extends React.ComponentProps<'textarea'>, TextareaCva {
  ref?: React.RefObject<HTMLTextAreaElement | null>;
}

type TextareaCva = VariantProps<typeof textareaCn>;

export { Textarea };
