/* Instruments */
import '@/theme/global.scss';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <body>
                <main>{props.children}</main>
            </body>
        </html>
    );
};

export const metadata = {
    title:       'Dima Vakatsiienko',
    description: 'My personal CV',
};
