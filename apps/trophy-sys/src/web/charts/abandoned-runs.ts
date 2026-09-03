import type { Game, RemainingTrophy } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { dateFormat, hoursFormat } from '../helpers/format.ts';
import { GRADE_ORDER, gameLookup } from '../helpers/stats.ts';
import type { BarDatum } from './bar-rows.tsx';

/** The band this chart is about: one step from the platinum, and stopped. */
const FLOOR = 80;
const CEILING = 100;

export const abandonedRuns = (
  games: Game[],
  remaining: RemainingTrophy[],
): AbandonedRun[] => {
  const byId = gameLookup(games);
  const leftById = new Map<string, RemainingTrophy[]>();

  for (const trophy of remaining) {
    const bucket = leftById.get(trophy.gameId);
    if (bucket) bucket.push(trophy);
    else leftById.set(trophy.gameId, [trophy]);
  }

  return games
    .filter((game) => game.progress >= FLOOR && game.progress < CEILING)
    .map((game) => {
      const left = leftById.get(game.id) ?? [];

      return {
        gameId: game.id,
        hours: (game.playSeconds ?? 0) / 3600,
        iconUrl: game.iconUrl,
        left,
        name: byId.get(game.id)?.name ?? game.name,
        playedAt: game.playedAt ?? game.lastPlayedAt,
        progress: game.progress,
      };
    })
    .sort((a, b) => b.progress - a.progress);
};

/** "2 bronze, 1 gold" — what is actually left, by grade. */
const gradeBreakdown = (left: RemainingTrophy[]) => {
  const parts = GRADE_ORDER.map((grade) => {
    const count = left.filter((trophy) => trophy.grade === grade).length;
    return count ? `${count} ${grade}` : null;
  }).filter((part) => part !== null);

  return parts.length ? parts.join(', ') : '—';
};

export const abandonedBars = (runs: AbandonedRun[]): BarDatum[] =>
  runs.map((run) => ({
    // The band is 80-100, so the bar shows position inside the band rather than
    // from zero — every bar would otherwise be nearly full and nearly equal.
    fraction: (run.progress - FLOOR) / (CEILING - FLOOR),
    iconUrl: run.iconUrl,
    id: run.gameId,
    label: run.name,
    note: run.left
      .slice(0, 3)
      .map((trophy) => trophy.name)
      .join(', '),
    rows: [
      { label: 'progress', value: `${run.progress}%` },
      { label: 'left', value: gradeBreakdown(run.left) },
      { label: 'hours sunk', value: hoursFormat(run.hours) },
      { label: 'last played', value: dateFormat(run.playedAt) },
    ],
    tone: 'var(--p-red)',
    value: `${run.progress}%`,
  }));

export const ABANDONED_COLUMNS: ChartColumn<AbandonedRun>[] = [
  { cell: (run) => run.name, head: 'title' },
  { cell: (run) => `${run.progress}%`, head: 'progress', isNumeric: true },
  { cell: (run) => gradeBreakdown(run.left), head: 'left' },
  {
    cell: (run) => hoursFormat(run.hours),
    head: 'hours sunk',
    isNumeric: true,
  },
  { cell: (run) => dateFormat(run.playedAt), head: 'last played' },
];

/* Types */
export interface AbandonedRun {
  gameId: string;
  hours: number;
  iconUrl: string;
  left: RemainingTrophy[];
  name: string;
  playedAt: string;
  progress: number;
}
