import type { ArchivedTrophy, Game } from '../../shared/types.ts';
import type { BarChart } from '../components/bar-rows.tsx';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { BAR_TONE } from '../helpers/chart-theme.ts';
import { dateFormat, hoursFormat } from '../helpers/format.ts';
import { gameLookup } from '../helpers/stats.ts';

const DAY_MS = 24 * 60 * 60 * 1000;

/** "hours" answers what was quick; the others, what was recent or what was hard. */
export const PLATINUM_SORTS = [
  { label: 'hours', value: 'hours' },
  { label: 'newest', value: 'newest' },
  { label: 'rarity', value: 'rarity' },
] as const satisfies readonly { label: string; value: PlatinumSort }[];

const PLATINUM_ORDER: Record<
  PlatinumSort,
  (a: PlatinumRun, b: PlatinumRun) => number
> = {
  hours: (a, b) => a.hours - b.hours,
  newest: (a, b) => b.platinumAt.localeCompare(a.platinumAt),
  rarity: (a, b) => a.rarity - b.rarity,
};

/**
 * One row per platinum earned, measured in hours actually played rather than in
 * calendar time. Elapsed days ride along in the hover because the two tell
 * different stories — a plat can be 30 hours of play spread over two years.
 */
export const platinumRuns = (
  trophies: ArchivedTrophy[],
  games: Game[],
  sort: PlatinumSort,
): PlatinumRun[] => {
  const byId = gameLookup(games);
  const firstAt = new Map<string, string>();
  const platAt = new Map<string, ArchivedTrophy>();

  for (const trophy of trophies) {
    if (!firstAt.has(trophy.gameId)) firstAt.set(trophy.gameId, trophy.at);
    if (trophy.grade === 'platinum') platAt.set(trophy.gameId, trophy);
  }

  const runs: PlatinumRun[] = [];

  for (const [gameId, platinum] of platAt) {
    const game = byId.get(gameId);
    const first = firstAt.get(gameId);
    if (!(game && first)) continue;

    runs.push({
      days: Math.max(
        Math.round((Date.parse(platinum.at) - Date.parse(first)) / DAY_MS),
        0,
      ),
      firstAt: first,
      gameId,
      hours: (game.playSeconds ?? 0) / 3600,
      iconUrl: game.iconUrl,
      name: game.name,
      platinumAt: platinum.at,
      rarity: platinum.rarity,
      trophyName: platinum.name,
    });
  }

  // A title whose playtime join missed has no length to draw, and parking it at
  // zero would claim an instant platinum. Dropped, exactly as the effort
  // scatter drops the same titles, and the chart's note says so.
  return runs.filter((run) => run.hours > 0).sort(PLATINUM_ORDER[sort]);
};

export const platinumChart = (runs: PlatinumRun[]): BarChart => {
  const peak = Math.max(...runs.map((run) => run.hours), 1);

  const bars = runs.map((run) => ({
    fraction: run.hours / peak,
    iconUrl: run.iconUrl,
    id: run.gameId,
    label: run.name,
    note: run.trophyName,
    rows: [
      { label: 'hours played', value: hoursFormat(run.hours) },
      { label: 'first trophy', value: dateFormat(run.firstAt) },
      { label: 'platinum', value: dateFormat(run.platinumAt) },
      { label: 'elapsed', value: `${run.days} days` },
      { label: 'plat rarity', value: `${run.rarity}%` },
    ],
    tone: BAR_TONE.platinum,
    value: hoursFormat(run.hours),
  }));

  return { axis: { format: hoursFormat, max: peak }, bars };
};

export const PLATINUM_COLUMNS: ChartColumn<PlatinumRun>[] = [
  { cell: (run) => run.name, head: 'title' },
  { cell: (run) => hoursFormat(run.hours), head: 'hours', isNumeric: true },
  { cell: (run) => dateFormat(run.firstAt), head: 'first trophy' },
  { cell: (run) => dateFormat(run.platinumAt), head: 'platinum' },
  { cell: (run) => String(run.days), head: 'elapsed days', isNumeric: true },
  { cell: (run) => `${run.rarity}%`, head: 'rarity', isNumeric: true },
];

/* Types */
export type PlatinumSort = 'hours' | 'newest' | 'rarity';

export interface PlatinumRun {
  /** Calendar days between the first trophy and the platinum. */
  days: number;
  firstAt: string;
  gameId: string;
  /** Total hours played in the title — the bar's measure. */
  hours: number;
  iconUrl: string;
  name: string;
  platinumAt: string;
  rarity: number;
  trophyName: string;
}
