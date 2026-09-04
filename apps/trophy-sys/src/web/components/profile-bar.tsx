import type { Profile } from '../../shared/types.ts';
import { barRender } from '../helpers/format.ts';

const COUNTERS = [
  { color: 'text-platinum', key: 'platinum', label: 'PLT' },
  { color: 'text-gold', key: 'gold', label: 'GLD' },
  { color: 'text-silver', key: 'silver', label: 'SLV' },
  { color: 'text-bronze', key: 'bronze', label: 'BRZ' },
] as const;

export const ProfileBar = (props: ProfileBarProps) => (
  <header className='panel flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4'>
    <span className='panel-title'>profile</span>

    <div className='flex items-baseline gap-2'>
      <span className='text-[12px] text-mute tracking-[0.2em]'>LEVEL</span>
      <span className='glow select-text text-2xl text-orange leading-none'>
        {props.profile?.level ?? '--'}
      </span>
      <span className='text-[12px] text-dim'>
        tier {props.profile?.tier ?? '-'}
      </span>
    </div>

    <div className='flex items-center gap-2 text-[12px]'>
      <span className='text-yellow'>
        {barRender(props.profile?.levelProgress ?? 0, 16)}
      </span>
      <span className='text-dim'>{props.profile?.levelProgress ?? 0}%</span>
    </div>

    <div className='flex gap-5'>
      {COUNTERS.map(({ key, label, color }) => {
        return (
          <div className='flex items-baseline gap-1.5' key={key}>
            <span className='text-[12px] text-dim'>{label}</span>
            <span className={`${color} select-text text-base`}>
              {props.profile?.earned[key] ?? 0}
            </span>
          </div>
        );
      })}
    </div>

    <div className='ml-auto flex items-baseline gap-2'>
      <span className='text-[12px] text-dim tracking-[0.2em]'>TOTAL</span>
      <span className='text-base text-fg'>{props.profile?.total ?? 0}</span>
    </div>
  </header>
);

/* Types */
interface ProfileBarProps {
  profile: Profile | null;
}
