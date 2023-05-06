/* Core */
import styled from 'styled-components';
import { lighten, darken } from 'polished';

/* Instruments */
import { SPACING, COLORS } from '@/styles';

const height = 50;

interface ButtonProps {
    $mini?: boolean,
}
export const Button = styled.button<ButtonProps>`
    display: block;
    min-width: ${ (props) => (props.$mini ? 175 : 200)}px;
    height: ${ (props) => (props.$mini ? height / 1.3 : height)}px;
    margin: 0 ${ (props) => (props.$mini ? '0 0 auto' : 'auto')};
    padding: 0 ${ (props) => (props.$mini ? SPACING : SPACING * 4)}px;
    border: none;
    border-radius: ${ height / 2 }px;
    font-family: inherit;
    font-size: 18px;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    background-color: ${ COLORS.accent };
    cursor: pointer;
    outline: none;
    transition: background-color 0.1s ease;

    &:hover {
        background-color: ${ lighten(0.1, COLORS.accent) };
    }
    &:active {
        background-color: ${ lighten(0.2, COLORS.accent) };
    }
    &::disabled {
        background-color: ${ darken(0.2, COLORS.accent) };
        cursor: not-allowed;
    }
`;
