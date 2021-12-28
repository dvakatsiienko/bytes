/* Core */
import { ApolloProvider } from '@apollo/client';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import { AppProps } from 'next/app';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components';

/* Components */
import { Authenticator, Layout } from '@/components';

/* Instruments */
import '@/theme/index.scss';
import { useApollo } from '@/lib/apollo';

const App: React.FC<AppProps> = (props) => {
    const apolloClient = useApollo(props.pageProps.initialApolloState);

    return (
        <ApolloProvider client = { apolloClient }>
            <Authenticator>
                <GeistProvider>
                    <StyledComponentsProvider theme = {{}}>
                        <Head>
                            <link href = '/favicon.ico' rel = 'icon' />
                            <title>Hackernews</title>
                            <link href = '/nprogress.css' rel = 'stylesheet' type = 'text/css' />
                        </Head>
                        <CssBaseline />

                        <Layout>
                            <props.Component { ...props.pageProps } />
                        </Layout>
                    </StyledComponentsProvider>
                </GeistProvider>
            </Authenticator>
        </ApolloProvider>
    );
};

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default App;
