export const Button = (props: ButtonProps) => {
    const { type = 'button', text = 'Click', ...restProps } = props;

    return (
        <button type = { type } { ...restProps }>
            {text}
        </button>
    );
};

/* Types */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string,
}
