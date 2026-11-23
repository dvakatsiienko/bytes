// the page's unsaved edits over the settings it read, as pure steps; useSettings runs them
import type { Config, Engine, Patch, Saved, Settings } from '@/api.ts';

// the keys that differ, as the daemon takes them; undefined when none does
export const changesOf = (saved: object, draft: object): Patch | undefined => {
  const before = saved as Patch;
  const after = draft as Patch;
  const patch: Patch = {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const was = before[key];
    const now = after[key];
    if (now === undefined) {
      if (was !== undefined) patch[key] = null;
    } else if (isObject(now)) {
      const inner = changesOf(isObject(was) ? was : {}, now);
      if (inner ?? !isObject(was)) patch[key] = inner ?? {};
    } else if (JSON.stringify(was) !== JSON.stringify(now)) patch[key] = now;
  }
  return Object.keys(patch).length > 0 ? patch : undefined;
};

// a ♥ is saved at once and touches that engine's list alone, so neither copy of the settings moves anywhere else
export const withHeart = (
  config: Config,
  engine: Engine,
  saved: Config,
): Config => ({
  ...config,
  engines: {
    ...config.engines,
    [engine]: {
      ...config.engines[engine],
      favourites: saved.engines[engine]?.favourites ?? [],
    },
  },
});

// the file went on by this page's own ♥ alone → its version goes on too; else the page stays behind, and its next save
// is refused instead of writing over what it never read
export const afterHeart = (
  settings: Settings,
  engine: Engine,
  saved: Saved,
): Settings => ({
  config: withHeart(settings.config, engine, saved.config),
  version: saved.was === settings.version ? saved.version : settings.version,
});

/* Helpers */
const isObject = (value: unknown): value is Patch =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
