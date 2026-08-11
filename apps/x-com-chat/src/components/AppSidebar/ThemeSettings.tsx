'use client';

import useEventListener from '@use-it/event-listener';
import { useTheme } from 'next-themes';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { cn } from '@/utils/cn';
import { useIsMounted } from '@/hooks/useIsMounted';

import { themeList } from './config';

export const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  const [isMounted] = useIsMounted();

  const selectTheme = (value: string) => {
    if (value === theme || !value) return null;

    return setTheme(value);
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
            defaultValue={theme}
            onValueChange={selectTheme}
            type='single'
            value={theme}
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
