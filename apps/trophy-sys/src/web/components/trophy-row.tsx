import type { Trophy } from '../../shared/types.ts';
import {
  GRADE_COLOR,
  GRADE_MARK,
  barRender,
  dateFormat,
} from '../helpers/format.ts';

export const TrophyRow = (props: TrophyRowProps) => (
  <li
    className={`flex items-center gap-3 border-line/60 border-b px-3 py-2 last:border-b-0 ${
      props.trophy.earned ? '' : 'opacity-45'
    }`}>
    <span
      className={`${GRADE_COLOR[props.trophy.grade]} ${props.trophy.earned ? 'glow' : ''} w-3 text-center`}>
      {GRADE_MARK[props.trophy.grade]}
    </span>

    <img
      alt=''
      className={`size-8 shrink-0 border border-line object-cover ${props.trophy.earned ? '' : 'grayscale'}`}
      height={32}
      loading='lazy'
      src={props.trophy.iconUrl}
      width={32}
    />

    <span className='min-w-0 flex-1'>
      <span className='block select-text truncate text-fg-soft'>
        {props.trophy.name}
      </span>
      <span className='block select-text truncate text-[12px] text-dim'>
        {props.note ?? props.trophy.detail}
      </span>
      {props.trophy.progress && !props.trophy.earned ? (
        <span className='block text-[12px] text-orange'>
          {barRender(props.trophy.progress.rate, 12)}
          <span className='ml-2 text-dim'>
            {props.trophy.progress.current}/{props.trophy.progress.target}
          </span>
        </span>
      ) : null}
    </span>

    <span className='shrink-0 text-right text-[12px] text-dim'>
      <span className='block'>{dateFormat(props.trophy.earnedAt)}</span>
      <span className='block text-mute'>{props.trophy.rarity}%</span>
    </span>
  </li>
);

/* Types */
interface TrophyRowProps {
  note?: string;
  trophy: Trophy;
}
