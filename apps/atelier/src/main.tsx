import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { BakeView } from '@/components/bake-view';
import { RootFallback } from '@/components/error-boundary';
import { Studio } from '@/components/studio';

import { trackModality } from '@/modality.ts';

import '@/theme.css';

trackModality();

const rootNode = document.getElementById('root');
const bakePiece = new URLSearchParams(location.search).get('bake');

if (rootNode) {
  // the stack goes to the console, where an agent reading the page looks; the fallbacks show the rest
  createRoot(rootNode, {
    onCaughtError: (error, info) =>
      console.error('atelier: a render failed', error, info.componentStack),
    onUncaughtError: (error, info) =>
      console.error(
        'atelier: a render failed outside every boundary',
        error,
        info.componentStack,
      ),
  }).render(
    bakePiece ? (
      <BakeView pieceId={bakePiece} />
    ) : (
      <ErrorBoundary FallbackComponent={RootFallback}>
        <QueryClientProvider client={new QueryClient()}>
          <Studio />
        </QueryClientProvider>
      </ErrorBoundary>
    ),
  );
}
