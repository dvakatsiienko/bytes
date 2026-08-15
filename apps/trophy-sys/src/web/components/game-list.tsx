import type { Game } from '../../shared/types.ts';
import { barRender, dateFormat } from '../helpers/format.ts';

interface GameListProps {
  games: Game[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const GameList = ({ games, selectedId, onSelect }: GameListProps) => (
  <nav className='panel flex min-h-0 flex-col'>
    <span className='panel-title'>library · {games.length}</span>

    <div className='min-h-0 flex-1 overflow-y-auto'>
      {games.map((game) => {
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
                {game.platform} · {dateFormat(game.lastPlayedAt)}
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
