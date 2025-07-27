
import { ThemeProvider as NextThemeProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemeProvider
            themes={['light', 'dark', 'system']}
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
            {...props}>
            {children}
        </NextThemeProvider>
    );
}
