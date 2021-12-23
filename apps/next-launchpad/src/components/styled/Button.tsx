/* Core */
import styled from 'styled-components';

export const Button = styled.button<ButtonProps>`
    padding: 8px;
    font-size: 24px;
    color: var(--color-2);
    cursor: pointer;
    background-color: transparent;
    border: 3px solid currentColor;
    border-radius: 3px;
    outline: none;
    transition: color 0.1s ease;

    &:hover {
        color: var(--color-4);
    }

    ${props => props.$isFetching
        && `
        cursor: not-allowed;
        color: grey;

        &:hover {
            color: grey;
        }
    `}
`;

interface ButtonProps {
    $isFetching?: boolean;
}
