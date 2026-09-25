import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

import { BakeView } from '@/components/bake-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { Studio } from '@/components/studio';

import '@/theme.css';

const rootNode = document.getElementById('root');
const bakePiece = new URLSearchParams(location.search).get('bake');

if (rootNode) {
  createRoot(rootNode).render(
    bakePiece ? (
      <BakeView pieceId={bakePiece} />
    ) : (
      <ErrorBoundary>
        <QueryClientProvider client={new QueryClient()}>
          <Studio />
        </QueryClientProvider>
      </ErrorBoundary>
    ),
  );
}
