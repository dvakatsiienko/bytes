import vitePluginTailwindcss from '@tailwindcss/vite';
import vitePluginReactSwc from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import vitePluginProgress from 'vite-plugin-progress';
import vitePluginTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    vitePluginReactSwc(),
    vitePluginProgress(),
    vitePluginTsconfigPaths(),
    vitePluginTailwindcss(),
  ],
});
