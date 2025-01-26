/* Core */
import { Metadata } from 'next';

/* Components */
import { AppProviders } from './AppProviders';

/* Instruments */
import { inter } from '@/ui/fonts';
import '@/theme/global.css';

export const metadata: Metadata = {
    title: {
        template: 'Financical | %s',
        default:  'Financical',
    },
    description: 'A Next.js App Router app, buil with TypeScript, Prisma, and NextAuth.js',
    // metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <body className = { `${ inter.className } antialiased` }>
                <AppProviders>{props.children}</AppProviders>
            </body>
        </html>
    );
};
