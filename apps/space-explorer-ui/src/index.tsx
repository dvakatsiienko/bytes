import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { BuildBadge } from '@ui/kit/components/build-badge';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import { client } from './lib/apollo';
import { Pages } from './pages';
import './theme.css';

const rootEl = document.querySelector('#root');
if (!rootEl) throw new Error('#root missing');

const App = (
  <StrictMode>
    <Router>
      <ApolloProvider client={client}>
        <Pages />
      </ApolloProvider>
    </Router>
    <BuildBadge />
  </StrictMode>
);

createRoot(rootEl).render(App);
