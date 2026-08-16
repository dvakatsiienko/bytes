import cx from 'clsx';

export const Button = ({ children, className, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={cx(
        'flex h-10 items-center gap-2 bg-seal px-5 font-medium text-paper text-sm transition-colors hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal focus-visible:outline-offset-2 active:bg-ink aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        className,
      )}>
      {children}
    </button>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
