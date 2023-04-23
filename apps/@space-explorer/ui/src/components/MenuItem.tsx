/* Core */
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

/* Instruments */
import { COLORS, SPACING } from '@/styles';

export const menuItemClassName = css({
    cursor:        'pointer',
    flexGrow:      1,
    width:         0,
    fontFamily:    'inherit',
    fontSize:      20,
    color:         'inherit',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign:     'center',
    svg:           {
        display: 'block',
        width:   60,
        margin:  `0 auto ${SPACING}px`,
        fill:    COLORS.secondary,
    },
});

export const MenuItem = styled(Link)(
    {
        textDecoration: 'none',
    },
    menuItemClassName,
);
