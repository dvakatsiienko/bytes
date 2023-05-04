/* Core */
import type { ThemeType } from '@nextui-org/react';
import type { CSSProp } from 'styled-components';
import type {} from 'styled-components/cssprop';

declare module 'react' {
    interface Attributes {
        css?: CSSProp<ThemeType>,
    }
}
