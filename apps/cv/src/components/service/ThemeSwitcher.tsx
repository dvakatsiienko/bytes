'use client';


import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';


import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';


import { cn } from '@ui/kit/lib/utils';
import { useIsMounted } from '@ui/kit/hooks/useIsMounted';

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
    const [mounted] = useIsMounted();
    const { setTheme, theme } = useTheme();

    if (!mounted) return null;

    const applyTheme = (value: string): void => setTheme(value);

    const themeGroupItemListJSX = themeList.map((themePreset) => (
        <ToggleGroupItem
            className={cn(
                'grid h-6 items-center',
                'text-center font-semibold text-gray-600 text-xs dark:text-gray-400 dark:hover:text-link',
                'cursor-pointer',
                themePreset.value === theme && 'text-link!',

                // Todo put into theme
                'bg-background',
            )}
            key={themePreset.value}
            value={themePreset.value}
            aria-label={themePreset.label}>
            {themePreset.icon}
        </ToggleGroupItem>
    ));

    return (
        <ToggleGroup
            type='single'
            value={theme}
            onValueChange={applyTheme}
            defaultValue='light'
            className={cn(
                'p-[0px]',
                props.className,
                //
            )}>
            {themeGroupItemListJSX}
        </ToggleGroup>
    );
};

/* Helpers */
export const themeList = [
    {
        value: 'light',
        label: 'Light',
        icon: <Sun className='size-[0.9rem] rotate-0 scale-100 text-current transition-all' />,
    },
    {
        value: 'dark',
        label: 'Dark',
        icon: <Moon className='size-[0.9rem] rotate-45 text-current transition-all' />,
    },
    {
        value: 'system',
        label: 'System',
        icon: <Monitor className='size-[0.9rem] text-current transition-all' />,
    },
] as const;

/* Types */
interface ThemeSwitcherProps {
    className?: string;
}
