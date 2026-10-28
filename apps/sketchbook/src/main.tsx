import { BuildBadge } from '@ui/kit/components/build-badge';
import { createRoot } from 'react-dom/client';

import { Frame } from '@/frame/frame';

import '@/frame/theme.css';

const rootNode = document.querySelector('#root');

if (rootNode) {
  createRoot(rootNode).render(
    <>
      <Frame />
      <BuildBadge />
    </>,
  );
}
