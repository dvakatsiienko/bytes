import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vitePluginTailwind from '@tailwindcss/vite';
import { buildBadgeVite } from '@ui/kit/lib/build-server';
import { wgslVitePlugin } from '@vgpu/wgsl/loader-vite';
import vitePluginReact from '@vitejs/plugin-react';
import { type Plugin, defineConfig } from 'vite';

import { chordsDevPort, chordsPort } from './ports.ts';

// Two tabs, two pages, one name — dima keeps the built page and the dev server open beside
// each other. `apply: 'serve'` is what keeps this out of the build: the shipped title stays
// `chords` and only the dev one wears the marker.
const devTitle = (): Plugin => ({
  apply: 'serve',
  name: 'chords-dev-title',
  transformIndexHtml: (html) =>
    html.replace('<title>chords</title>', '<title>chords: dev</title>'),
});

const git = (...args: string[]) =>
  execFileSync('git', args, {
    cwd: import.meta.dirname,
    encoding: 'utf8',
  }).trim();

// the commit the built page came from; `-dirty` when what it was built from is not that commit
const buildStamp = (): Plugin => ({
  apply: 'build',
  name: 'chords-build-stamp',
  transformIndexHtml: () => {
    const isDirty = git(
      'status',
      '--porcelain',
      '--',
      '.',
      '../../packages/kit',
      '../../pnpm-lock.yaml',
    );

    return [
      {
        attrs: {
          content: git('rev-parse', 'HEAD') + (isDirty ? '-dirty' : ''),
          name: 'build-commit',
        },
        injectTo: 'head',
        tag: 'meta',
      },
    ];
  },
});

export default defineConfig({
  plugins: [
    vitePluginReact(),
    vitePluginTailwind(),
    // turns a `.wgsl` import into the prepared ShaderSource vgpu 0.6 requires
    wgslVitePlugin(),
    devTitle(),
    buildBadgeVite(),
    buildStamp(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    // `@ui/kit` is consumed as source, so its React import must be the app's own
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: chordsDevPort,
    // Every api call goes to the daemon, dev or built — it is the only thing that can
    // read the press log and write manual.ts, and it is always running anyway.
    proxy: { '/api': `http://localhost:${chordsPort}` },
    // Fail rather than auto-bump: a silent bump leaves the page talking to nothing.
    strictPort: true,
  },
});
