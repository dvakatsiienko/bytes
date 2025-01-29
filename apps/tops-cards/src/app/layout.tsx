/* Core */
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Geist, Geist_Mono } from 'next/font/google';

/* Components */
import { Header } from './Header';
import { SigninButton } from './SigninButton';

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
        <SessionProvider>
            <html lang = 'en'>
                <body className = { `${ geistSans.variable } ${ geistMono.variable } antialiased` }>
                    <Header>
                        <SigninButton />
                    </Header>
                    {children}
                </body>
            </html>
        </SessionProvider>
    );
};

export const metadata: Metadata = { title: 'Tops cards' };

export default RootLayout;
