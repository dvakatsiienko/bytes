// biome-ignore lint/suspicious/noUndeclaredEnvVars: vite's own build flag, never read from the shell
export const isDev = import.meta.env.DEV;

/** dev only: `?crash=surface` or `?crash=panel` throws in that section, `?crash=root` outside both */
export const devCrash = (section: string) => {
  if (!isDev) return;
  if (new URLSearchParams(location.search).get('crash') === section)
    throw new Error(`a test crash in ${section}`);
};
