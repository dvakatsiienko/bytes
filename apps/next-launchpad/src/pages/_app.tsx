/* Core */
import Head                                          from 'next/head';
import Router                                        from 'next/router';
import NProgress                                     from 'nprogress';
import { AppProps }                                  from 'next/app';
import { ApolloProvider }                            from '@apollo/client';
import { Provider as ReduxProvider }                 from 'react-redux';
import { ThemeProvider as StyledComponentsProvider } from 'styled-components';

/* Instruments */
import '@/theme/index.css';
import { useStore }  from '@/lib/redux';
import { useApollo } from '@/lib/apollo';

const App: React.FC<AppProps> = props => {
    const store = useStore(props.pageProps.initialReduxState);
    const apolloClient = useApollo(props.pageProps.initialApolloState);

    return (
        <ApolloProvider client = { apolloClient }>
            <ReduxProvider store = { store }>
                <StyledComponentsProvider theme = {{}}>
                    <Head>
                        <link href = '/favicon.ico' rel = 'icon' />
                        <title>Next Experimental</title>
                        <link
                            href = '/nprogress.css'
                            rel = 'stylesheet'
                            type = 'text/css'
                        />
                    </Head>
                    <props.Component { ...props.pageProps } />
                </StyledComponentsProvider>
            </ReduxProvider>
        </ApolloProvider>
    );
};

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default App;
