import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_PORT = Number(
  process.env.API_PORT ?? 5178 + Number(process.env.PORT_OFFSET ?? 0),
);

export default defineConfig({
  plugins: [vitePluginReact({ compiler: true }), vitePluginTailwind()],
  // `@ui/kit` is consumed as source, so its React import must be the app's own.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    port: Number(process.env.PORT ?? 5177),
    proxy: { '/api': `http://localhost:${API_PORT}` },
    // Fail rather than auto-bump: a silent sibling on 5178+ collides with the
    // api port and leaves the preview pointing at a stale server.
    strictPort: true,
    // The api writes its state beside the app root, so an admin save used to
    // trigger a full reload and wipe whatever filter was typed.
    watch: { ignored: ['**/.trophy-*.json', '**/.steam-*.json'] },
  },
});
