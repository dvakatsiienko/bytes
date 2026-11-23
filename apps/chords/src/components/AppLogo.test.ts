import { expect, it } from 'vitest';

import * as logos from '../logos.ts';
import { aliases, hasLogo } from './AppLogo.tsx';

it('finds a mark file behind every alias', () => {
  const lost = Object.values(aliases).filter((name) => !logos.hasLogo(name));

  expect(lost).toEqual([]);
});

it('finds a mark by the name the page prints, by a bundle id, and not for a stranger', () => {
  expect(hasLogo('Google Chrome')).toBe(true);
  expect(logos.appLogo('com.apple.Calculator')).toBe('com-apple-calculator');
  expect(hasLogo('no such app')).toBe(false);
});

it('serves the dark file where a brand ships one, else the light one for both', () => {
  expect(logos.logoOf('github', 'dark')).not.toBe(
    logos.logoOf('github', 'light'),
  );
  expect(logos.logoOf('chrome', 'dark')).toBe(logos.logoOf('chrome', 'light'));
});
