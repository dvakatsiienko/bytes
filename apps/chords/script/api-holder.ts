/**
 * Who answers on the api's port: `none` when it refuses, `daemon` when it answers like frame's hotkey
 * daemon, `other` for anything else — a stray server, or a socket that never answers.
 */
export const apiHolder = async (port: number): Promise<ApiHolder> => {
  try {
    const answer = await fetch(`http://localhost:${port}/api/hotkeys`, {
      // long on purpose: the daemon is one thread, and resolving app names or the press log blocks it for seconds
      signal: AbortSignal.timeout(10_000),
    });
    const body: unknown = await answer.json();

    return isDaemonAnswer(answer.status, body) ? 'daemon' : 'other';
  } catch (error) {
    return isRefused(error) ? 'none' : 'other';
  }
};

/* Helpers */

// 503 is the daemon before its first scan
const isDaemonAnswer = (status: number, body: unknown) => {
  if (typeof body !== 'object' || body === null) return false;
  if (status === 503) {
    return 'error' in body && String(body.error).startsWith('no scan yet');
  }

  return 'hotkeys' in body && Array.isArray(body.hotkeys);
};

const isRefused = (error: unknown) =>
  error instanceof Error &&
  (error.cause as { code?: string } | undefined)?.code === 'ECONNREFUSED';

/* Types */
export type ApiHolder = 'daemon' | 'none' | 'other';
