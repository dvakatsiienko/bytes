import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { atelierApi } from './server/plugin.ts';

export default defineConfig({
  plugins: [
    vitePluginReact({ compiler: true }),
    vitePluginTailwind(),
    atelierApi(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: Number(process.env.PORT ?? 5180),
    strictPort: true,
    // bakes and exports land here while the server runs; none of it is a module
    watch: { ignored: ['**/takes/**', '**/out/**'] },
  },
});
