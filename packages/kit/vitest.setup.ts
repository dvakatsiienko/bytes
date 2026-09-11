import { afterEach } from 'vitest';
import { cleanup } from 'vitest-browser-react';

// The kit's real stylesheet, processed by its own postcss/tailwind config. A
// variant assertion without it reads class strings, which is the
// implementation; with it, the assertion is the colour a user sees.
import './src/styles/globals.css';

// Browser mode runs every test in one page, so a mounted tree outlives its test
// unless it is removed.
afterEach(cleanup);
