import { Fragment, useState } from 'react';

// Three states, not two: a plain light/dark switch strands you with no way to
// hand control back to the OS. Real radios, so arrow keys work.
export const ThemeToggle = () => {
  const [theme, setTheme] = useState(themeRead);

  const optionListJSX = themeOptions.map((option, index) => {
    const isActive = option.value === theme;

    return (
      <Fragment key={option.value}>
        {index > 0 ? (
          <span aria-hidden='true' className='text-line'>
            ·
          </span>
        ) : null}
        <label
          className={`inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center px-1.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
            isActive
              ? 'text-primary underline underline-offset-4'
              : 'text-mute hover:text-fg-soft'
          }`}
          title={option.hint}>
          <input
            checked={isActive}
            className='sr-only'
            name='theme'
            onChange={() => {
              themeApply(option.value);
              setTheme(option.value);
            }}
            type='radio'
            value={option.value}
          />
          {option.label}
        </label>
      </Fragment>
    );
  });

  return (
    <div
      aria-label='Colour theme'
      className='flex items-center gap-0.5 text-xs'
      role='radiogroup'>
      {optionListJSX}
    </div>
  );
};

/* Helpers */
const themeOptions = [
  { hint: 'Light palette, pinned', label: 'L', value: 'light' },
  { hint: 'Dark palette, pinned', label: 'D', value: 'dark' },
  { hint: 'Follows your OS appearance', label: 'S', value: 'system' },
] as const satisfies readonly ThemeOption[];

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
