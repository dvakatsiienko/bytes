import { useMemo, useState } from 'react';

import type { Game } from '../../shared/types.ts';
import {
  GRADE_MARK,
  barRender,
  dateFormat,
  playtimeFormat,
  progressTone,
} from '../helpers/format.ts';
import {
  GAME_SORT_HINT,
  GAME_SORT_LABEL,
  GAME_SORT_ORDER,
  type GameSort,
  PLATINUM_MODE_HINT,
  PLATINUM_MODE_LABEL,
  PLATINUM_MODE_ORDER,
  type PlatinumMode,
  gamesArrange,
} from '../helpers/game-sort.ts';
import { useStored } from '../hooks/use-stored.ts';
import { PlatformBadge } from './platform-badge.tsx';
import { SelectControl } from './select-control.tsx';

interface GameListProps {
  games: Game[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const GameList = ({ games, selectedId, onSelect }: GameListProps) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useStored<GameSort>(
    'library-sort',
    'played',
    GAME_SORT_ORDER,
  );
  const [platinum, setPlatinum] = useStored<PlatinumMode>(
    'library-platinum',
    'mixed',
    PLATINUM_MODE_ORDER,
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? games.filter((game) => game.name.toLowerCase().includes(needle))
      : games;

    return gamesArrange(matched, sort, platinum);
  }, [games, query, sort, platinum]);

  return (
    <nav className='panel flex min-h-0 flex-col'>
      <span className='panel-title'>
        library ·{' '}
        {shown.length === games.length
          ? games.length
          : `${shown.length} / ${games.length}`}
      </span>

      <div className='flex flex-col gap-2 border-line border-b px-3 py-2'>
        <input
          className='hint min-w-0 border border-line bg-bg-soft px-2 py-1 text-[11px] text-fg placeholder:text-dim focus:border-orange focus:outline-none'
          data-hint='Filters the list by title as you type.'
          onChange={(event) => setQuery(event.target.value)}
          placeholder='search titles…'
          type='search'
          value={query}
        />

        <div className='grid grid-cols-2 gap-2'>
          <SelectControl
            className='w-full'
            hint={GAME_SORT_HINT[sort]}
            labels={GAME_SORT_LABEL}
            onChange={setSort}
            options={GAME_SORT_ORDER}
            value={sort}
          />

          <SelectControl
            className='w-full'
            hint={PLATINUM_MODE_HINT[platinum]}
            labels={PLATINUM_MODE_LABEL}
            onChange={setPlatinum}
            options={PLATINUM_MODE_ORDER}
            value={platinum}
          />
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {shown.map((game) => {
          const isSelected = game.id === selectedId;
          const hasPlatinum = game.earned.platinum > 0;

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
                <span className='flex items-baseline gap-1.5'>
                  <span
                    className={`truncate transition-colors ${isSelected ? 'text-fg' : 'text-fg-soft group-hover:text-fg'}`}>
                    {game.name}
                  </span>
                  {hasPlatinum && (
                    <span className='glow shrink-0 text-platinum'>
                      {GRADE_MARK.platinum}
                    </span>
                  )}
                </span>
                <span className='mt-0.5 flex items-center gap-1.5 text-[10px] text-dim'>
                  <PlatformBadge platform={game.platform} />
                  <span className='truncate'>
                    {dateFormat(game.playedAt ?? game.lastPlayedAt)} ·{' '}
                    {playtimeFormat(game.playSeconds)}
                  </span>
                </span>
              </span>

              <span className='shrink-0 text-right text-[10px]'>
                <span className={progressTone(game.progress, hasPlatinum)}>
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
