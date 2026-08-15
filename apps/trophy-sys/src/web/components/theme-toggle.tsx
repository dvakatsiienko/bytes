import { useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

const LABEL: Record<Theme, string> = {
  dark: 'drk',
  light: 'lgt',
  system: 'sys',
};

const HINT: Record<Theme, string> = {
  dark: 'Dark palette, pinned. Click for system.',
  light: 'Light palette, pinned. Click for dark.',
  system: 'Following your OS appearance. Click to pin light.',
};

/**
 * Three states, not two: a plain light/dark switch strands you with no way to
 * hand control back to the OS once you have clicked it.
 */
const NEXT: Record<Theme, Theme> = {
  dark: 'system',
  light: 'dark',
  system: 'light',
};

const themeRead = (): Theme => {
  const stored = localStorage.getItem('theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(themeRead);

  const cycle = () => {
    const next = NEXT[theme];

    if (next === 'system') {
      localStorage.removeItem('theme');
      delete document.documentElement.dataset.theme;
    } else {
      localStorage.setItem('theme', next);
      document.documentElement.dataset.theme = next;
    }

    setTheme(next);
  };

  return (
    <button
      className='hint cursor-pointer border border-line px-2 py-1 text-[11px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange'
      data-hint={HINT[theme]}
      onClick={cycle}
      type='button'>
      {LABEL[theme]}
    </button>
  );
};
