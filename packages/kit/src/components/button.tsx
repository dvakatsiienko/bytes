import { cva, type VariantProps } from 'cva';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '../lib';

const Button: React.FC<ButtonProps> = (props) => {
  const { className, variant, size, asChild = false, ...restProps } = props;
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot='button'
      {...restProps}
    />
  );
};

/* Styles */
const buttonVariants = cva({
  base: cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    'cursor-pointer',
  ),
  defaultVariants: {
    size: 'default',
    variant: 'primary',
  },
  variants: {
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      icon: 'size-9',
      lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
    },
    variant: {
      destructive:
        'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
      ghost:
        'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      link: 'text-primary underline-offset-4 hover:underline',
      outline:
        'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      primary:
        'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
      secondary:
        'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
    },
  },
});

/* Types */
type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export { Button, buttonVariants };
