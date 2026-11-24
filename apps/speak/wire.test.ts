import { describe, expect, it } from 'vitest';

import wire from './contract/wire.schema.json';
import {
  type EngineEntry,
  type Health,
  type Heart,
  LANGS,
  type Preview,
  type Refusal,
  STATES,
  type Save,
  type Saved,
  type Started,
  type Status,
  type Voice,
  type Wave,
} from './src/api.ts';

const { health, reply, request } = wire.$defs;
const entry = reply.voices.properties.engines.items;

// the names the page reads and sends: one that leaves its type is a type error, one the daemon lacks fails
const READ = {
  began: { read: true } satisfies Record<keyof Started, true>,
  entry: {
    id: true,
    label: true,
    languages: true,
    voices: true,
  } satisfies Record<keyof EngineEntry, true>,
  health: { note: true, state: true, until: true } satisfies Record<
    keyof Health,
    true
  >,
  refused: { error: true, stale: true } satisfies Record<keyof Refusal, true>,
  settings: { config: true, version: true, was: true } satisfies Record<
    keyof Saved,
    true
  >,
  status: {
    accessibility: true,
    engines: true,
    paused: true,
    read: true,
    speaking: true,
  } satisfies Record<keyof Status, true>,
  voice: { id: true, lang: true, name: true } satisfies Record<
    keyof Voice,
    true
  >,
};
const SENT = {
  heart: { engine: true, on: true, voice: true } satisfies Record<
    keyof Heart,
    true
  >,
  preview: { engine: true, settings: true, text: true } satisfies Record<
    keyof Preview,
    true
  >,
  save: { patch: true, version: true } satisfies Record<keyof Save, true>,
  wave: { flow: true, glide: true, on: true } satisfies Record<
    keyof Wave,
    true
  >,
};

describe('the page and the wire', () => {
  it('name the same states', () => {
    expect(STATES).toEqual(health.properties.state.enum);
  });

  it('name the same languages', () => {
    const languages = LANGS.map(([lang]) => lang);
    const { languages: ofEngine, voices } = entry.properties;
    expect(ofEngine.items.enum).toEqual(languages);
    expect(voices.items.properties.lang.enum).toEqual(languages);
  });

  it.each([
    ['a status', READ.status, reply.status.properties],
    ["an engine's health", READ.health, health.properties],
    ['the settings', READ.settings, reply.settings.properties],
    ['a refusal', READ.refused, reply.refused.properties],
    ['a preview that began', READ.began, reply.began.properties],
    ['an engine of the catalogue', READ.entry, entry.properties],
    [
      'a voice of the catalogue',
      READ.voice,
      entry.properties.voices.items.properties,
    ],
  ])('%s holds what the page reads', (_, read, given) => {
    expect(Object.keys(given)).toEqual(
      expect.arrayContaining(Object.keys(read)),
    );
  });

  it.each([
    ['a preview', SENT.preview, request.preview.properties],
    ['a heart', SENT.heart, request.heart.properties],
    ['a save', SENT.save, request.save.properties],
    ['a wave', SENT.wave, request.wave.properties],
  ])('%s takes what the page sends', (_, sent, taken) => {
    expect(Object.keys(sent).sort()).toEqual(Object.keys(taken).sort());
  });
});
