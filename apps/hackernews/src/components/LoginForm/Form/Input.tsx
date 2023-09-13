/* Core */
import { Input as NextUiInput } from '@nextui-org/react';
import styled from 'styled-components';
import type { UseFormRegisterReturn, FormState, FieldValues } from 'react-hook-form';

export const Input = ({ type = 'text', autoFocus = false, ...props }: InputProps) => {
    // const isInvalid = Boolean(props.formState.errors[ props.register.name ]?.message);

    // const errorMessage =
    //     (props.formState.errors[ props.register.name ]?.message as unknown as string) ?? '';

    return (
        <Container>
            <NextUiInput
                aria-label = { props.label ?? props.labelPlaceholder ?? props.labelLeft }
                autoFocus = { autoFocus }
                color = 'primary'
                label = { props.label }
                placeholder = { props.placeholder }
                size = 'sm'
                type = { type }
                width = '100%'
                { ...props.register }
            />
            {/* <ErrorMessage>{errorMessage}</ErrorMessage> */}
        </Container>
    );
};

/* Styles */
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;

    &:not(:last-child) {
        margin-bottom: 7px;
    }
`;

/* Types */
interface InputProps {
    register:          UseFormRegisterReturn,
    formState:         FormState<FieldValues>,
    type?:             React.HTMLInputTypeAttribute,
    placeholder?:      string,
    autoFocus?:        boolean,
    label?:            string,
    labelPlaceholder?: string,
    labelLeft?:        string,
    labelRight?:       string,
}
