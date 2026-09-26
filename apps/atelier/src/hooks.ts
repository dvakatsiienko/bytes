import { useEffect, useSyncExternalStore } from 'react';

import type { StudioCommand } from './commands.ts';
import { showFavicon } from './favicon.ts';
import type { Theme } from './state.ts';

export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => matchMedia(query).matches,
  );

/** `system` follows the OS; the `dark` class on <html> is what the kit's tokens read */
export const resolveTheme = (theme: Theme, prefersDark: boolean) => {
  if (theme !== 'system') return theme;
  return prefersDark ? 'dark' : 'light';
};

/** the `t` key: the other of the two looks on screen now; `system` stays one click away in the header */
export const toggledTheme = (theme: Theme, prefersDark: boolean) =>
  resolveTheme(theme, prefersDark) === 'dark' ? 'light' : 'dark';

export const useResolvedTheme = (theme: Theme) => {
  const resolved = resolveTheme(
    theme,
    useMediaQuery('(prefers-color-scheme: dark)'),
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);
  return resolved;
};

/** the tab: its icon follows the theme; a dev studio says so in the title and with a dot on the icon, so it is never mistaken for main */
export const useTabMark = (resolved: 'light' | 'dark', isDev: boolean) => {
  useEffect(() => {
    showFavicon(resolved, isDev);
    document.title = isDev ? 'atelier · dev' : 'atelier';
  }, [resolved, isDev]);
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest(
      'input, textarea, select, [role="spinbutton"], [role="combobox"]',
    ) !== null);

/** bare keys outside text fields and open dialogs — the zoom viewer lets its `inViewer` keys through; ⌘K / ctrl+K opens the palette from anywhere */
export const useHotkeys = (
  commands: readonly StudioCommand[],
  openPalette: () => void,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
        return;
      }
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat ||
        event.defaultPrevented
      )
        return;
      if (
        isTyping(event.target) ||
        document.querySelector(
          '[role="dialog"]:not([data-viewer]), [role="listbox"], [role="menu"]',
        )
      )
        return;
      const command = commands.find(
        (candidate) => candidate.keys === event.key,
      );
      if (
        !command ||
        (document.querySelector('[data-viewer]') && !command.inViewer)
      )
        return;
      event.preventDefault();
      command.run();
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [commands, openPalette]);
};
