import vitePluginTailwindcss from '@tailwindcss/vite';
import { buildBadgeVite } from '@ui/kit/lib/build-server';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginProgress from 'vite-plugin-progress';

export default defineConfig({
  plugins: [
    vitePluginReact({ compiler: true }),
    vitePluginProgress(),
    vitePluginTailwindcss(),
    buildBadgeVite(),
  ],
  resolve: { dedupe: ['react', 'react-dom'], tsconfigPaths: true },
  server: { port: Number(process.env.PORT ?? 5173), strictPort: true },
});
