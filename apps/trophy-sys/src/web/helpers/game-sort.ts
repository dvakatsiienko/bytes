import type { Game } from '../../shared/types.ts';

export type GameSort = 'played' | 'playtime' | 'name';
export type PlatinumMode = 'mixed' | 'first' | 'last' | 'hide';

export const GAME_SORT_ORDER = [
  'played',
  'playtime',
  'name',
] as const satisfies readonly GameSort[];

export const PLATINUM_MODE_ORDER = [
  'mixed',
  'first',
  'last',
  'hide',
] as const satisfies readonly PlatinumMode[];

export const GAME_SORT_LABEL: Record<GameSort, string> = {
  name: 'name',
  played: 'last played',
  playtime: 'playtime',
};

export const GAME_SORT_HINT: Record<GameSort, string> = {
  name: 'Alphabetical by title.',
  played: 'Most recently played first — real play time, not last trophy.',
  playtime: 'Longest total playtime first. Unmatched titles sink to the end.',
};

export const PLATINUM_MODE_LABEL: Record<PlatinumMode, string> = {
  first: 'platinum first',
  hide: 'hide platinumed',
  last: 'platinum last',
  mixed: 'platinum mixed in',
};

export const PLATINUM_MODE_HINT: Record<PlatinumMode, string> = {
  first: 'Platinumed titles on top, fully completed ones ahead of the rest.',
  hide: 'Shows only what is still open.',
  last: 'Platinumed titles at the bottom, out of the way.',
  mixed: 'One list, no split.',
};

const platinumHas = (game: Game) => game.earned.platinum > 0;

/** A full completion outranks a bare platinum, and both outrank the rest. */
const rank = (game: Game) => (game.progress === 100 ? 0 : 1);

const compare: Record<GameSort, (a: Game, b: Game) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  played: (a, b) =>
    (b.playedAt ?? b.lastPlayedAt).localeCompare(a.playedAt ?? a.lastPlayedAt),
  // Unmatched playtime sinks below a genuine zero.
  playtime: (a, b) => (b.playSeconds ?? -1) - (a.playSeconds ?? -1),
};

export const gamesArrange = (
  games: Game[],
  sort: GameSort,
  platinum: PlatinumMode,
) => {
  const sorted = [...games].sort(compare[sort]);

  if (platinum === 'mixed') return sorted;
  if (platinum === 'hide') return sorted.filter((game) => !platinumHas(game));

  // Sort is stable, so ranking the block by completion keeps the chosen sort
  // as the tiebreaker inside each tier.
  const platinumed = sorted
    .filter(platinumHas)
    .sort((a, b) => rank(a) - rank(b));
  const rest = sorted.filter((game) => !platinumHas(game));

  return platinum === 'first'
    ? [...platinumed, ...rest]
    : [...rest, ...platinumed];
};
