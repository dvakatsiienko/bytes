import type { NpssoStatus } from '../../shared/types.ts';
import { dateFormat } from './format.ts';

/**
 * Every honesty rule for the token readout lives here, in one pure function:
 * no estimate without a measurement, no age without a paste date, and the
 * sample count always said out loud.
 */
export const readoutBuild = (status: NpssoStatus) => {
  const rows: ReadoutRow[] = [];
  const notes: string[] = [];

  const age = status.savedAt === null ? null : daysSince(status.savedAt);

  // First row, because everything under it is about a token whose origin this
  // names — and because `env` is the one state the paste box below ends.
  rows.push({
    label: 'token in use',
    tone: SOURCE_TONE[status.source],
    value: SOURCE_LABEL[status.source],
  });

  rows.push(
    age === null
      ? { label: 'age', tone: 'text-dim', value: 'unknown' }
      : { label: 'age', tone: 'text-fg', value: dayLabel(age) },
  );

  if (status.source === 'none') notes.push('no token is stored.');
  else if (status.savedAt === null)
    notes.push(
      status.source === 'env'
        ? 'this token came from the env var seed, so there is no paste date to measure its age from. pasting one here takes over.'
        : 'this token predates the measuring, so its age is unknown.',
    );

  // The shortest lifetime seen, never the average: it is the conservative end
  // of a sample this small, and being early is the harmless direction to err.
  const shortest = status.lifetimes.length
    ? daysOf(Math.min(...status.lifetimes))
    : null;

  if (shortest !== null) {
    rows.push({
      label: 'shortest seen',
      tone: 'text-fg',
      value: dayLabel(shortest),
    });

    if (age !== null && status.diedAt === null) {
      const left = shortest - age;
      rows.push(
        left > 0
          ? {
              label: 'rough guess',
              tone: 'text-yellow',
              value: `~${dayLabel(left)} left`,
            }
          : {
              label: 'rough guess',
              tone: 'text-orange',
              value: 'past the shortest seen',
            },
      );
    }
  }

  if (status.lifetimes.length === 0)
    notes.push(
      'no token has died under measurement yet, so there is no estimate. the first one pasted here starts the clock.',
    );
  else if (status.lifetimes.length === 1)
    notes.push(
      'measured from 1 sample — a single data point, not a trend. treat the guess as a hint, not a deadline.',
    );
  else
    notes.push(
      `measured from ${status.lifetimes.length} samples, shortest of them.`,
    );

  const dead =
    status.diedAt === null
      ? null
      : `psn refused this token on ${dateFormat(new Date(status.diedAt).toISOString())} — the app stays down until a new one is pasted.`;

  return { dead, notes, rows };
};

/**
 * Plain words, not the storage layer. Only one of these is the steady state:
 * `env` means nothing has been pasted yet, and the first paste ends it.
 */
const SOURCE_LABEL = {
  env: 'the env var (no paste yet)',
  none: 'nothing stored',
  store: 'pasted here',
} as const satisfies Record<NpssoStatus['source'], string>;

/** Yellow for the seed: it works, and it is not where a renewed token goes. */
const SOURCE_TONE = {
  env: 'text-yellow',
  none: 'text-dim',
  store: 'text-fg',
} as const satisfies Record<NpssoStatus['source'], string>;

const DAY_MS = 86_400_000;

const daysSince = (epoch: number) =>
  Math.max(0, Math.floor((Date.now() - epoch) / DAY_MS));

// Floored, never rounded: this readout exists because a confident wrong number
// sent the owner down the wrong path once already. Reporting 26 days for a
// token that lasted 25 and a half is the same mistake in miniature.
const daysOf = (ms: number) => Math.floor(ms / DAY_MS);

const dayLabel = (count: number) => `${count} ${count === 1 ? 'day' : 'days'}`;

/* Types */
export interface ReadoutRow {
  label: string;
  tone: string;
  value: string;
}
