/** what a caught value says, for a toast, a log line or an api reply */
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
