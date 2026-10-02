import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { Loupe } from '@/components/loupe';
import { RootFallback } from '@/components/section';

import { devCrash } from '@/dev-crash.ts';

import '@/theme.css';

// kit themes by the .dark class; loupe follows the system, live
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () =>
  document.documentElement.classList.toggle('dark', darkQuery.matches);
applyTheme();
darkQuery.addEventListener('change', applyTheme);

const RootCrash = () => {
  devCrash('root');
  return null;
};

const rootNode = document.getElementById('root');
if (rootNode) {
  createRoot(rootNode, {
    onCaughtError: (error, info) =>
      console.error('loupe: a render failed', error, info.componentStack),
    onUncaughtError: (error, info) =>
      console.error(
        'loupe: a render failed outside every section',
        error,
        info.componentStack,
      ),
  }).render(
    <ErrorBoundary FallbackComponent={RootFallback}>
      <QueryClientProvider client={new QueryClient()}>
        <RootCrash />
        <Loupe />
      </QueryClientProvider>
    </ErrorBoundary>,
  );
}
