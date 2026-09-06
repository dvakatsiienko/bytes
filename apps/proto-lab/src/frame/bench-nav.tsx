import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';

export const BenchNav = (props: BenchNavProps) => {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const laneListJSX = props.laneList.map((lane) => {
    return (
      <Link
        activeProps={{ className: 'text-foreground underline' }}
        className='rounded-sm px-2 py-1 font-mono text-muted-foreground text-sm underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'
        key={lane}
        params={{ lane }}
        to='/bench/$lane'>
        {lane}
      </Link>
    );
  });

  return (
    <nav className='border-b bg-card/60 backdrop-blur'>
      <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-6 py-2'>
        <span className='mr-2 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
          bench
        </span>
        {laneListJSX}
        <button
          aria-label={`switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className='ml-auto cursor-pointer select-none rounded-sm border px-3 py-1 font-mono text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring'
          onClick={() => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
          type='button'>
          {theme === 'dark' ? '☾ dark' : '☀ light'}
        </button>
      </div>
    </nav>
  );
};

/* Helpers */
const readInitialTheme = (): Theme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

/* Types */
interface BenchNavProps {
  laneList: string[];
}

type Theme = 'dark' | 'light';
