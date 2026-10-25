import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import { buildBadgeVite } from '@ui/kit/lib/build-server';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vitePluginReact({ compiler: true }),
    vitePluginTailwind(),
    buildBadgeVite(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: { port: Number(process.env.PORT ?? 5179) },
});
