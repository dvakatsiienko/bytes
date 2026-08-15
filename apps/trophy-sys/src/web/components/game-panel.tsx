import type { GameDetail, Trophy, TrophyGroup } from '../../shared/types.ts';
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

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {game.groups.length > 1 ? (
          game.groups.map((group) => (
            <GroupSection
              group={group}
              key={group.id}
              trophies={game.trophies.filter(
                (trophy) => trophy.group === group.id,
              )}
            />
          ))
        ) : (
          <ul>
            {game.trophies.map((trophy) => (
              <TrophyRow key={trophy.id} trophy={trophy} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

const GroupSection = ({
  group,
  trophies,
}: {
  group: TrophyGroup;
  trophies: Trophy[];
}) => {
  const earned =
    group.earned.bronze +
    group.earned.silver +
    group.earned.gold +
    group.earned.platinum;

  return (
    <>
      <header className='sticky top-0 z-10 flex items-center gap-3 border-line border-y bg-bg-lift px-4 py-1.5 text-[10px]'>
        <span className='truncate text-orange uppercase tracking-[0.15em]'>
          {group.id === 'default' ? 'base game' : group.name}
        </span>
        <span className='shrink-0 text-mute'>
          {earned} of {trophies.length}
        </span>

        <span className='ml-auto flex shrink-0 items-center gap-2'>
          <span
            className={group.progress === 100 ? 'text-green' : 'text-yellow'}>
            {barRender(group.progress, 10)}
          </span>
          <span className='w-8 text-right text-dim'>{group.progress}%</span>
        </span>
      </header>

      <ul>
        {trophies.map((trophy) => (
          <TrophyRow key={trophy.id} trophy={trophy} />
        ))}
      </ul>
    </>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <section className='panel grid place-items-center text-dim'>
    {children}
  </section>
);
