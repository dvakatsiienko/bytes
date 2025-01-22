/* Core */
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: [ 'latin' ]});

/* Instruments */
import '../theme/globals.css';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <head>
                <title>Simple</title>
            </head>
            <body className = { inter.className }>{props.children}</body>
        </html>
    );
};
