/* Instruments */
import { inter } from '@/app/ui/fonts';
import '@/app/ui/global.css';

export default (props: { children: React.ReactNode }) => {
    return (
        <html lang = 'en'>
            <title>Financical</title>
            <body className = { `${ inter.className } antialiased` }>{props.children}</body>
        </html>
    );
};
