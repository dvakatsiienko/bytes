import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute='class'
      defaultTheme='dark'
      disableTransitionOnChange
      enableSystem
      themes={['light', 'dark', 'system']}
      {...props}>
      {children}
    </NextThemeProvider>
  );
}
