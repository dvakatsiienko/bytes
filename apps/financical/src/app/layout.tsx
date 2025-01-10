/* Instruments */
import { inter } from '@/_ui/fonts';
import '@/ui/global.css';

// eslint-disable-next-line camelcase
export const experimental_ppr = true;

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <title>Financical</title>
            <body className = { `${ inter.className } antialiased` }>{props.children}</body>
        </html>
    );
};
