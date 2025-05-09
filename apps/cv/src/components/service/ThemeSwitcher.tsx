'use client';

/* Core */
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { Tabs, TabsTrigger, TabsContent, TabsList } from '@workspace/ui/components/tabs';
import { Bold, Italic, Underline } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';

/* Instruments */
import { cn } from '@workspace/ui/lib/utils';

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme, theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // const switchTheme = (value: string) => {
    //     if (value === 'light') setTheme('dark');
    //     if (value === 'dark') setTheme('light');
    // };
    //
    console.log({ resolvedTheme });

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
            className='w-[auto] justify-self-end'>
            {themeList.map((theme) => (
                <ToggleGroupItem
                    className={cn('h-5', theme.value === theme && 'text-link!', 'cursor-pointer')}
                    key={theme.value}
                    value={theme.value}
                    aria-label={theme.label}>
                    {theme.icon}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
};

import { Moon, Sun, Monitor } from 'lucide-react';

/* Helpers */
export const themeList = [
    {
        value: 'light',
        // label: 'Light',
        icon: <Sun className='size-[0.9rem] rotate-0 scale-100 text-current transition-all' />,
    },
    {
        value: 'dark',
        // label: 'Dark',
        icon: <Moon className='size-[0.9rem] rotate-45 text-current transition-all' />,
    },
    {
        value: 'system',
        // label: 'System',
        icon: <Monitor className='size-[0.9rem] text-current transition-all' />,
    },
] as const;
