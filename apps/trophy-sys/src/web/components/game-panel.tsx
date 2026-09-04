import { type ReactNode, useMemo, useState } from 'react';

import type { GameDetail, Trophy, TrophyGroup } from '../../shared/types.ts';
import { GRADE_MARK, barRender, progressTone } from '../helpers/format.ts';
import {
  EARNED_MODE_HINT,
  EARNED_MODE_LABEL,
  EARNED_MODE_ORDER,
  type EarnedMode,
  TROPHY_SORT_HINT,
  TROPHY_SORT_LABEL,
  TROPHY_SORT_ORDER,
  type TrophySort,
  trophiesArrange,
} from '../helpers/trophy-sort.ts';
import { useStored } from '../hooks/use-stored.ts';
import { PlatformBadge } from './platform-badge.tsx';
import { SelectControl } from './select-control.tsx';
import { TrophyRow } from './trophy-row.tsx';

export const GamePanel = (props: GamePanelProps) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useStored<TrophySort>(
    'trophy-sort',
    'easiest',
    TROPHY_SORT_ORDER,
  );
  const [earnedMode, setEarnedMode] = useStored<EarnedMode>(
    'trophy-earned-mode',
    'mixed',
    EARNED_MODE_ORDER,
  );

  const needle = query.trim().toLowerCase();

  const shown = useMemo(() => {
    // Description too, not just name — "collect" finds the collectathons.
    const matches = (trophy: Trophy) =>
      !needle ||
      trophy.name.toLowerCase().includes(needle) ||
      trophy.detail.toLowerCase().includes(needle);

    return trophiesArrange(
      (props.game?.trophies ?? []).filter(matches),
      sort,
      earnedMode,
    );
  }, [props.game, needle, sort, earnedMode]);

  if (props.error) return <Shell>error · {props.error}</Shell>;
  if (!props.game) return <Shell>loading trophy set…</Shell>;

  const hasPlatinum = props.game.earned.platinum > 0;

  return (
    <section className='panel flex min-h-0 min-w-0 flex-col'>
      <span className='panel-title select-text'>{props.game.name}</span>

      <div className='flex items-center gap-4 border-line border-b px-4 py-3'>
        <img
          alt=''
          className='size-14 border border-line bg-bg-soft object-contain'
          height={56}
          src={props.game.iconUrl}
          width={56}
        />

        <div className='min-w-0'>
          <p className='flex items-baseline gap-2'>
            <span className='glow select-text truncate text-base text-orange'>
              {props.game.name}
            </span>
            {hasPlatinum && (
              <span className='glow shrink-0 text-platinum text-sm'>
                {GRADE_MARK.platinum}
              </span>
            )}
          </p>
          <p className='mt-1 flex items-center gap-1.5 text-[12px] text-dim'>
            <PlatformBadge platform={props.game.platform} />
            {hasPlatinum && (
              <span className='shrink-0 border border-platinum/50 bg-platinum/10 px-1 py-px text-[12px] text-platinum leading-none tracking-[0.12em]'>
                PLATINUM
              </span>
            )}
            <span>
              {props.game.earned.bronze +
                props.game.earned.silver +
                props.game.earned.gold +
                props.game.earned.platinum}
              /
              {props.game.defined.bronze +
                props.game.defined.silver +
                props.game.defined.gold +
                props.game.defined.platinum}{' '}
              trophies
            </span>
          </p>
        </div>

        <div className='ml-auto shrink-0 text-right text-[12px]'>
          <span className={progressTone(props.game.progress)}>
            {barRender(props.game.progress, 18)}
          </span>
          <span className='block text-dim'>{props.game.progress}%</span>
        </div>
      </div>

      <div className='flex items-center gap-2 border-line border-b px-4 py-2'>
        <input
          className='hint min-w-0 flex-1 border border-line bg-bg-soft px-2 py-1 text-[12px] text-fg placeholder:text-dim focus:border-orange focus:outline-none'
          data-hint='Filters trophies by name and description.'
          onChange={(event) => setQuery(event.target.value)}
          placeholder='filter trophies…'
          type='search'
          value={query}
        />
        <SelectControl
          className='shrink-0'
          hint={TROPHY_SORT_HINT[sort]}
          labels={TROPHY_SORT_LABEL}
          onChange={setSort}
          options={TROPHY_SORT_ORDER}
          value={sort}
        />

        <SelectControl
          className='shrink-0'
          hint={EARNED_MODE_HINT[earnedMode]}
          labels={EARNED_MODE_LABEL}
          onChange={setEarnedMode}
          options={EARNED_MODE_ORDER}
          value={earnedMode}
        />
      </div>

      {shown.length !== props.game.trophies.length && (
        <div className='border-line border-b px-4 py-1 text-[12px] text-dim'>
          showing {shown.length} of {props.game.trophies.length}
        </div>
      )}

      <div className='min-h-0 flex-1 overflow-y-auto'>
        {props.game.groups.length > 1 ? (
          props.game.groups.map((group) => {
            const inGroup = shown.filter((trophy) => trophy.group === group.id);
            // A section with nothing left would leave a stranded header.
            if (inGroup.length === 0) return null;

            return (
              <GroupSection group={group} key={group.id} trophies={inGroup} />
            );
          })
        ) : (
          <ul>
            {shown.map((trophy) => {
              return <TrophyRow key={trophy.id} trophy={trophy} />;
            })}
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
  const countOf = (counts: TrophyGroup['earned']) =>
    counts.bronze + counts.silver + counts.gold + counts.platinum;

  // Counts come from the group, not the rendered rows — a search filters the
  // rows but must not rewrite the group's completion figure.
  const earned = countOf(group.earned);
  const defined = countOf(group.defined);

  return (
    <>
      <header className='sticky top-0 z-10 flex items-center gap-3 border-line border-y bg-bg-lift px-4 py-1.5 text-[12px]'>
        <span className='select-text truncate text-orange uppercase tracking-[0.15em]'>
          {group.id === 'default' ? 'base game' : group.name}
        </span>
        <span className='shrink-0 text-mute'>
          {earned} of {defined}
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
        {trophies.map((trophy) => {
          return <TrophyRow key={trophy.id} trophy={trophy} />;
        })}
      </ul>
    </>
  );
};

const Shell = ({ children }: { children: ReactNode }) => (
  <section className='panel grid place-items-center text-dim'>
    {children}
  </section>
);

/* Types */
interface GamePanelProps {
  error: string | null;
  game: GameDetail | null;
}
