import type { Trophy } from '../../shared/types.ts';
import {
  GRADE_COLOR,
  GRADE_MARK,
  barRender,
  dateFormat,
} from '../helpers/format.ts';

interface TrophyRowProps {
  note?: string;
  trophy: Trophy;
}

export const TrophyRow = ({ trophy, note }: TrophyRowProps) => (
  <li
    className={`flex items-center gap-3 border-line/60 border-b px-3 py-2 last:border-b-0 ${
      trophy.earned ? '' : 'opacity-45'
    }`}>
    <span
      className={`${GRADE_COLOR[trophy.grade]} ${trophy.earned ? 'glow' : ''} w-3 text-center`}>
      {GRADE_MARK[trophy.grade]}
    </span>

    <img
      alt=''
      className={`size-8 shrink-0 border border-line object-cover ${trophy.earned ? '' : 'grayscale'}`}
      height={32}
      loading='lazy'
      src={trophy.iconUrl}
      width={32}
    />

    <span className='min-w-0 flex-1'>
      <span className='block select-text truncate text-fg-soft'>
        {trophy.name}
      </span>
      <span className='block select-text truncate text-[12px] text-dim'>
        {note ?? trophy.detail}
      </span>
      {trophy.progress && !trophy.earned ? (
        <span className='block text-[12px] text-orange'>
          {barRender(trophy.progress.rate, 12)}
          <span className='ml-2 text-dim'>
            {trophy.progress.current}/{trophy.progress.target}
          </span>
        </span>
      ) : null}
    </span>

    <span className='shrink-0 text-right text-[12px] text-dim'>
      <span className='block'>{dateFormat(trophy.earnedAt)}</span>
      <span className='block text-mute'>{trophy.rarity}%</span>
    </span>
  </li>
);
