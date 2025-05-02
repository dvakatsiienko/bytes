'use client';

/* Core */
import { useState } from 'react';
import { useTheme } from 'next-themes';
import useEventListener from '@use-it/event-listener';

/* Components */
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

/* Instruments */
import { cn } from '@/utils/cn';
import { useIsMounted } from '@/hooks/useIsMounted';
import { themeList, colorPresetList, colorPresetValueList, type AppColorPreset } from './config';

export const ThemeSettings = () => {
    const { theme, setTheme } = useTheme();

    const [isMounted] = useIsMounted();
    const [colorPreset, setColorPreset] = useState<AppColorPreset>('brand');

    const selectTheme = (value: string) => {
        if (value === theme || !value) return null;

        return setTheme(value);
    };

    function selectPreset(selectedColorPreset: AppColorPreset) {
        if (selectedColorPreset === colorPreset || !colorPreset || !selectedColorPreset)
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
            const nextPreset = colorPresetValueList[(idx + 1) % colorPresetValueList.length];

            setColorPreset(nextPreset);
            replacePresetCnOnRoot(colorPreset, nextPreset);
        }
    });

    const replacePresetCnOnRoot = (prevPreset: AppColorPreset, nextPreset: AppColorPreset) => {
        if (!prevPreset || !nextPreset) return null;
        const root = document.documentElement;
        root.classList.remove(prevPreset);
        root.classList.add(nextPreset);
    };

    // todo refactor
    const settingNameCn = cn('mb-1 place-self-center text-xs text-muted-foreground');
    const settingGroupCn = cn('w-full');
    const settingItemCn = cn('place-self-end');

    return (
        <section className='grid place-items-center'>
            {isMounted && (
                <>
                    <span className={settingNameCn}>{theme} theme</span>
                    <ToggleGroup
                        variant='outline'
                        className={cn(settingGroupCn, 'mb-4')}
                        value={theme}
                        type='single'
                        defaultValue={theme}
                        onValueChange={selectTheme}>
                        {themeList.map((theme) => (
                            <ToggleGroupItem
                                variant='outline'
                                size='sm'
                                className={settingItemCn}
                                key={theme.value}
                                value={theme.value}>
                                {theme.icon}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    <span className={settingNameCn}>{colorPreset} color</span>
                    <ToggleGroup
                        value={colorPreset}
                        type='single'
                        variant='outline'
                        defaultValue={colorPreset}
                        className={cn(settingGroupCn)}
                        onValueChange={(value) => selectPreset(value as AppColorPreset)}>
                        {colorPresetList.map((preset) => (
                            <ToggleGroupItem
                                variant='outline'
                                size='sm'
                                className={settingItemCn}
                                key={preset.value}
                                value={preset.value}>
                                <span className={cn('size-4 rounded-full', preset.color)} />
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </>
            )}
        </section>
    );
};
