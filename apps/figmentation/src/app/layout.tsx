/* Core */
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: [ 'latin' ]});

/* Instruments */
import '@/theme/init.css';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <head>
                <title>Engineering and Design</title>
                <link href = '/dist/styles.css' rel = 'stylesheet' />
            </head>
            <body className = { inter.className }>{props.children}</body>
        </html>
    );
};
