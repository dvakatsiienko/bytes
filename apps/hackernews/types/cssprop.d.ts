/* Core */
import type { CSSProp } from 'styled-components';
import type {} from 'styled-components/cssprop';

declare module 'react' {
    interface Attributes {
        css?: CSSProp<MyTheme>;
    }
}
