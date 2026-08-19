import { useState } from 'react';

export const ThemeScope = (props: ThemeScopeProps) => {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');

  return (
    <div
      className='-mx-6 rounded-xl px-6 py-8 transition-colors'
      data-mode={mode}
      data-proto-theme='memory-viz'>
      <div className='mb-6 flex justify-end'>
        <button
          className='rounded-full border px-3 py-1 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest hover:text-foreground'
          onClick={() => {
            setMode(mode === 'dark' ? 'light' : 'dark');
          }}
          type='button'>
          {mode === 'dark' ? '☾ dark' : '☀ light'}
        </button>
      </div>
      {props.children}
    </div>
  );
};

/* Types */
interface ThemeScopeProps {
  children: React.ReactNode;
}
