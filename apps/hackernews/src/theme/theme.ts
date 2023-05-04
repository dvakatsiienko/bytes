/* Core */
import { createTheme, type Theme } from '@nextui-org/react';

const theme: Theme['theme'] = {
    fonts: {
        sans: 'Manrope, system-ui, sans-serif',
        mono: 'Roboto Flex, system-ui, sans-serif',
    },
};

const lightBase: Theme = {
    type: 'light',
    theme,
};

const darkBase: Theme = {
    type: 'dark',
    theme,
};

const lightTheme = createTheme(lightBase);
const darkTheme = createTheme(darkBase);

export { lightTheme, darkTheme };
