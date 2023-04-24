/* Core */
import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

/* Components */
import { Pages } from './pages';

/* Instruments */
import { client } from './lib/apollo';
import { GlobalStyle } from './styles';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <Router>
            <ApolloProvider client = { client }>
                <Pages />
            </ApolloProvider>
        </Router>

        <GlobalStyle />
    </StrictMode>,
);
