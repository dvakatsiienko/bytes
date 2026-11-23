import { describe, expect, it } from 'vitest';

import schema from './contract/config.schema.json';
import { type Config, ENGINES, type EngineSettings, LANGS } from './src/api.ts';
import { LIMITS, typed } from './src/limits.ts';

// a name in one and not the other is a type error
const SETTINGS = {
  chain: true,
  engines: true,
  firstAudioMs: true,
  meterFlowMs: true,
  meterGlideMs: true,
} satisfies Record<keyof Config, true> &
  Record<keyof typeof schema.properties, true>;
const ENGINE = {
  favourites: true,
  gain: true,
  model: true,
  speed: true,
  voice: true,
} satisfies Record<keyof EngineSettings, true> &
  Record<keyof typeof schema.$defs.settings.properties, true>;

describe('the page and the schema', () => {
  it('name the same settings', () => {
    expect(Object.keys(schema.properties).sort()).toEqual(
      Object.keys(SETTINGS).sort(),
    );
    expect(Object.keys(schema.$defs.settings.properties).sort()).toEqual(
      Object.keys(ENGINE).sort(),
    );
  });

  it('name the same engines and languages', () => {
    expect([...schema.$defs.engine.enum].sort()).toEqual([...ENGINES].sort());
    expect(schema.properties.chain.propertyNames.enum).toEqual(
      LANGS.map(([lang]) => lang),
    );
  });
});

describe('a number box', () => {
  it.each([
    ['', undefined],
    ['  ', undefined],
    ['0', undefined],
    ['99', undefined],
    ['9', undefined],
    ['-100', undefined],
    ['3001', undefined],
    ['nine', undefined],
    ['100', 100],
    ['900', 900],
    ['900.4', 900],
    ['3000', 3000],
  ])('«%s» as the first audio budget is %s', (text, want) => {
    expect(typed(text, LIMITS.firstAudioMs)).toBe(want);
  });
});
