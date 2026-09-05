import { type VariantProps, cva } from 'cva';

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={buttonCn({
        className: props.className,
        mini: props.mini,
      })}
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type ?? 'button'}>
      {props.children}
    </button>
  );
};

/* Styles */
/**
 * Sized by padding, not by a fixed height.
 *
 * 📌 `h-12` around `text-lg` left four pixels above and below the letters, and
 * the `mini` variant's `h-9` left almost none — which is what read as squat.
 * Padding gives the same button real room and keeps it right if the label ever
 * wraps or the type scale moves.
 *
 * 📌 The hover, active and disabled colours are `theme.css` tokens that were
 * written for this component — their comments say "for Button hover/active/
 * disabled" — and had never been wired up. A disabled button was identical to
 * a live one, which matters here: a tile disables itself the moment its trip is
 * booked.
 */
const buttonCn = cva({
  base: 'inline-grid min-w-56 cursor-pointer place-content-center rounded-lg bg-accent px-8 py-4 font-bold text-lg text-white uppercase tracking-wide transition-colors hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 active:bg-accent-lighter disabled:cursor-not-allowed disabled:bg-accent-dark',
  variants: {
    mini: {
      true: 'min-w-48 px-6 py-3 text-base',
    },
  },
});

/* Types */
interface ButtonProps extends React.PropsWithChildren, ButtonCnProps {
  className?: string;
  disabled?: boolean;
  onClick?: React.ComponentPropsWithoutRef<'button'>['onClick'];
  type?: React.ComponentPropsWithoutRef<'button'>['type'];
}

type ButtonCnProps = VariantProps<typeof buttonCn>;
