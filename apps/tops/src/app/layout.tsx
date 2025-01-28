/* Core */
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist, Geist_Mono } from 'next/font/google';

/* Instruments */
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets:  [ 'latin' ],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets:  [ 'latin' ],
});

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <html lang = 'en'>
            <body className = { `${ geistSans.variable } ${ geistMono.variable } antialiased` }>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
};

export const metadata: Metadata = { title: 'Tops' };

export default RootLayout;
