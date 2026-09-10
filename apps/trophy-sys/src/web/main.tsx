import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { router } from './router.tsx';
import './theme.css';

// staleTime is well under the API's 60s memo so returning to the tab actually
// refetches; inside that window it answers from our own cache, never PSN.
// retry is deliberately low: the server cache stores successes only, so every
// retry replays the full PSN scan against a rate-limited API.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: true, retry: 1, staleTime: 10_000 },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
