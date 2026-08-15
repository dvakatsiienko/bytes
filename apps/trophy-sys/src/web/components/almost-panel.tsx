import type { AlmostFeed } from '../../shared/types.ts';
import { TrophyRow } from './trophy-row.tsx';

interface AlmostPanelProps {
  almost: AlmostFeed | null;
  error: string | null;
}

export const AlmostPanel = ({ almost, error }: AlmostPanelProps) => (
  <section className='panel flex min-h-0 flex-col'>
    <span className='panel-title'>almost there</span>

    {error && <p className='p-4 text-red'>error · {error}</p>}
    {!(almost || error) && (
      <p className='p-4 text-dim'>scanning unfinished titles…</p>
    )}
    {almost?.trophies.length === 0 && (
      <p className='p-4 text-dim'>nothing started. go grind something.</p>
    )}

    <ul className='min-h-0 flex-1 overflow-y-auto'>
      {almost?.trophies.map((trophy) => (
        <TrophyRow
          key={`${trophy.gameId}-${trophy.id}`}
          note={trophy.gameName}
          trophy={trophy}
        />
      ))}
    </ul>
  </section>
);
