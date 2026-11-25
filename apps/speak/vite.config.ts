import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import { buildBadgeVite } from '@ui/kit/lib/build-server';
import vitePluginReact from '@vitejs/plugin-react';
import { type Plugin, defineConfig } from 'vite';

import { adminUrl, speakDevPort, speakPort } from './ports.ts';

// the dev tab wears a marker so it never reads as the served page beside it
const devTitle = (): Plugin => ({
  apply: 'serve',
  name: 'speak-dev-title',
  transformIndexHtml: (html) =>
    html.replace('<title>speak</title>', '<title>speak: dev</title>'),
});

// every api call goes to the admin server: it alone reaches the daemon. a build calls nobody, so it asks for no ports
const devProxy = (): Plugin => ({
  apply: 'serve',
  config: () => ({
    server: {
      proxy: {
        // the host stays the page's own, which is what the admin holds a write's origin against
        '/api': {
          changeOrigin: false,
          target: adminUrl(import.meta.dirname, speakPort),
        },
      },
    },
  }),
  name: 'speak-dev-proxy',
});

export default defineConfig({
  plugins: [
    vitePluginReact(),
    vitePluginTailwind(),
    devTitle(),
    buildBadgeVite(),
    devProxy(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // `@ui/kit` is consumed as source, so its React import must be the app's own
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: Number(process.env.PORT ?? speakDevPort),
    strictPort: true,
  },
});
