'use client';

/* Core */
import { ThemeProvider } from 'next-themes';

export const Providers = (props: React.PropsWithChildren) => {
    return <ThemeProvider>{props.children}</ThemeProvider>;
};
