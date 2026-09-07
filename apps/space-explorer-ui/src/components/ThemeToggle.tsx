import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';

// Three states, not two: a plain light/dark switch strands you with no way to
// hand control back to the OS.
export const ThemeToggle = () => {
  const [theme, setTheme] = useState(themeRead);

  // "auto" resolved prefers-color-scheme once, on click. Flipping the OS
  // appearance with auto selected then left the page on the stale palette until
  // a reload — the one thing that option exists to do.
  useEffect(() => {
    if (theme !== 'system') return;

    const query = matchMedia('(prefers-color-scheme: dark)');
    const follow = () => themeApply('system');

    query.addEventListener('change', follow);
    return () => query.removeEventListener('change', follow);
  }, [theme]);

  const optionListJSX = themeOptions.map((option) => {
    return (
      <ToggleGroupItem
        aria-label={option.hint}
        className='px-3 text-xs uppercase tracking-[0.18em] aria-pressed:bg-bg-lift aria-pressed:text-primary'
        key={option.value}
        title={option.hint}
        value={option.value}>
        {option.label}
      </ToggleGroupItem>
    );
  });

  return (
    <ToggleGroup
      aria-label='Colour theme'
      onValueChange={(value: string[]) => {
        const [next] = value;
        if (!isTheme(next)) return;
        themeApply(next);
        setTheme(next);
      }}
      size='sm'
      spacing={0}
      value={[theme]}
      variant='outline'>
      {optionListJSX}
    </ToggleGroup>
  );
};

/* Helpers */
const themeOptions = [
  { hint: 'Light palette, pinned', label: 'light', value: 'light' },
  { hint: 'Dark palette, pinned', label: 'dark', value: 'dark' },
  { hint: 'Follows your OS appearance', label: 'auto', value: 'system' },
] as const satisfies readonly ThemeOption[];

const isTheme = (value: unknown): value is Theme => {
  return value === 'light' || value === 'dark' || value === 'system';
};

const themeRead = (): Theme => {
  const stored = localStorage.getItem('theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const themeApply = (theme: Theme) => {
  if (theme === 'system') localStorage.removeItem('theme');
  else localStorage.setItem('theme', theme);

  const wantsDark =
    theme === 'dark' ||
    (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', wantsDark);
};

/* Types */
interface ThemeOption {
  hint: string;
  label: string;
  value: Theme;
}

type Theme = 'dark' | 'light' | 'system';
