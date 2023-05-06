export const Button = (props: ButtonProps) => {
    props.text ||= 'Click';
    props.type ||= 'button';

    return <button type = { props.type }>{props.text}</button>;
};

/* Types */
interface ButtonProps {
    text:      string,
    type?:     React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    isChecked: boolean,
}
