/* Components */
import { Providers } from '@/lib';

/* Instruments */
import { getVisits } from '@/api';
import { nextFonts } from '@/theme';
import '@/theme/global.scss';

export default async (props: React.PropsWithChildren) => {
    const visits = await getVisits();

    return (
        <html className = { nextFonts.manropeVRFont.className } lang = 'en'>
            <body>
                <Providers>
                    <p>Visits ALL: {visits?.visitsAll}</p>
                    <br />
                    <p>Visits UNIQUE: {visits?.visitsUnique}</p>
                    <br />
                    <p>IP: {visits?.ip}</p>

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
