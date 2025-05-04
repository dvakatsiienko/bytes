/* Core */
import type { Metadata } from 'next';

import { Manrope } from 'next/font/google';

/* Components */
import { Browser } from '@/components/Browser/Browser';
import { ThemeProvider } from '@/components/ThemeProvider';

/* Instruments */
import '@/theme/init.css';

import { cx } from 'cva';

const fontManrope = Manrope({ subsets: ['latin'] });

export default (props: React.PropsWithChildren) => {
    return (
        <html
            suppressHydrationWarning
            className={cx(
                fontManrope.className,
                // 'bg-background',
                'bg-linear-to-tl from-gradient-layout-primary-1 to-gradient-layout-primary-2',
                'overflow-y-hidden print:overflow-visible',
            )}
            lang='en'>
            <body className='grid min-h-[100dvh]'>
                <ThemeProvider>
                    {/* TODO clean max-w at page level everywhere */}
                    <section className='mx-auto grid place-content-center px-4 md:px-8'>
                        <Browser>{props.children}</Browser>
                    </section>
                </ThemeProvider>
            </body>
        </html>
    );
};

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko',
    description: 'Dima Vakatsiienko CV, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
