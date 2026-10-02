/**
 * Runs `work` one call at a time. A call that arrives while one runs asks for
 * exactly one more pass after it, however many arrive — so two file events
 * close together never run the same check twice at once.
 */
export const oneAtATime = (work: () => Promise<void>) => {
  let isRunning = false;
  let isAgain = false;
  const run = async (): Promise<void> => {
    if (isRunning) {
      isAgain = true;
      return;
    }
    isRunning = true;
    try {
      await work();
    } finally {
      isRunning = false;
    }
    if (isAgain) {
      isAgain = false;
      await run();
    }
  };
  return run;
};
