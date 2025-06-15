/* Core */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

/* Instruments */
import '@/theme/init.css';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang='en'>
            <head>
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
            </head>

            <body className={inter.className}>{props.children}</body>
        </html>
    );
};

export const metadata: Metadata = {
    title: 'Engineering and Design',
};
