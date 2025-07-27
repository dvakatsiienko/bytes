'use client';

import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';
import { useIsMounted } from '@ui/kit/hooks/useIsMounted';
import { cn } from '@ui/kit/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = (props: ThemeSwitcherProps) => {
  const [mounted] = useIsMounted();
  const { setTheme, theme } = useTheme();

  if (!mounted) return null;

  const applyTheme = (value: string): void => setTheme(value);

  const themeGroupItemListJSX = themeList.map((themePreset) => (
    <ToggleGroupItem
      aria-label={themePreset.label}
      className={cn(
        'grid h-6 items-center',
        'text-center font-semibold text-gray-600 text-xs dark:text-gray-400 dark:hover:text-link',
        'cursor-pointer',
        themePreset.value === theme && 'text-link!',

        // Todo put into theme
        'bg-background',
      )}
      key={themePreset.value}
      value={themePreset.value}>
      {themePreset.icon}
    </ToggleGroupItem>
  ));

  return (
    <ToggleGroup
      className={cn(
        'p-[0px]',
        props.className,
        //
      )}
      defaultValue='light'
      onValueChange={applyTheme}
      type='single'
      value={theme}>
      {themeGroupItemListJSX}
    </ToggleGroup>
  );
};

/* Helpers */
export const themeList = [
  {
    icon: (
      <Sun className='size-[0.9rem] rotate-0 scale-100 text-current transition-all' />
    ),
    label: 'Light',
    value: 'light',
  },
  {
    icon: (
      <Moon className='size-[0.9rem] rotate-45 text-current transition-all' />
    ),
    label: 'Dark',
    value: 'dark',
  },
  {
    icon: <Monitor className='size-[0.9rem] text-current transition-all' />,
    label: 'System',
    value: 'system',
  },
] as const;

/* Types */
interface ThemeSwitcherProps {
  className?: string;
}
