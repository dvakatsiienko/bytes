import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
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
    server: { proxy: { '/api': adminUrl(import.meta.dirname, speakPort) } },
  }),
  name: 'speak-dev-proxy',
});

export default defineConfig({
  plugins: [vitePluginReact(), vitePluginTailwind(), devTitle(), devProxy()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: Number(process.env.PORT ?? speakDevPort),
    strictPort: true,
  },
});
