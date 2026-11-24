// the page's one door to the admin server; the settings' shape is contract/config.schema.json's

export const LANGS = [
  ['en', 'english'],
  ['uk', 'українська'],
  ['ru', 'русский'],
] as const;

export const ENGINES = [
  'elevenlabs',
  'kokoro',
  'system',
  'fish',
  'gemini',
] as const;

export const ENGINE_LABELS: Record<Engine, string> = {
  elevenlabs: 'ElevenLabs',
  fish: 'Fish',
  gemini: 'Gemini',
  kokoro: 'Kokoro (local)',
  system: 'macOS voice',
};

export const speaks = (engine: Engine, lang: Lang) =>
  engine !== 'kokoro' || lang === 'en';

export const voiceOf = (config: Config, engine: Engine, lang: Lang) => {
  const voice = config.engines[engine]?.voice ?? {};
  return voice[lang] ?? voice['*'] ?? '';
};

// every request ends in an answer or a reason, never in a dropped rejection
const call = async <T extends object>(
  method: string,
  path: string,
  payload?: unknown,
): Promise<Answer<T>> => {
  try {
    const response = await fetch(path, {
      body: payload === undefined ? undefined : JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
      method,
    });
    const answer = await response.json();
    if (response.ok || answer.error) return answer;
    return { error: `the admin server answered ${response.status}` };
  } catch (error) {
    return {
      error: `the admin server is not answering — ${(error as Error).message}`,
    };
  }
};

// a query with no answer has no data: the reason is its error
const read = async <T extends object>(path: string): Promise<T> => {
  const answer = await call<T>('GET', path);
  if (answer.error !== undefined) throw new Error(answer.error);
  return answer as T;
};

export const api = {
  config: () => read<Settings>('/api/config'),
  heart: (engine: Engine, voice: string, isOn: boolean) =>
    call<Saved>('PUT', '/api/favourites', { engine, on: isOn, voice }),
  pause: () => call('POST', '/api/pause'),
  preview: (payload: Preview) => call('POST', '/api/preview', payload),
  save: (patch: Patch, version: string) =>
    call<Saved>('PUT', '/api/config', { patch, version }),
  status: () => read<Status>('/api/status'),
  stop: () => call('POST', '/api/stop'),
  voices: () => read<Voices>('/api/voices'),
  wave: (payload: Wave) => call('POST', '/api/wave', payload),
};

/* Types */

export type Lang = (typeof LANGS)[number][0];
export type Engine = (typeof ENGINES)[number];

export interface EngineSettings {
  // voice ids dima hearted; the daemon ignores them, the admin sorts them to the top
  favourites?: string[];
  gain?: number;
  model?: string;
  speed?: number;
  voice?: Partial<Record<Lang | '*', string>>;
}

export interface Config {
  chain: Partial<Record<Lang, Engine[]>>;
  engines: Partial<Record<Engine, EngineSettings>>;
  firstAudioMs: number;
  meterFlowMs?: number;
  meterGlideMs?: number;
}

// the settings file and the mark of its bytes; a save names the mark it edits
export interface Settings {
  config: Config;
  version: string;
}

// a save's answer also names the file it went over
export interface Saved extends Settings {
  was: string;
}

// the changed keys alone; null takes a key out
export type Patch = { [key: string]: unknown };

export type Answer<T extends object = object> =
  | (T & { error?: undefined })
  | Refusal;

// stale: the settings file moved on since this page read it
interface Refusal {
  error: string;
  stale?: boolean;
}

export interface Status {
  accessibility?: boolean;
  engines?: Partial<
    Record<
      Engine,
      {
        state: 'live' | 'benched' | 'no key' | 'no quota';
        until?: string;
        // the provider's own words on a quota refusal
        note?: string;
      }
    >
  >;
  paused?: boolean;
  speaking?: boolean;
}

interface SystemVoice {
  id: string;
  lang: string;
  name: string;
  quality: string;
}

export type Voices = Record<Exclude<Engine, 'system'>, [string, string][]> & {
  system: SystemVoice[];
};

export interface Preview {
  engine: Engine;
  settings: EngineSettings;
  text: string;
}

// the pill's infinite waveform: on with the draft's glide and flow, off to hand the meter back
export interface Wave {
  flow?: number;
  glide?: number;
  on: boolean;
}
