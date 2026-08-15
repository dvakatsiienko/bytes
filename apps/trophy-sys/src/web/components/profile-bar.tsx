import type { Profile } from '../../shared/types.ts';
import { barRender } from '../helpers/format.ts';

interface ProfileBarProps {
  profile: Profile | null;
}

const COUNTERS = [
  { color: 'text-platinum', key: 'platinum', label: 'PLT' },
  { color: 'text-gold', key: 'gold', label: 'GLD' },
  { color: 'text-silver', key: 'silver', label: 'SLV' },
  { color: 'text-bronze', key: 'bronze', label: 'BRZ' },
] as const;

export const ProfileBar = ({ profile }: ProfileBarProps) => (
  <header className='panel flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4'>
    <span className='panel-title'>profile</span>

    <div className='flex items-baseline gap-2'>
      <span className='text-[10px] text-mute tracking-[0.2em]'>LEVEL</span>
      <span className='glow text-2xl text-orange leading-none'>
        {profile?.level ?? '--'}
      </span>
      <span className='text-[11px] text-dim'>tier {profile?.tier ?? '-'}</span>
    </div>

    <div className='flex items-center gap-2 text-[11px]'>
      <span className='text-yellow'>
        {barRender(profile?.levelProgress ?? 0, 16)}
      </span>
      <span className='text-dim'>{profile?.levelProgress ?? 0}%</span>
    </div>

    <div className='flex gap-5'>
      {COUNTERS.map(({ key, label, color }) => (
        <div className='flex items-baseline gap-1.5' key={key}>
          <span className='text-[10px] text-dim'>{label}</span>
          <span className={`${color} text-base`}>
            {profile?.earned[key] ?? 0}
          </span>
        </div>
      ))}
    </div>

    <div className='ml-auto flex items-baseline gap-2'>
      <span className='text-[10px] text-dim tracking-[0.2em]'>TOTAL</span>
      <span className='text-base text-fg'>{profile?.total ?? 0}</span>
    </div>
  </header>
);
