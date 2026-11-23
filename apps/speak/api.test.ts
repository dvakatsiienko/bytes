import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Config, api } from './src/api.ts';
import {
  afterHeart,
  changesOf,
  draftAfterHeart,
  draftAfterSave,
  unsavedOf,
} from './src/draft.ts';

const answers = (status: number, body: string) =>
  vi.stubGlobal('fetch', async () => new Response(body, { status }));

afterEach(() => vi.unstubAllGlobals());

describe('M3: the admin server is down', () => {
  it.each([
    ['save', () => api.save({ firstAudioMs: 700 }, 'v')],
    ['a heart', () => api.heart('kokoro', 'af_sky', true)],
    [
      'preview',
      () => api.preview({ engine: 'kokoro', settings: {}, text: 'x' }),
    ],
    ['pause', () => api.pause()],
    ['stop', () => api.stop()],
  ])('%s answers the reason', async (_, action) => {
    vi.stubGlobal('fetch', () =>
      Promise.reject(new TypeError('Failed to fetch')),
    );

    await expect(action()).resolves.toEqual({
      error: 'the admin server is not answering — Failed to fetch',
    });
  });
});

describe('M13: a failed request is no settings', () => {
  it.each([
    ['a refusal', 400, '{"error":"config.json: not readable"}'],
    ['the daemon’s own error', 200, '{"error":"config.json: not readable"}'],
  ])('%s: the query fails with the reason', async (_, status, body) => {
    answers(status, body);

    await expect(api.config()).rejects.toThrow('config.json: not readable');
  });

  it.each([
    ['no reason', 500, '{}', 'the admin server answered 500'],
    ['no json', 502, '<p>', 'the admin server is not answering — '],
  ])('%s: the query fails in words', async (_, status, body, reason) => {
    answers(status, body);

    await expect(api.voices()).rejects.toThrow(reason);
  });

  it('settings are settings', async () => {
    answers(200, '{"config":{"firstAudioMs":900},"version":"v"}');

    expect(await api.config()).toEqual({
      config: { firstAudioMs: 900 },
      version: 'v',
    });
  });
});

const CONFIG: Config = {
  chain: { en: ['kokoro', 'fish'] },
  engines: {
    fish: { gain: 2, voice: { '*': 'Sarah', en: 'Jessica' } },
    kokoro: { favourites: ['af_heart'], gain: 2, speed: 1 },
  },
  firstAudioMs: 900,
};
const withEngine = (
  config: Config,
  engine: 'fish' | 'kokoro',
  patch: object,
): Config => ({
  ...config,
  engines: {
    ...config.engines,
    [engine]: { ...config.engines[engine], ...patch },
  },
});

describe('a save names the changed keys alone', () => {
  it.each<[string, Config, object | undefined]>([
    ['nothing', structuredClone(CONFIG), undefined],
    ['a number', { ...CONFIG, firstAudioMs: 700 }, { firstAudioMs: 700 }],
    ['a new key', { ...CONFIG, meterFlowMs: 55 }, { meterFlowMs: 55 }],
    [
      'an engine’s number',
      withEngine(CONFIG, 'kokoro', { speed: 1.2 }),
      { engines: { kokoro: { speed: 1.2 } } },
    ],
    [
      'an order',
      { ...CONFIG, chain: { en: ['fish', 'kokoro'] } },
      { chain: { en: ['fish', 'kokoro'] } },
    ],
    [
      'a voice taken out',
      withEngine(CONFIG, 'fish', { voice: { '*': 'Sarah' } }),
      { engines: { fish: { voice: { en: null } } } },
    ],
    [
      'the first voice of an engine',
      withEngine(CONFIG, 'kokoro', { voice: { en: 'af_sky' } }),
      { engines: { kokoro: { voice: { en: 'af_sky' } } } },
    ],
    [
      'an empty voice',
      withEngine(CONFIG, 'kokoro', { voice: {} }),
      { engines: { kokoro: { voice: {} } } },
    ],
    [
      'a new engine',
      { ...CONFIG, engines: { ...CONFIG.engines, system: { speed: 2 } } },
      { engines: { system: { speed: 2 } } },
    ],
    [
      'a new language',
      { ...CONFIG, chain: { ...CONFIG.chain, uk: [] } },
      { chain: { uk: [] } },
    ],
  ])('%s', (_, draft, want) => {
    expect(changesOf(CONFIG, draft)).toEqual(want);
  });
});

describe('a heart on its way', () => {
  const lily = withEngine(CONFIG, 'kokoro', { favourites: ['af_lily'] });
  const slider = withEngine(CONFIG, 'kokoro', { speed: 1.4 });
  const read = { config: CONFIG, version: 'v1' };
  const saved = { config: lily, version: 'v2', was: 'v1' };

  it('H5: leaves a slider moved meanwhile', () => {
    const draft = draftAfterHeart(
      { config: slider, from: read },
      'kokoro',
      saved,
    );

    expect(draft.config.engines.kokoro).toEqual({
      favourites: ['af_lily'],
      gain: 2,
      speed: 1.4,
    });
    expect(unsavedOf(draft)).toEqual({ engines: { kokoro: { speed: 1.4 } } });
  });

  it('takes the page’s version along', () => {
    expect(afterHeart(read, 'kokoro', saved)).toEqual({
      config: lily,
      version: 'v2',
    });
    expect(
      draftAfterHeart({ config: slider, from: read }, 'kokoro', saved).from
        .version,
    ).toBe('v2');
  });

  it('is no unsaved change', () => {
    expect(
      unsavedOf(
        draftAfterHeart({ config: CONFIG, from: read }, 'kokoro', saved),
      ),
    ).toBeUndefined();
  });

  it('H4: over settings this page never read, leaves its next save stale', () => {
    const elsewhere = {
      config: { ...lily, firstAudioMs: 300 },
      version: 'v3',
      was: 'v2',
    };

    expect(afterHeart(read, 'kokoro', elsewhere)).toEqual({
      config: lily,
      version: 'v1',
    });
  });
});

describe('a save on its way', () => {
  const read = { config: CONFIG, version: 'v1' };
  const faster = withEngine(CONFIG, 'kokoro', { speed: 1.4 });
  const saved = { config: faster, version: 'v2' };

  it('ends the draft it saved', () => {
    expect(
      draftAfterSave({ config: faster, from: read }, saved),
    ).toBeUndefined();
  });

  it('leaves an edit made meanwhile an edit over what it saved', () => {
    const louder = withEngine(faster, 'kokoro', { gain: 3 });
    const draft = draftAfterSave({ config: louder, from: read }, saved);

    expect(draft?.from).toBe(saved);
    expect(unsavedOf(draft)).toEqual({ engines: { kokoro: { gain: 3 } } });
  });
});
