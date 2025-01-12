/* Core */
import { Metadata } from 'next';

/* Instruments */
import { inter } from '@/ui/fonts';
import '@/ui/global.css';

export const metadata: Metadata = {
    title: {
        template: 'Financical | %s',
        default:  'Financical',
    },
    description:  'A Next.js App Router app, buil with TypeScript, Prisma, and NextAuth.js',
    metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <body className = { `${ inter.className } antialiased` }>{props.children}</body>
        </html>
    );
};
