import { type VariantProps, cva, cx } from 'cva';
import { cn } from '@ui/kit/lib/utils';

export function SectionHeading(props: SectionHeadingProps) {
  const { accentColor = 'sky', text, className, id } = props;

  return (
    <h3
      className={cx(
        'col-span-2 flex select-none items-center gap-x-1.5 font-geist-mono',
        className,
      )}
      id={id}>
      <b className={cn(accentCn({ accentColor }))} />
      {text}
    </h3>
  );
}

/* Styles */
const accentCn = cva({
  base: 'block h-1.5 w-3.5 rounded-full bg-link',
  variants: {
    accentColor: {
      cyan: 'bg-cyan-600',
      emerald: 'bg-emerald-600',
      lime: 'bg-lime-600',
      orange: 'bg-orange-600',
      purple: 'bg-purple-600',
      sky: 'bg-sky-600',
      violet: 'bg-violet-600',
    },
  },
});

/* Types */
type AccentCn = VariantProps<typeof accentCn>;

interface SectionHeadingProps extends AccentCn {
  id?: string;
  text: string;
  className?: string;
}
