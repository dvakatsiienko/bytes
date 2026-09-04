const TTL_MS = 60_000;

const entries = new Map<string, { value: unknown; expiresAt: number }>();

export const cached = async <T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> => {
  const hit = entries.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const value = await load();
  const now = Date.now();

  // Swept on write, not just on read: a key nobody asks for a second time would
  // otherwise sit here for the life of the process, and the keys are caller-
  // supplied (`games:${limit}`), so the set is not closed.
  for (const [staleKey, entry] of entries)
    if (entry.expiresAt <= now) entries.delete(staleKey);

  entries.set(key, { expiresAt: now + TTL_MS, value });
  return value;
};

export const cacheClear = () => entries.clear();
