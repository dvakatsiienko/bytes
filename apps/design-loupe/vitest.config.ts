import { defineConfig } from 'vitest/config';

/** the job store, the ask states and the view maths run in node; the controls are kit's, tested in kit */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['{server,src,scripts}/**/*.test.ts'],
  },
});
