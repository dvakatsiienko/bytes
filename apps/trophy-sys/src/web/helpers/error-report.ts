/**
 * A render error, said twice: to this browser's console, and to the api, whose
 * function log is the only place a production error reaches the owner.
 * Fire and forget — a report that fails must never become a second error.
 */
export const errorReport = (error: unknown) => {
  console.error(error);

  const report =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };

  fetch('/api/client-error', {
    body: JSON.stringify({ ...report, path: window.location.pathname }),
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => undefined);
};
