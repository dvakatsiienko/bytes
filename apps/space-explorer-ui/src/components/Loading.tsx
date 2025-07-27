import { size } from 'polished';
import styled, { css } from 'styled-components';

import { LogoSvg } from './SVG';
import { COLORS } from '@/styles';

const spin = css`
    to {
        transform: rotate(360deg);
    }
`;

export const Loading = styled(LogoSvg)(size(64), {
  display: 'block',
  fill: COLORS.grey,
  margin: 'auto',
  path: {
    animation: `${spin} 1s linear infinite`,
    transformOrigin: 'center',
  },
});
