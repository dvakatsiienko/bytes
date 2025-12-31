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
const buttonCn = cva({
  base: 'grid h-12 min-w-52 cursor-pointer place-content-center rounded-md bg-accent font-bold text-lg text-white uppercase disabled:cursor-not-allowed',
  variants: {
    mini: {
      true: 'h-9 min-w-44',
    },
  },
});

/* Types */
interface ButtonProps extends React.PropsWithChildren, ButtonCnProps {
  disabled?: boolean;
  className?: string;
  type?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >['type'];
  onClick?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >['onClick'];
}

type ButtonCnProps = VariantProps<typeof buttonCn>;
