/* Core */
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

/* Instruments */
import { COLORS, SPACING } from '@/styles';

export const menuItemClassName = css`
    position: relative;
    cursor: pointer;
    flex-grow: 1;
    width: 0px;
    font-family: inherit;
    font-size: 20px;
    color: inherit;
    letter-spacing: 1.5;
    text-transform: uppercase;
    text-align: center;

    & svg {
        display: block;
        width: 60px;
        margin: 0 auto ${SPACING}px;
        fill: ${COLORS.secondary};
    }

    & .count {
        position: absolute;
        top: -10px;
        right: 20px;
        display: block;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background-color: ${COLORS.accent};
        color: white;
    }
`;

export const MenuItem = styled(Link)(
    {
        textDecoration: 'none',
    },
    menuItemClassName,
);
