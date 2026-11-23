import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { SectionFallback } from '@/components/SectionFallback.tsx';

import { App } from '@/App.tsx';
import './theme.css';

const queryClient = new QueryClient({
  defaultOptions: {
    // the server is this mac's own: no network is no reason to hold a write back, and to send it later
    mutations: { networkMode: 'always' },
    queries: { networkMode: 'always', refetchOnWindowFocus: false, retry: 1 },
  },
});
const root = document.querySelector('#root');

if (!root) throw new Error('#root missing');

createRoot(root, {
  onUncaughtError: (error) => console.error('speak: uncaught', error),
}).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={SectionFallback}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
