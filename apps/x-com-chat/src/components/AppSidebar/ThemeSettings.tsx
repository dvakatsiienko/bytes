'use client';

import { useState } from 'react';
import useEventListener from '@use-it/event-listener';
import { useTheme } from 'next-themes';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { cn } from '@/utils/cn';
import { useIsMounted } from '@/hooks/useIsMounted';

import {
  type AppColorPreset,
  colorPresetList,
  colorPresetValueList,
  themeList,
} from './config';

export const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();

  const [isMounted] = useIsMounted();
  const [colorPreset, setColorPreset] = useState<AppColorPreset>('brand');

  const selectTheme = (value: string) => {
    if (value === theme || !value) return null;

    return setTheme(value);
  };

  function selectPreset(selectedColorPreset: AppColorPreset) {
    if (
      selectedColorPreset === colorPreset ||
      !colorPreset ||
      !selectedColorPreset
    )
      return null;

    setColorPreset(selectedColorPreset);
    replacePresetCnOnRoot(colorPreset, selectedColorPreset);
  }

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey && !e.shiftKey && e.key === 'p') {
      e?.preventDefault();

      const idx = themeList.findIndex((t) => t.value === theme);
      const nextTheme = themeList[(idx + 1) % themeList.length];

      setTheme(nextTheme.value);
    }

    if (e.metaKey && e.shiftKey && e.key === 'p') {
      e?.preventDefault();

      const idx = colorPresetValueList.indexOf(colorPreset);
      const nextPreset =
        colorPresetValueList[(idx + 1) % colorPresetValueList.length];

      setColorPreset(nextPreset);
      replacePresetCnOnRoot(colorPreset, nextPreset);
    }
  });

  const replacePresetCnOnRoot = (
    prevPreset: AppColorPreset,
    nextPreset: AppColorPreset,
  ) => {
    if (!prevPreset || !nextPreset) return null;
    const root = document.documentElement;
    root.classList.remove(prevPreset);
    root.classList.add(nextPreset);
  };

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

          <span className={settingNameCn}>{colorPreset} color</span>
          <ToggleGroup
            className={cn(settingGroupCn)}
            defaultValue={colorPreset}
            onValueChange={(value) => selectPreset(value as AppColorPreset)}
            type='single'
            value={colorPreset}
            variant='outline'>
            {colorPresetList.map((preset) => (
              <ToggleGroupItem
                className={settingItemCn}
                key={preset.value}
                size='sm'
                value={preset.value}
                variant='outline'>
                <span className={cn('size-4 rounded-full', preset.color)} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </>
      )}
    </section>
  );
};
