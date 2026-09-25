import { useEffect, useSyncExternalStore } from 'react';

import type { StudioCommand } from './commands.ts';
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
export const useResolvedTheme = (theme: Theme) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const system = prefersDark ? 'dark' : 'light';
  const resolved = theme === 'system' ? system : theme;
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);
  return resolved;
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest(
      'input, textarea, select, [role="spinbutton"], [role="combobox"]',
    ) !== null);

/** bare keys outside text fields and open dialogs; ⌘K / ctrl+K opens the palette from anywhere */
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
      if (isTyping(event.target) || document.querySelector('[role="dialog"]'))
        return;
      const command = commands.find(
        (candidate) => candidate.keys === event.key,
      );
      if (!command) return;
      event.preventDefault();
      command.run();
    };
    addEventListener('keydown', handleKeyDown);
    return () => removeEventListener('keydown', handleKeyDown);
  }, [commands, openPalette]);
};
