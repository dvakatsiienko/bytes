/* Core */
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: [ 'latin' ]});

/* Instruments */
import '../theme/global.css';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <head>
                <title>Simple</title>
                <link href = '/dist/styles.css' rel = 'stylesheet' />
            </head>
            <body className = { inter.className }>{props.children}</body>
        </html>
    );
};
