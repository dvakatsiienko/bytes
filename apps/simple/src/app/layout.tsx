/* Instruments */
import '../theme/globals.css';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <head>
                <title>Simple</title>
            </head>
            <body>{props.children}</body>
        </html>
    );
};
