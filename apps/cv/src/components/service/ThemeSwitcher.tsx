'use client';

/* Core */
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

/* Components */
import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';

/* Instruments */
import { cn } from '@ui/kit/lib/utils';

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const change = (value: string): void => {
        console.log({ value });

        return setTheme(value);
    };

    return (
        <ToggleGroup
            type='single'
            value={theme}
            onValueChange={change}
            defaultValue='light'
            className={cn(
                'h-6 w-[auto] p-[0px]',
                'bg-background self-center',
                props.className,
                //
            )}>
            {themeList.map((themePreset) => (
                <ToggleGroupItem
                    className={cn(
                        'h-6',
                        'hover:bg-background dark:bg-background bg-gray-200',
                        'dark:bg-background',
                        'cursor-pointer',
                        themePreset.value === theme && 'text-link!',

                        // Todo put into theme
                        'dark:hover:text-link grid h-full w-full items-center text-gray-500 dark:text-gray-400',
                        'text-center text-xs font-semibold',
                        // 'dark:data-[state=on]:bg-background-header',
                        // 'data-[state=active]:bg-amber-200!',
                    )}
                    key={themePreset.value}
                    value={themePreset.value}
                    aria-label={themePreset.label}>
                    {themePreset.icon}
                </ToggleGroupItem>
            ))}
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
