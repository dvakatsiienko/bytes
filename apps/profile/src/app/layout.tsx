/* Components */
import { Providers } from '@/lib';

/* Instruments */
import '@/theme/global.scss';

export default (props: React.PropsWithChildren) => {
    return (
        <html lang = 'en'>
            <body>
                <Providers>
                    <main>{props.children}</main>
                </Providers>
            </body>
        </html>
    );
};

export const metadata = {
    title:       'Dima Vakatsiienko',
    description: 'My personal CV',
};
