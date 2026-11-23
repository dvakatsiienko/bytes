/**
 * Who answers on the api's port: `none` when it refuses, `daemon` when it answers like frame's hotkey
 * daemon, `outdated` when that daemon predates the chord rule on the wire, `other` for anything else —
 * a stray server, or a socket that never answers.
 */
export const apiHolder = async (port: number): Promise<ApiHolder> => {
  try {
    const answer = await fetch(`http://localhost:${port}/api/hotkeys`, {
      // long on purpose: the daemon is one thread, and resolving app names or the press log blocks it for seconds
      signal: AbortSignal.timeout(10_000),
    });
    const body: unknown = await answer.json();

    return holderOf(answer.status, body);
  } catch (error) {
    return isRefused(error) ? 'none' : 'other';
  }
};

/* Helpers */

const holderOf = (status: number, body: unknown): ApiHolder => {
  if (typeof body !== 'object' || body === null) return 'other';
  // the daemon before its first scan
  if (status === 503 && 'error' in body) {
    return String(body.error).startsWith('no scan yet') ? 'daemon' : 'other';
  }
  if (!('hotkeys' in body && Array.isArray(body.hotkeys))) return 'other';

  return 'modifierOrder' in body ? 'daemon' : 'outdated';
};

const isRefused = (error: unknown) =>
  error instanceof Error &&
  (error.cause as { code?: string } | undefined)?.code === 'ECONNREFUSED';

/* Types */
export type ApiHolder = 'daemon' | 'none' | 'other' | 'outdated';
