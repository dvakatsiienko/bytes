import { defineConfig } from 'vitest/config';

/**
 * atelier's own logic runs in node: the take store, settings parsing, routes.
 * The controls it renders are kit components, tested in the kit's browser run.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['{art,server,src,scripts}/**/*.test.ts'],
  },
});
