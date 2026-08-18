import { createRoot } from 'react-dom/client';

import { Frame } from '@/frame/frame';

import '@/frame/theme.css';

const rootNode = document.getElementById('root');

if (rootNode) {
  createRoot(rootNode).render(<Frame />);
}
