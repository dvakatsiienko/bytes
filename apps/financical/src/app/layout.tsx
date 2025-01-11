/* Instruments */
import { inter } from '@/ui/fonts';
import '@/ui/global.css';

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <title>Financical</title>
            <body className = { `${ inter.className } antialiased` }>{props.children}</body>
        </html>
    );
};
