import type { GameDetail } from '../../shared/types.ts';
import { barRender } from '../helpers/format.ts';
import { TrophyRow } from './trophy-row.tsx';

interface GamePanelProps {
  error: string | null;
  game: GameDetail | null;
}

export const GamePanel = ({ game, error }: GamePanelProps) => {
  if (error) return <Shell>error · {error}</Shell>;
  if (!game) return <Shell>loading trophy set…</Shell>;

  return (
    <section className='panel flex min-h-0 flex-col'>
      <span className='panel-title'>{game.name}</span>

      <div className='flex items-center gap-4 border-line border-b px-4 py-3'>
        <img
          alt=''
          className='size-14 border border-line object-cover'
          height={56}
          src={game.iconUrl}
          width={56}
        />

        <div className='min-w-0'>
          <p className='glow truncate text-base text-orange'>{game.name}</p>
          <p className='text-[11px] text-dim'>
            {game.platform} ·{' '}
            {game.earned.bronze +
              game.earned.silver +
              game.earned.gold +
              game.earned.platinum}
            /
            {game.defined.bronze +
              game.defined.silver +
              game.defined.gold +
              game.defined.platinum}{' '}
            trophies
          </p>
        </div>

        <div className='ml-auto shrink-0 text-right text-[11px]'>
          <span
            className={game.progress === 100 ? 'text-green' : 'text-yellow'}>
            {barRender(game.progress, 18)}
          </span>
          <span className='block text-dim'>{game.progress}%</span>
        </div>
      </div>

      <ul className='min-h-0 flex-1 overflow-y-auto'>
        {game.trophies.map((trophy) => (
          <TrophyRow key={trophy.id} trophy={trophy} />
        ))}
      </ul>
    </section>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section className='panel grid place-items-center text-dim'>
    {children}
  </section>
);
