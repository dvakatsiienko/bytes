/* Core */
// import { kv } from '@vercel/kv';

/* Components */
import { Providers } from '@/lib';

/* Instruments */
import { nextFonts } from '@/theme';
import '@/theme/global.scss';

export default async (props: React.PropsWithChildren) => {
    // const cart = await kv.get<{ id: string, quantity: number }[]>('test');

    // console.log('render');

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
