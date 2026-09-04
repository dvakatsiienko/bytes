import { useMemo, useState } from 'react';

import type { Game } from '../../shared/types.ts';
import {
  GRADE_MARK,
  PLAYTIME_MISSING_HINT,
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
} from '../helpers/game-sort.ts';
import { PlatformBadge } from './platform-badge.tsx';
import { SelectControl } from './select-control.tsx';

export const GameList = (props: GameListProps) => {
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return props.games;

    return props.games.filter((game) =>
      game.name.toLowerCase().includes(needle),
    );
  }, [props.games, query]);

  const gameListJSX = shown.map((game) => {
    const isSelected = game.id === props.selectedId;
    const hasPlatinum = game.earned.platinum > 0;
    // The row, not the dash, carries the hint: it is the only ancestor wide
    // enough for the tooltip to sit inside the list's overflow-auto column,
    // and it is already focusable, so the hint reaches the keyboard too.
    const missingPlaytime = game.playSeconds === null;

    return (
      <button
        className={`group flex w-full cursor-pointer items-center gap-3 border-line/60 border-b border-l-2 px-3 py-2.5 text-left transition-colors duration-150 last:border-b-0 ${
          isSelected
            ? 'border-l-orange bg-bg-lift'
            : 'border-l-transparent hover:border-l-dim hover:bg-bg-soft'
        } ${missingPlaytime ? 'hint' : ''}`}
        data-hint={missingPlaytime ? PLAYTIME_MISSING_HINT : undefined}
        key={game.id}
        onClick={() => props.onSelect(game.id)}
        type='button'>
        <span
          className={`transition-colors ${isSelected ? 'text-orange' : 'text-dim group-hover:text-fg-soft'}`}>
          {isSelected ? '▶' : '·'}
        </span>

        <img
          alt=''
          // contain, not cover: PSN serves square 512² art for some titles and a
          // 320×176 banner for others, and cover cuts ~45% off every banner.
          className={`size-9 shrink-0 border border-line bg-bg-soft object-contain transition-all duration-150 ${
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
              className={`select-text truncate transition-colors ${isSelected ? 'text-fg' : 'text-fg-soft group-hover:text-fg'}`}>
              {game.name}
            </span>
            {hasPlatinum && (
              <span className='glow shrink-0 text-platinum'>
                {GRADE_MARK.platinum}
              </span>
            )}
          </span>
          <span className='mt-0.5 flex items-center gap-1.5 text-[12px] text-dim'>
            <PlatformBadge platform={game.platform} />
            <span className='truncate'>
              {dateFormat(game.playedAt ?? game.lastPlayedAt)} ·{' '}
              <span
                className={
                  missingPlaytime
                    ? 'underline decoration-dotted underline-offset-2'
                    : ''
                }>
                {playtimeFormat(game.playSeconds)}
              </span>
            </span>
          </span>
        </span>

        <span className='shrink-0 text-right text-[12px]'>
          <span className={progressTone(game.progress)}>
            {barRender(game.progress, 10)}
          </span>
          <span className='block text-dim'>{game.progress}%</span>
        </span>
      </button>
    );
  });

  return (
    <nav className='panel flex min-h-0 min-w-0 flex-col'>
      <span className='panel-title'>
        library ·{' '}
        {shown.length === props.total
          ? props.total
          : `${shown.length} / ${props.total}`}
      </span>

      <div className='flex flex-col gap-2 border-line border-b px-3 py-2'>
        <input
          className='hint min-w-0 border border-line bg-bg-soft px-2 py-1 text-[12px] text-fg placeholder:text-dim focus:border-orange focus:outline-none'
          data-hint='Filters the list by title as you type.'
          onChange={(event) => setQuery(event.target.value)}
          placeholder='search titles…'
          type='search'
          value={query}
        />

        <div className='grid grid-cols-2 gap-2'>
          <SelectControl
            className='w-full'
            hint={GAME_SORT_HINT[props.sort]}
            labels={GAME_SORT_LABEL}
            onChange={props.onSortChange}
            options={GAME_SORT_ORDER}
            value={props.sort}
          />

          <SelectControl
            className='w-full'
            hint={PLATINUM_MODE_HINT[props.platinum]}
            labels={PLATINUM_MODE_LABEL}
            onChange={props.onPlatinumChange}
            options={PLATINUM_MODE_ORDER}
            value={props.platinum}
          />
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto'>{gameListJSX}</div>
    </nav>
  );
};

/* Types */
interface GameListProps {
  /** Already arranged — the route owns the sort so it can pick a default game. */
  games: Game[];
  onPlatinumChange: (mode: PlatinumMode) => void;
  onSelect: (id: string) => void;
  onSortChange: (sort: GameSort) => void;
  platinum: PlatinumMode;
  selectedId: string | null;
  sort: GameSort;
  /** The unarranged count, so the header can say "12 / 40". */
  total: number;
}
