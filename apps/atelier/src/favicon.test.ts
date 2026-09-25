import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { markDev, pinColorScheme, showFavicon } from './favicon.ts';

const adaptive = readFileSync(
  new URL('../public/favicon.svg', import.meta.url),
  'utf8',
);
const schemeQuery = /prefers-color-scheme/g;
const alwaysOn = /@media all\b/g;
const alwaysOff = /@media not all\b/g;
const lampGold = /#ffd978"/g;
const devDot = /<circle cx="432"[^>]*\/>/;

describe('pinColorScheme', () => {
  it('leaves no colour-scheme query for the browser to decide, in either theme', () => {
    for (const scheme of ['light', 'dark'] as const) {
      expect(pinColorScheme(adaptive, scheme).match(schemeQuery)).toBeNull();
    }
  });

  it('turns every dark block on for dark and off for light', () => {
    const darkBlocks = adaptive.match(schemeQuery)?.length ?? 0;
    expect(darkBlocks).toBeGreaterThan(0);
    expect(pinColorScheme(adaptive, 'dark').match(alwaysOn)).toHaveLength(
      darkBlocks,
    );
    expect(pinColorScheme(adaptive, 'light').match(alwaysOff)).toHaveLength(
      darkBlocks,
    );
  });
});

describe('showFavicon', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the icon on a failed load and loads again on the next theme change', async () => {
    const link = { href: '/favicon.svg' };
    vi.stubGlobal('document', { querySelector: () => link });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response(adaptive));
    vi.stubGlobal('fetch', fetchMock);

    await expect(showFavicon('dark', false)).resolves.toBeUndefined();
    expect(link.href).toBe('/favicon.svg');

    await showFavicon('dark', false);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(decodeURIComponent(link.href).match(alwaysOn)).not.toBeNull();
  });
});

describe('markDev', () => {
  it('adds exactly one lamp-gold dot, in either theme, and leaves the rest of the icon as it was', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const pinned = pinColorScheme(adaptive, scheme);
      const marked = markDev(pinned);
      expect(marked.match(lampGold)?.length ?? 0).toBe(
        (pinned.match(lampGold)?.length ?? 0) + 1,
      );
      expect(marked.replace(devDot, '')).toBe(pinned);
    }
  });
});
