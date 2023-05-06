/* Core */
import type { UseFormRegisterReturn, FormState, FieldValues } from 'react-hook-form';
import { Input as NextUiInput, InputProps as NextUiInputProps } from '@nextui-org/react';
import styled, { css } from 'styled-components';
// import { Input as GeistInput, Dot } from '@geist-ui/core';
// import type { InputProps as GeistInputProps, InputPasswordProps, DotProps } from '@geist-ui/core';

export const Input = ({ type = 'text', autoFocus = false, ...props }: InputProps) => {
    const isInvalid = Boolean(props.formState.errors[ props.register.name ]?.message);

    const errorMessage =
    (props.formState.errors[ props.register.name ]?.message as unknown as string) ?? '';

    const BaseInput = type === 'password' ? NextUiInput.Password : NextUiInput;

    return (
        <Container>
            <BaseInput
                // bordered
                aria-label = { props.label ?? props.labelPlaceholder ?? props.labelLeft }
                autoFocus = { autoFocus }
                color = 'primary'
                helperColor = 'error' // ? prevent visual glitch of labelPlaceholder, due to input's value react-hook-form's register control
                helperText = { errorMessage }
                // initialValue = '_'
                label = { props.label }
                labelLeft = { props.labelLeft }
                labelPlaceholder = { props.labelPlaceholder }
                labelRight = { props.labelRight }
                placeholder = { props.placeholder }
                size = 'sm'
                status = { isInvalid ? 'error' : 'default' }
                type = { type }
                width = '100%'
                // type = { isInvalid ? 'error' : 'default' }
                { ...props.register }
            />
            {/* <ErrorMessage>{errorMessage}</ErrorMessage> */}
        </Container>
    );
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;

  &:not(:last-child) {
    margin-bottom: 7px;
  }
`;

const ErrorMessage = styled.span<{ children: React.ReactNode }>`
  display: inline-block;
  color: red;
  font-weight: 500;
  font-size: 14px;
  margin-top: 5px;

  & span {
    text-transform: initial !important;
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
