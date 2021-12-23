/* Core */
import { FieldError, RegisterOptions, UseFormRegister } from 'react-hook-form';

export const Input: React.FC<InputProps> = props => {
    const {
        text, register, error, ...rest
    } = props;

    const registerOptions: RegisterOptions = {
        setValueAs: value => {
            if (props.type === 'number') {
                const result = parseInt(value);

                return Number.isNaN(result) ? null : result;
            }
        },
    };

    if (props.type !== 'number') {
        delete registerOptions.setValueAs;
    }

    return (
        <label htmlFor = { props.name }>
            {text} <span className = 'error-message'>{error?.message}</span>
            <input
                placeholder = { props.placeholder }
                type = { props.type }
                { ...rest }
                { ...register(props.name, registerOptions) }
            />
        </label>
    );
};
Input.defaultProps = {
    type: 'text',
};

/* Types */
type HTMLInputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;

interface InputProps extends HTMLInputProps {
    register: UseFormRegister<Record<any, number>>;
    text: string;
    error?: FieldError;
}
