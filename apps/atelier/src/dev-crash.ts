import type { SectionName } from './components/error-boundary';

// biome-ignore lint/suspicious/noUndeclaredEnvVars: vite's own build flag, never read from the shell
export const isDev = import.meta.env.DEV;

/**
 * Dev only: `?crash=<name>` throws at that place until a «try again» ends it,
 * so its fallback can be seen. A production build drops the whole check.
 * It must keep throwing: react retries a failed render once before a boundary
 * catches it.
 */
export const devCrash = (name: CrashName) => {
  if (isDev && !ended.has(name) && crashParam() === name)
    throw new Error(`?crash=${name}: a test crash`);
};

/** a retry ends the url's test crash for the page's life */
export const endDevCrash = () => {
  const name = crashParam();
  if (name) ended.add(name);
};

/* Helpers */

const crashParam = () => new URLSearchParams(location.search).get('crash');

const ended = new Set<string>();

/* Types */

/** the six sections, a piece's own drawing, and the root outside them all */
type CrashName = SectionName | 'piece' | 'root';
