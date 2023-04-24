/* Core */
import { defineConfig } from 'vite';
import vitePluginReactSwc from '@vitejs/plugin-react-swc';
import vitePluginProgress from 'vite-plugin-progress';
import vitePluginTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [ vitePluginReactSwc(), vitePluginProgress(), vitePluginTsconfigPaths() ],
});
