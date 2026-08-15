import { useMemo, useState } from 'react';

import type { Game } from '../../shared/types.ts';
import { barRender, dateFormat, playtimeFormat } from '../helpers/format.ts';

interface GameListProps {
  games: Game[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

type Sort = 'name' | 'played' | 'playtime';

const SORT_LABEL: Record<Sort, string> = {
  name: 'name',
  played: 'last played',
  playtime: 'playtime',
};

const SORT_HINT: Record<Sort, string> = {
  name: 'Alphabetical by title.',
  played: 'Most recently played first — real play time, not last trophy.',
  playtime: 'Longest total playtime first. Unmatched titles sink to the end.',
};

/**
 * Sorting and filtering are local state, not URL state: a search is a scratch
 * gesture, not a place you would link someone to.
 */
const sortApply = (games: Game[], sort: Sort) => {
  const sorted = [...games];

  if (sort === 'name')
    return sorted.sort((a, b) => a.name.localeCompare(b.name));

  if (sort === 'playtime')
    return sorted.sort((a, b) => (b.playSeconds ?? -1) - (a.playSeconds ?? -1));

  return sorted.sort((a, b) =>
    (b.playedAt ?? b.lastPlayedAt).localeCompare(a.playedAt ?? a.lastPlayedAt),
  );
};

export const GameList = ({ games, selectedId, onSelect }: GameListProps) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('played');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? games.filter((game) => game.name.toLowerCase().includes(needle))
      : games;

    return sortApply(matched, sort);
  }, [games, query, sort]);

  return (
    <nav className='panel flex min-h-0 flex-col'>
      <span className='panel-title'>
        library ·{' '}
        {shown.length === games.length
          ? games.length
          : `${shown.length} / ${games.length}`}
      </span>

      <div className='flex items-center gap-2 border-line border-b px-3 py-2'>
        <input
          className='hint min-w-0 flex-1 border border-line bg-bg-soft px-2 py-1 text-[11px] text-fg placeholder:text-dim focus:border-orange focus:outline-none'
          data-hint='Filters the list by title as you type.'
          onChange={(event) => setQuery(event.target.value)}
          placeholder='search titles…'
          type='search'
          value={query}
        />

        <select
          className='hint hint-right cursor-pointer border border-line bg-bg-soft px-2 py-1 text-[11px] text-dim uppercase tracking-[0.1em] focus:border-orange focus:outline-none'
          data-hint={SORT_HINT[sort]}
          onChange={(event) => setSort(event.target.value as Sort)}
          value={sort}>
          {(Object.keys(SORT_LABEL) as Sort[]).map((option) => (
            <option key={option} value={option}>
              {SORT_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {shown.map((game) => {
          const isSelected = game.id === selectedId;

          return (
            <button
              className={`group flex w-full cursor-pointer items-center gap-3 border-line/60 border-b border-l-2 px-3 py-2.5 text-left transition-colors duration-150 last:border-b-0 ${
                isSelected
                  ? 'border-l-orange bg-bg-lift'
                  : 'border-l-transparent hover:border-l-dim hover:bg-bg-soft'
              }`}
              key={game.id}
              onClick={() => onSelect(game.id)}
              type='button'>
              <span
                className={`transition-colors ${isSelected ? 'text-orange' : 'text-dim group-hover:text-fg-soft'}`}>
                {isSelected ? '▶' : '·'}
              </span>

              <img
                alt=''
                className={`size-9 shrink-0 border border-line object-cover transition-all duration-150 ${
                  isSelected
                    ? 'grayscale-0'
                    : 'grayscale-[60%] group-hover:grayscale-0'
                }`}
                height={36}
                loading='lazy'
                src={game.iconUrl}
                width={36}
              />

              <span className='min-w-0 flex-1'>
                <span
                  className={`block truncate transition-colors ${isSelected ? 'text-fg' : 'text-fg-soft group-hover:text-fg'}`}>
                  {game.name}
                </span>
                <span className='block text-[10px] text-dim'>
                  {game.platform} ·{' '}
                  {dateFormat(game.playedAt ?? game.lastPlayedAt)} ·{' '}
                  {playtimeFormat(game.playSeconds)}
                </span>
              </span>

              <span className='shrink-0 text-right text-[10px]'>
                <span
                  className={
                    game.progress === 100 ? 'text-green' : 'text-yellow'
                  }>
                  {barRender(game.progress, 10)}
                </span>
                <span className='block text-dim'>{game.progress}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
