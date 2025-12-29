import { StrictMode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import { client } from './lib/apollo';
import { Pages } from './pages';
import './theme/init.css';

const rootEl = document.getElementById('root') as HTMLElement;

const App = (
  <StrictMode>
    <Router>
      <ApolloProvider client={client}>
        <Pages />
      </ApolloProvider>
    </Router>
  </StrictMode>
);

createRoot(rootEl).render(App);
