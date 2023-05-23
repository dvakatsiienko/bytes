/* Core */
import { nextFont } from 'fonts/next-fonts';

/* Components */
import { Providers } from '@/lib';

/* Instruments */
import '@/theme/global.scss';

export default (props: React.PropsWithChildren) => {
    return (
        <html className = { nextFont.manropeVRFont.className } lang = 'en'>
            <body>
                <Providers>
                    <main>{props.children}</main>
                </Providers>
            </body>
        </html>
    );
};

export const metadata = {
    title:       'Dima Vakatsiienko CV',
    description: 'Dima Vakatsiienko CV, Dima Vakatsiienko, Vakatsiienko Dmytro Viktorovytch',
};
