import { expect, test } from 'vitest';

import { resolveTheme, toggledTheme } from './hooks.ts';
import { themes } from './state.ts';

test('t lands on the other look than the one on screen, and never on system', () => {
  for (const theme of themes) {
    for (const prefersDark of [true, false]) {
      const onScreen = resolveTheme(theme, prefersDark);
      const next = toggledTheme(theme, prefersDark);
      expect(next).not.toBe('system');
      expect(next).not.toBe(onScreen);
    }
  }
});
