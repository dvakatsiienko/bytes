export const Button = (props: ButtonProps) => {
    return <button type = { props.type }>{props.text}</button>;
};
Button.defaultProps = { text: 'Click', type: 'button' };

/* Types */
interface ButtonProps {
    text:      string,
    type?:     React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    isChecked: boolean,
}
