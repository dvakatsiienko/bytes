const TTL_MS = 60_000;

const entries = new Map<string, { value: unknown; expiresAt: number }>();

export const cached = async <T>(
  key: string,
  load: () => Promise<T>,
): Promise<T> => {
  const hit = entries.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const value = await load();
  entries.set(key, { expiresAt: Date.now() + TTL_MS, value });
  return value;
};

export const cacheClear = () => entries.clear();
