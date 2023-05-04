/* Core */
import { useState, Fragment } from 'react';
import { oneOf } from 'prop-types';

export const Button: React.FC<ButtonProps> = (props) => {
    const [ isClicked, setIsClicked ] = useState(false);

    // Click 🤌🏼
    return <button type = { props.type }>{props.text}</button>;
};

Button.defaultProps = { type: 'button' };
Button.propTypes = { type: oneOf([ 'button', 'submit', 'reset' ]) };

/* Types */
interface ButtonProps {
    type?:     React.ButtonHTMLAttributes<HTMLButtonElement>['type'],
    text:      string,
    isChecked: boolean,
}
