/* Core */
import { Metadata } from 'next';

/* Components */
import { AppProviders } from './AppProviders';

/* Instruments */
import { inter } from '@/theme/fonts';
import '@/theme/global.css';

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <body className = { `${ inter.className } antialiased` }>
                <AppProviders>{props.children}</AppProviders>
            </body>
        </html>
    );
};

export const metadata: Metadata = {
    title: {
        template: 'Financial | %s',
        default:  'Financial',
    },
    description: 'A Next.js App Router app, buil with TypeScript, Prisma, and NextAuth.js',
};
