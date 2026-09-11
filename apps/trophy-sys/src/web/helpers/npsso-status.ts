import type { GrantStatus, NpssoStatus } from '../../shared/types.ts';
import { dateFormat } from './format.ts';

/**
 * Every honesty rule for the token readout lives here, in one pure function:
 * no estimate without a measurement, no age without a paste date, and the
 * sample count always said out loud.
 *
 * 📌 `source` steers the notes but has no row of its own. It had one, and it
 * said `pasted here` on every read after the first paste — a row that only ever
 * says one thing stops being read. The state it existed for, a deploy still on
 * the env-var seed, is carried by `age: unknown` plus the note beneath it.
 */
export const readoutBuild = (status: NpssoStatus) => {
  const rows: ReadoutRow[] = [];
  const notes: string[] = [];

  const age = status.savedAt === null ? null : daysSince(status.savedAt);

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

  rows.push(grantRow(status.refresh));

  const grantNote = grantNoteBuild(status.refresh);
  if (grantNote) notes.push(grantNote);

  const dead =
    status.diedAt === null
      ? null
      : `psn refused this token on ${dateFormat(new Date(status.diedAt).toISOString())} — the app stays down until a new one is pasted.`;

  return { dead, notes, rows };
};

/**
 * The refresh grant in **one** row, as `day 3 · 9 days left`.
 *
 * 📌 Labelled `grant`, not `refresh grant`. The longer label wrapped to two
 * lines at 390px and pushed the value onto two more; five characters of label
 * buy the whole reading one line, and the panel is titled `psn token`, so the
 * row reads unambiguously beside `age`. One row is the budget either way — this
 * panel has been cut three times for growing.
 */
const grantRow = (grant: GrantStatus): ReadoutRow => {
  const read = grantRead(grant);
  if (!read) return { label: 'grant', tone: 'text-dim', value: 'none' };

  // Past the window with days still on the clock is the finding, not an error.
  const surprising = read.age > read.window;

  return {
    label: 'grant',
    tone: surprising || read.leftMs <= 0 ? 'text-yellow' : 'text-fg',
    value:
      read.leftMs > 0
        ? `day ${read.age} · ${dayLabel(daysOf(read.leftMs))} left`
        : `day ${read.age} · psn says expired`,
  };
};

/**
 * The grant's two readings, or null when the record carries no pair of clocks.
 *
 * One reader for the row and the note both. Guarded separately they drifted, and
 * the shape that drift takes is a row printing `none` above a note asserting
 * that same grant had outlived its window.
 *
 * 📌 **Age and `leftMs` are kept apart on purpose, and that is the whole
 * instrument.** Folding them into one derived figure destroys the signal: the
 * window a refresh reports is either what is left of the original (so age plus
 * left is constant) or a fresh full one (so it grows with the age), and any
 * single number combining them reads the same under both. Printed side by side,
 * the two answer it — an age past the window with days still left means a
 * refresh resets the clock.
 */
const grantRead = (grant: GrantStatus) => {
  if (grant.mintedAt === null || grant.refreshedAt === null) return null;

  return {
    age: daysSince(grant.mintedAt),
    // Counted from the reading, not from now: `expiresIn` is what PSN said at
    // `refreshedAt`, and printing it raw would age the claim by up to a day.
    leftMs: grant.expiresIn * 1000 - (Date.now() - grant.refreshedAt),
    // Rounded, where every other figure here is floored. A floor is the
    // conservative choice for an estimate and this is not one — it is PSN's own
    // published 863999s, which floors a ten-day grant to nine.
    window: Math.round((grant.window * 1000) / DAY_MS),
  };
};

const grantNoteBuild = (grant: GrantStatus) => {
  if (grant.mintedAt === null)
    return 'no refresh grant is stored — the next psn call mints one, and cold starts stop spending the npsso.';

  // The finding this row was added to catch, said out loud the moment it lands.
  const read = grantRead(grant);
  if (read && read.age > read.window && read.leftMs > 0)
    return 'this grant is older than the window psn published for it and still has days left, so a refresh does reset the clock — which is what would let the token renew itself.';

  // The shortest, for the same reason the NPSSO readout prefers it: erring
  // early is the harmless direction on a sample this small. It names no window
  // to compare against — the only one in hand belongs to the *live* grant, and
  // two grants' numbers in one sentence read as one grant measured against its
  // own promise.
  if (grant.lifetimes.length)
    return `psn has refused a refresh grant after ${dayLabel(daysOf(Math.min(...grant.lifetimes)))} — the shortest measured so far.`;

  return null;
};

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
