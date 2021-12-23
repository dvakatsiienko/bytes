/* Core */
import type {
    UseFormRegisterReturn,
    FormState,
    FieldValues
} from 'react-hook-form';
import { Input as GeistInput, Dot } from '@geist-ui/react';
import type {
    InputProps as GeistInputProps,
    InputPasswordProps
} from '@geist-ui/react';
import styled, { css } from 'styled-components';

export const Input: React.FC<InputProps> = props => {
    const isInvalid = props.formState.errors[ props.register.name ]?.message;

    props.formState.isSubmitting;

    let dotType = 'default';
    isInvalid && (dotType = 'error');
    props.formState.isSubmitting && (dotType = 'warning');

    const InputComponent = props.type === 'password' ? (
        <S.PInput
            autoFocus = { props.autoFocus }
            htmlType = { props.type }
            // @ts-ignore
            label = { <Dot type = { dotType } /> }
            placeholder = { props.placeholder }
            type = { isInvalid ? 'error' : 'default' }
            width = '100%'
            { ...props.register }
        />
    ) : (
        <S.Input
            autoFocus = { props.autoFocus }
            htmlType = { props.type }
            // @ts-ignore
            label = { <Dot type = { dotType } /> }
            placeholder = { props.placeholder }
            type = { isInvalid ? 'error' : 'default' }
            width = '100%'
            { ...props.register }
        />
    );

    return (
        <S.Container>
            {InputComponent}
            <S.ErrorMessage>
                {props.formState.errors[ props.register.name ]?.message ?? (
                    <>&nbsp;</>
                )}
            </S.ErrorMessage>
        </S.Container>
    );
};
Input.defaultProps = {
    type: 'text',
};

/* Styles */
const style = css`
    &:not(:last-child) {
        margin-bottom: 3px;
    }

    & input {
        &:disabled {
            cursor: not-allowed;
            color: grey;
        }
    }
`;
const S = {
    Container: styled.div`
        display: flex;
        flex-direction: column;
        align-items: start;

        &:not(:last-child) {
            margin-bottom: 7px;
        }
    `,
    Input: styled(GeistInput)<GeistInputProps>`
        ${style}
    `,
    PInput: styled(GeistInput.Password)<InputPasswordProps>`
        ${style}
    `,
    ErrorMessage: styled.span`
        display: inline-block;
        color: red;
        font-weight: 500;
        font-size: 14px;
        margin-top: 5px;

        & span {
            text-transform: initial !important;
        }
    `,
};

/* Types */
interface InputProps {
    register: UseFormRegisterReturn;
    formState: FormState<FieldValues>;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    autoFocus?: boolean;
}
