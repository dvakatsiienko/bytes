import { useCallback, useSyncExternalStore } from 'react';

const KEY_PREFIX = 'trophy-sys:';

// `storage` only fires in *other* tabs, so a write here notifies this tab's
// subscribers by hand — otherwise two controls on one page drift apart.
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
};

/**
 * A dropdown choice that survives a reload. `allowed` is the guard: a value
 * left in storage by an older build is dropped rather than trusted, so
 * renaming an option can never wedge the ui on a choice that no longer exists.
 */
export const useStored = <Value extends string>(
  key: string,
  fallback: Value,
  allowed: readonly Value[],
) => {
  const read = useCallback(() => {
    const raw = localStorage.getItem(KEY_PREFIX + key);

    return raw && (allowed as readonly string[]).includes(raw)
      ? (raw as Value)
      : fallback;
  }, [key, fallback, allowed]);

  const value = useSyncExternalStore(subscribe, read);

  const store = useCallback(
    (next: Value) => {
      localStorage.setItem(KEY_PREFIX + key, next);
      for (const listener of listeners) listener();
    },
    [key],
  );

  return [value, store] as const;
};
