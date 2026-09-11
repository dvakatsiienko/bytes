// The real stylesheet, processed by the kit's own postcss/tailwind config. A
// variant test without it would assert class strings, which is the
// implementation; with it, the assertion is the colour a user sees.
import './src/styles/globals.css';

import { afterEach } from 'vitest';
import { cleanup } from 'vitest-browser-react';

// Browser mode runs every test in one page, so a mounted tree outlives its test
// unless it is removed.
afterEach(cleanup);
