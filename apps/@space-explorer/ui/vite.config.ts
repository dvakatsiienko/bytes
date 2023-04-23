/* Core */
import { defineConfig } from 'vite';
import vitePluginReact from '@vitejs/plugin-react';
import vitePluginProgress from 'vite-plugin-progress';
import vitePluginTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [ vitePluginReact(), vitePluginProgress(), vitePluginTsconfigPaths() ],
});
