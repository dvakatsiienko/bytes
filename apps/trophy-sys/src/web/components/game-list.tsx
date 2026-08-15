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
            className={`flex w-full items-center gap-3 border-line/60 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 ${
              isSelected ? 'bg-bg-lift' : 'hover:bg-bg-soft'
            }`}
            key={game.id}
            onClick={() => onSelect(game.id)}
            type='button'>
            <span className={isSelected ? 'text-orange' : 'text-dim'}>
              {isSelected ? '▶' : ' '}
            </span>

            <img
              alt=''
              className='size-9 shrink-0 border border-line object-cover grayscale-[35%]'
              height={36}
              loading='lazy'
              src={game.iconUrl}
              width={36}
            />

            <span className='min-w-0 flex-1'>
              <span
                className={`block truncate ${isSelected ? 'text-fg' : 'text-fg-soft'}`}>
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
