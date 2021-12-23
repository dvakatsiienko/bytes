/* Components */
import { Form as StyledForm } from '@/styled-components';
import { ErrorMessage }       from '@/components';

export const Form: React.FC<FormProps> = props => {
    return (
        <StyledForm onSubmit = { props.onSubmit }>
            <h2>{props.title}</h2>

            <ErrorMessage error = { props.networkError } />

            <fieldset aria-busy = { props.isLoading } disabled = { props.isLoading }>
                {props.children}
            </fieldset>
        </StyledForm>
    );
};
Form.defaultProps = {
    noValidate: true,
};

/* Types */
type HTMLFormProps = React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
>;

interface FormProps extends HTMLFormProps {
    title: string;
    isLoading: boolean;
    networkError: unknown;
}
