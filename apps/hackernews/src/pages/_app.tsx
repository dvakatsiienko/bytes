/* Core */
import Head from 'next/head';
import * as reactQuery from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components';
import { Provider as ReduxProvider } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';
import type { AppType } from 'next/app';
import type { Session } from 'next-auth';

/* Components */
import { Layout } from '@/elements';

/* Instruments */
import { reduxStore, reactQueryClient } from '@/lib';
import { trpc } from '@/api/trpc';
import '@/theme/global.scss';

const App: AppType<{ session: Session | null }> = (props) => {
    return (
        <SessionProvider session = { props.pageProps.session }>
            <reactQuery.QueryClientProvider client = { reactQueryClient }>
                <NextUIProvider>
                    <StyledComponentsProvider theme = {{}}>
                        <ReduxProvider store = { reduxStore }>
                            <Head>
                                <link href = '/favicon.ico' rel = 'icon' />
                                <title>Hackernews</title>
                                <meta
                                    content = 'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, shrink-to-fit=no"'
                                    name = 'viewport'
                                />
                            </Head>

                            <Layout>
                                <props.Component { ...props.pageProps } />
                            </Layout>

                            <ReactQueryDevtools initialIsOpen = { false } />
                        </ReduxProvider>
                    </StyledComponentsProvider>
                </NextUIProvider>
            </reactQuery.QueryClientProvider>
        </SessionProvider>
    );
};

export default trpc.withTRPC(App);
