
import styled, { css } from 'styled-components';
import { size } from 'polished';


import { LogoSvg } from './SVG';


import { COLORS } from '@/styles';

const spin = css`
    to {
        transform: rotate(360deg);
    }
`;

export const Loading = styled(LogoSvg)(size(64), {
    display: 'block',
    margin:  'auto',
    fill:    COLORS.grey,
    path:    {
        transformOrigin: 'center',
        animation:       `${ spin } 1s linear infinite`,
    },
});
