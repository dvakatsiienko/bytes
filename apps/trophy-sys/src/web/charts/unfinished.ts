import type { Game, RemainingTrophy } from '../../shared/types.ts';
import type { BarChart } from '../components/bar-rows.tsx';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { BAR_TONE } from '../helpers/chart-theme.ts';
import { hoursFormat } from '../helpers/format.ts';
import { GRADE_ORDER, gameLookup } from '../helpers/stats.ts';

/** Titles shown before the list stops being a weekly-open view. */
const LIMIT = 15;

/**
 * Untouched for this long and the title is dormant rather than in progress.
 * Six months is the point where "I will get back to it" stops being true — the
 * old abandoned panel drew the same distinction from progress alone, which
 * missed a title stalled at 40%.
 */
const DORMANT_MONTHS = 6;

const isDormant = (playedAt: string | null) => {
  if (!playedAt) return true;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - DORMANT_MONTHS);
  return new Date(playedAt) < cutoff;
};

/** "2 bronze, 1 gold" — what is actually left, by grade. */
export const gradeBreakdown = (left: RemainingTrophy[]) => {
  const parts = GRADE_ORDER.map((grade) => {
    const count = left.filter((trophy) => trophy.grade === grade).length;
    return count ? `${count} ${grade}` : null;
  }).filter((part) => part !== null);

  return parts.length ? parts.join(', ') : '—';
};

/**
 * How much work a title still holds, in trophies. An incremental trophy counts
 * as the slice of it that is left, so a 47-of-100 collectible is 0.53 of a
 * trophy and not a whole one — which is the difference between "nearly there"
 * and "untouched" for the titles this list is meant to surface.
 */
const distanceOf = (left: RemainingTrophy[]) =>
  left.reduce(
    (total, trophy) =>
      total +
      (1 -
        (trophy.counter ? trophy.counter.current / trophy.counter.target : 0)),
    0,
  );

/**
 * The orders worth offering. "left" is the default because the question the
 * chart exists to answer is what to open next; the other two are for when the
 * answer is "whichever I have already sunk the most into".
 */
export const UNFINISHED_SORTS = [
  { label: 'left', value: 'left' },
  { label: 'progress', value: 'progress' },
  { label: 'hours', value: 'hours' },
] as const satisfies readonly { label: string; value: UnfinishedSort }[];

const UNFINISHED_ORDER: Record<
  UnfinishedSort,
  (a: UnfinishedRow, b: UnfinishedRow) => number
> = {
  hours: (a, b) => b.hours - a.hours,
  left: (a, b) => a.distance - b.distance,
  progress: (a, b) => b.progress - a.progress,
};

export const unfinishedRows = (
  remaining: RemainingTrophy[],
  games: Game[],
  sort: UnfinishedSort,
): UnfinishedRow[] => {
  const byId = gameLookup(games);
  const grouped = new Map<string, RemainingTrophy[]>();

  for (const trophy of remaining) {
    const bucket = grouped.get(trophy.gameId);
    if (bucket) bucket.push(trophy);
    else grouped.set(trophy.gameId, [trophy]);
  }

  const rows: UnfinishedRow[] = [];

  for (const [gameId, left] of grouped) {
    const game = byId.get(gameId);
    if (!game) continue;

    // Rarest first: the rarest thing left is what actually decides whether a
    // title is finishable, so it leads the hover and the table row.
    const sorted = [...left].sort((a, b) => a.rarity - b.rarity);
    const counters = sorted.filter((trophy) => trophy.counter);

    const playedAt = game.playedAt ?? game.lastPlayedAt;

    rows.push({
      counters,
      distance: distanceOf(left),
      dormant: isDormant(playedAt),
      gameId,
      hours: (game.playSeconds ?? 0) / 3600,
      iconUrl: game.iconUrl,
      left: sorted,
      name: game.name,
      playedAt,
      progress: game.progress,
      rarest: sorted[0] ?? null,
    });
  }

  // Sorted before the cut, so changing the order changes which titles make the
  // list — not just how the same fifteen are arranged.
  return rows.sort(UNFINISHED_ORDER[sort]).slice(0, LIMIT);
};

export const unfinishedChart = (rows: UnfinishedRow[]): BarChart => ({
  axis: { format: (value) => `${Math.round(value)}%`, max: 100 },
  bars: rows.map((row) => {
    const namedLeft = row.left
      .slice(0, 3)
      .map((trophy) => trophy.name)
      .join(', ');

    return {
      fraction: row.progress / 100,
      iconUrl: row.iconUrl,
      id: row.gameId,
      label: row.name,
      note: `still open: ${namedLeft}${row.left.length > 3 ? ` +${row.left.length - 3} more` : ''}`,
      rows: [
        { label: 'progress', value: `${row.progress}%` },
        { label: 'left by grade', value: gradeBreakdown(row.left) },
        {
          label: 'left',
          value: `${row.distance.toFixed(1)} of ${row.left.length}`,
        },
        {
          label: 'rarest left',
          value: row.rarest ? `${row.rarest.rarity}%` : '—',
        },
        { label: 'counters', value: counterFormat(row.counters) },
        { label: 'hours sunk', value: hoursFormat(row.hours) },
      ],
      tone: row.dormant ? BAR_TONE.past : BAR_TONE.open,
      value: row.dormant
        ? `${row.distance.toFixed(1)} left · dormant`
        : `${row.distance.toFixed(1)} left`,
    };
  }),
});

const counterFormat = (counters: UnfinishedRow['counters']) => {
  const [first] = counters;
  if (!first?.counter) return '—';

  const head = `${first.counter.current}/${first.counter.target}`;
  return counters.length > 1 ? `${head} +${counters.length - 1}` : head;
};

export const UNFINISHED_COLUMNS: ChartColumn<UnfinishedRow>[] = [
  { cell: (row) => row.name, head: 'title' },
  { cell: (row) => (row.dormant ? 'dormant' : 'active'), head: 'state' },
  { cell: (row) => `${row.progress}%`, head: 'progress', isNumeric: true },
  {
    cell: (row) => row.distance.toFixed(1),
    head: 'trophies left',
    isNumeric: true,
  },
  {
    cell: (row) => (row.rarest ? `${row.rarest.rarity}%` : '—'),
    head: 'rarest left',
    isNumeric: true,
  },
  { cell: (row) => row.rarest?.name ?? '—', head: 'that trophy' },
  { cell: (row) => counterFormat(row.counters), head: 'counters' },
  {
    cell: (row) => hoursFormat(row.hours),
    head: 'hours sunk',
    isNumeric: true,
  },
];

/* Types */
export type UnfinishedSort = 'hours' | 'left' | 'progress';

export interface UnfinishedRow {
  /** The unearned trophies that carry a live counter. */
  counters: RemainingTrophy[];
  /** Trophies still owed, counting a part-done one as its remaining slice. */
  distance: number;
  /** Untouched for DORMANT_MONTHS — the old "abandoned" panel, as a marker. */
  dormant: boolean;
  gameId: string;
  hours: number;
  iconUrl: string;
  /** Everything unearned in this title, rarest first. */
  left: RemainingTrophy[];
  name: string;
  playedAt: string | null;
  progress: number;
  rarest: RemainingTrophy | null;
}
