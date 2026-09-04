import { Fragment, useState } from 'react';

/**
 * One bordered unit with three cells, deliberately unlike the nav buttons —
 * those are three separate boxes, this is one instrument. Three states, not
 * two: a plain light/dark switch strands you with no way to hand control back
 * to the OS once you have clicked it. Real radios, so arrow keys work.
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState(themeRead);

  const optionListJSX = THEME_OPTIONS.map((option, index) => {
    const isActive = option.value === theme;

    return (
      <Fragment key={option.value}>
        {index > 0 && (
          <span aria-hidden='true' className='text-line'>
            •
          </span>
        )}
        <label
          // hint-right: this control sits at the end of the header row, and a
          // left-anchored 15rem hint hangs 108px past a 390px viewport — which
          // the page then scrolls to, because an absolutely positioned
          // pseudo-element still counts toward the document's scroll width.
          className={`hint hint-right cursor-pointer px-1 text-[12px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-orange ${
            isActive ? 'glow text-orange' : 'text-dim hover:text-fg-soft'
          }`}
          data-hint={option.hint}>
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
      className='flex items-center border border-line px-2 py-1'
      role='radiogroup'>
      {optionListJSX}
    </div>
  );
};

/* Helpers */
const THEME_OPTIONS = [
  { hint: 'Light palette, pinned.', label: 'L', value: 'light' },
  { hint: 'Dark palette, pinned.', label: 'D', value: 'dark' },
  { hint: 'Follows your OS appearance.', label: 'S', value: 'system' },
] as const satisfies readonly ThemeOption[];

const themeRead = (): Theme => {
  const stored = localStorage.getItem('theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const themeApply = (theme: Theme) => {
  if (theme === 'system') {
    localStorage.removeItem('theme');
    delete document.documentElement.dataset.theme;
    return;
  }

  localStorage.setItem('theme', theme);
  document.documentElement.dataset.theme = theme;
};

/* Types */
interface ThemeOption {
  hint: string;
  label: string;
  value: Theme;
}

type Theme = 'dark' | 'light' | 'system';
