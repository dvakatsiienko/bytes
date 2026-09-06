'use client';

import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';
import { cn } from '@ui/kit/lib/utils';
import useEventListener from '@use-it/event-listener';
import { useTheme } from 'next-themes';

import { useIsMounted } from '@/hooks/useIsMounted';

import { themeList } from './config';

export const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  const [isMounted] = useIsMounted();

  const selectTheme = (value: string[]) => {
    const [next] = value;
    if (!next || next === theme) return;

    setTheme(next);
  };

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey && !e.shiftKey && e.key === 'p') {
      e?.preventDefault();

      const idx = themeList.findIndex((t) => t.value === theme);
      const nextTheme = themeList[(idx + 1) % themeList.length];

      setTheme(nextTheme.value);
    }
  });

  // todo refactor
  const settingNameCn = cn(
    'mb-1 place-self-center text-muted-foreground text-xs',
  );
  const settingGroupCn = cn('w-full');
  const settingItemCn = cn('place-self-end');

  return (
    <section className='grid place-items-center'>
      {isMounted && (
        <>
          <span className={settingNameCn}>{theme} theme</span>
          <ToggleGroup
            className={cn(settingGroupCn, 'mb-4')}
            onValueChange={selectTheme}
            value={theme ? [theme] : []}
            variant='outline'>
            {themeList.map((themeItem) => (
              <ToggleGroupItem
                className={settingItemCn}
                key={themeItem.value}
                size='sm'
                value={themeItem.value}
                variant='outline'>
                {themeItem.icon}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      )}
    </section>
  );
};
