export const Button = (props: ButtonProps) => {
    const { type = 'button', text = 'Click' } = props;

    return <button type = { type }>{text}</button>;
};

/* Types */
interface ButtonProps {
    text?: string,
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
}
