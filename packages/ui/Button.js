/* Core */
import { oneOf } from 'prop-types';

export const Button = (props) => {
    // Click 🤌🏼
    return <button type = { props.type }>{props.text}</button>;
};

Button.defaultProps = { type: 'button' };
Button.propTypes = { type: oneOf([ 'button', 'submit', 'reset' ]) };
