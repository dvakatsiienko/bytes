/* Core */
import router from 'next/router';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import nprogress from 'nprogress';

/* Instruments */
import '@/theme/global.css';

const _App = (
    props: AppProps & { apollo: ApolloClient<NormalizedCacheObject> },
) => {
    return (
        <>
            <Head>
                <title>Клевер</title>
            </Head>

            <props.Component { ...props.pageProps } />
        </>
    );
};

export default _App;

router.events.on('routeChangeStart', nprogress.start);
router.events.on('routeChangeComplete', nprogress.done);
router.events.on('routeChangeError', nprogress.done);
