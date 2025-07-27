
import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';


import { Pages } from './pages';


import { client } from './lib/apollo';
import { GlobalStyle } from './styles';

const rootEl = document.getElementById('root') as HTMLElement;

const App = (
    <StrictMode>
        <Router>
            <ApolloProvider client = { client }>
                <Pages />
            </ApolloProvider>
        </Router>

        <GlobalStyle />
    </StrictMode>
);

createRoot(rootEl).render(App);
