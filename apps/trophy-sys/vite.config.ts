import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_PORT = Number(process.env.API_PORT ?? 5178);

export default defineConfig({
  plugins: [vitePluginReact(), vitePluginTailwind()],
  server: {
    port: 5177,
    proxy: { '/api': `http://localhost:${API_PORT}` },
  },
});
