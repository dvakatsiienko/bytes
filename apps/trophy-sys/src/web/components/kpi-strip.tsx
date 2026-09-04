import type { ArchivedTrophy, Game, TrophyGrade } from '../../shared/types.ts';
import { GRADE_TONE } from '../helpers/chart-theme.ts';
import { countTotal } from '../helpers/stats.ts';

/** PSN's own flat points per grade — the number every trophy site shows. */
const FLAT_POINTS: Record<TrophyGrade, number> = {
  bronze: 15,
  gold: 90,
  platinum: 300,
  silver: 30,
};

/**
 * Our own difficulty score: every trophy is worth what its global rarity says
 * it cost, so a 1%-earned bronze outweighs a 60%-earned gold. PSN's flat table
 * cannot express that, which is the whole reason this sits beside it rather
 * than replacing it.
 */
const weightedScore = (trophies: ArchivedTrophy[]) =>
  Math.round(
    trophies.reduce((total, trophy) => total + (100 - trophy.rarity), 0),
  );

const flatScore = (trophies: ArchivedTrophy[]) =>
  trophies.reduce((total, trophy) => total + FLAT_POINTS[trophy.grade], 0);

export const KpiStrip = (props: KpiStripProps) => {
  const grades = props.trophies.reduce(
    (counts, trophy) => {
      counts[trophy.grade] += 1;
      return counts;
    },
    { bronze: 0, gold: 0, platinum: 0, silver: 0 },
  );

  const played = props.games.filter((game) => countTotal(game.earned) > 0);
  const completion = played.length
    ? played.reduce((total, game) => total + game.progress, 0) / played.length
    : 0;

  const flat = flatScore(props.trophies);
  const weighted = weightedScore(props.trophies);

  const tileListJSX = [
    { label: 'trophies', value: numberFormat(props.trophies.length) },
    { label: 'platinums', value: String(grades.platinum) },
    { label: 'titles played', value: String(played.length) },
    { label: 'avg completion', value: `${completion.toFixed(0)}%` },
    { label: 'psn points', value: numberFormat(flat) },
    {
      hint: `Σ(100 − rarity) · ${(weighted / Math.max(flat, 1)).toFixed(2)}× the flat score`,
      label: 'rarity score',
      value: numberFormat(weighted),
    },
  ].map((tile) => {
    return (
      <div className='flex flex-col gap-0.5 px-4 py-2' key={tile.label}>
        <span className='text-[12px] text-mute uppercase tracking-[0.14em]'>
          {tile.label}
        </span>
        <span className='select-text text-fg text-lg tabular-nums leading-none'>
          {tile.value}
        </span>
        {tile.hint && <span className='text-[12px] text-dim'>{tile.hint}</span>}
      </div>
    );
  });

  const gradeListJSX = (['platinum', 'gold', 'silver', 'bronze'] as const).map(
    (grade) => (
      <span className='flex items-baseline gap-1' key={grade}>
        <span style={{ color: GRADE_TONE[grade] }}>
          {grade === 'platinum' ? '◆' : '●'}
        </span>
        <span className='select-text tabular-nums'>{grades[grade]}</span>
      </span>
    ),
  );

  return (
    <section className='panel'>
      <span className='panel-title'>totals</span>

      <div className='flex flex-wrap items-center divide-line/60 sm:divide-x'>
        {tileListJSX}

        <div className='flex flex-col gap-1 px-4 py-2'>
          <span className='text-[12px] text-mute uppercase tracking-[0.14em]'>
            grade split
          </span>
          <div className='flex gap-3 text-[12px] text-fg-soft'>
            {gradeListJSX}
          </div>
        </div>
      </div>
    </section>
  );
};

/* Helpers */
const numberFormat = (value: number) =>
  value.toLocaleString('en-US').replace(/,/g, ' ');

/* Types */
interface KpiStripProps {
  games: Game[];
  trophies: ArchivedTrophy[];
}
