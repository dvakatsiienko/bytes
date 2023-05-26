/* Components */
import { Providers } from '@/lib';

/* Instruments */
import { nextFonts } from '@/theme';
import '@/theme/global.scss';

export default async (props: React.PropsWithChildren) => {

    return (
        <html className = { nextFonts.manropeVRFont.className } lang = 'en'>
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
