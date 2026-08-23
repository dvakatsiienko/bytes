import vitePluginTailwindcss from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import vitePluginProgress from 'vite-plugin-progress';

export default defineConfig({
  plugins: [
    vitePluginReact({ compiler: true }),
    vitePluginProgress(),
    vitePluginTailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
});
