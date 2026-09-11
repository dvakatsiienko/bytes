import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * The kit tests in a real browser, not a DOM simulator. It is the one package
 * whose product IS rendering: Tailwind classes and Base UI primitives. jsdom
 * does no layout, computes nothing from a stylesheet, and ignores
 * `pointer-events: none` — so the three things most worth pinning about a
 * button are exactly the three it cannot see. Vitest's own component-testing
 * guide recommends browser mode for this.
 *
 * Chromium only. A second engine is a real cost per run and buys nothing until
 * a finding says otherwise.
 */
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright(),
    },
    include: ['src/**/*.test.tsx'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
