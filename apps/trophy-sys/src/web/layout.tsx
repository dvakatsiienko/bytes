import { Link, Outlet } from '@tanstack/react-router';

import { ProfileBar } from './components/profile-bar.tsx';
import { ThemeToggle } from './components/theme-toggle.tsx';
import { useGames, useProfile } from './hooks/queries.ts';

const TABS = [
  { label: 'library', to: '/library' },
  { label: 'stats', to: '/stats' },
  { label: 'news', to: '/news' },
] as const;

export const Layout = () => {
  const profile = useProfile();
  const games = useGames();

  const status =
    games.error?.message ??
    profile.error?.message ??
    `${games.data?.length ?? 0} titles synced`;

  return (
    <div className='flex h-full flex-col gap-5 p-6'>
      {/* Wrapping, because the row is a fixed set of controls plus a status
          string and there is no width at which truncating "news" is better than
          a second line. */}
      <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <h1 className='text-lg'>
          <Link
            className='glow cursor-pointer text-orange tracking-[0.3em] transition-colors hover:text-yellow focus-visible:outline focus-visible:outline-orange'
            to='/'>
            TROPHY.SYS
          </Link>
        </h1>

        <nav className='flex gap-1'>
          {TABS.map((tab) => (
            <Link
              activeProps={{ className: 'border-orange text-orange' }}
              className='cursor-pointer border border-line px-3 py-1 text-[12px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-dim hover:text-fg-soft'
              key={tab.to}
              to={tab.to}>
              {tab.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        <span className='ml-auto text-[12px] text-dim'>{status}</span>
      </div>

      <ProfileBar profile={profile.data ?? null} />

      <Outlet />
    </div>
  );
};
