'use client';

/* Core */
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { Tabs, TabsTrigger, TabsContent, TabsList } from '@ui/kit/components/tabs';
import { Bold, Italic, Underline } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';

/* Instruments */
import { cn } from '@ui/kit/lib/utils';

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
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
            className={cn(
                'justify-elf-end z-10 h-fit w-[auto] p-0.5',
                'bg-background self-center',
                props.className,
                //
            )}>
            {themeList.map((theme) => (
                <ToggleGroupItem
                    className={cn(
                        'z-20 h-5',
                        theme.value === theme && 'text-link!',
                        'cursor-pointer',
                        'hover:bg-background',
                        'bg-gray-200',
                        'dark:data-[state=on]:bg-background-header',
                        'dark:bg-background',
                        // 'h-6',
                        // 'data-[state=active]:bg-amber-200!',
                    )}
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

/* Types */
interface ThemeSwitcherProps {
    className?: string;
}
