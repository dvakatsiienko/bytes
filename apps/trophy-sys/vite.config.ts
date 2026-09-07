import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_PORT = Number(
  process.env.API_PORT ?? 5178 + Number(process.env.PORT_OFFSET ?? 0),
);

export default defineConfig({
  plugins: [vitePluginReact({ compiler: true }), vitePluginTailwind()],
  server: {
    port: Number(process.env.PORT ?? 5177),
    proxy: { '/api': `http://localhost:${API_PORT}` },
    // Fail rather than auto-bump: a silent sibling on 5178+ collides with the
    // api port and leaves the preview pointing at a stale server.
    strictPort: true,
  },
});
