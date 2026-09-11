import { defineConfig } from 'vitest/config';

// The project name comes from package.json. Server and web code both test as
// plain node today; a DOM environment enters here when a component test does.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
});
