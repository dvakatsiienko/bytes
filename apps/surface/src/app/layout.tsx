/* Core */
import { Manrope, Geist_Mono } from 'next/font/google';
import { cx } from 'cva';
import type { Metadata } from 'next';

/* Instruments */
import '@/theme/init.css';

const fontManrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const fontGeistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export default (props: React.PropsWithChildren) => {
    return (
        <html
            suppressHydrationWarning
            className={cx(
                fontManrope.variable,
                fontGeistMono.variable,
                'font-manrope',
                'bg-linear-to-tl from-gradient-layout-primary-1 to-gradient-layout-primary-2',
                'overflow-y-hidden print:overflow-visible',
            )}
            lang='en'>
            <body className='min-h-[100dvh]'>{props.children}</body>
        </html>
    );
};

export const metadata: Metadata = {
    title: 'Dima Vakatsiienko',
    description: 'Dima Vakatsiienko CV, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
