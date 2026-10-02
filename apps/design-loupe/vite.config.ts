import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { loupeApi, runtimeOf } from './server/plugin.ts';

const appDir = fileURLToPath(new URL('.', import.meta.url));
// v1 serves one job; `LOUPE_JOB=fixtures/speak` points it at the test fixture
const jobDir = resolve(
  appDir,
  process.env.LOUPE_JOB ?? `${homedir()}/projects/studio/jobs/speak`,
);

export default defineConfig({
  plugins: [
    vitePluginReact({ compiler: true }),
    vitePluginTailwind(),
    loupeApi({ jobDir, runtime: runtimeOf(appDir) }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: Number(process.env.PORT ?? 5181),
    strictPort: true,
    watch: { ignored: ['**/fixtures/**', '**/.runtime/**'] },
  },
});
