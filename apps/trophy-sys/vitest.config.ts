import vitePluginTailwind from '@tailwindcss/vite';
import vitePluginReact from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// The project name comes from package.json. Server and web logic test as plain
// node; a `*.browser.test.tsx` reads the drawn page, so it runs in chromium with
// the real stylesheet, at the two widths the app is checked at.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { include: ['src/**/*.test.ts'], name: 'node' },
      },
      {
        extends: true,
        plugins: [vitePluginReact(), vitePluginTailwind()],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
                name: '1280',
                viewport: { height: 800, width: 1280 },
              },
              {
                browser: 'chromium',
                name: '390',
                viewport: { height: 844, width: 390 },
              },
            ],
            provider: playwright(),
          },
          include: ['src/**/*.browser.test.tsx'],
          name: 'browser',
        },
      },
    ],
    restoreMocks: true,
  },
});
