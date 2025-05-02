import { Moon, Sun, Monitor } from 'lucide-react';
// import { Moon, Sun } from 'lucide-react';

/* Helpers */
export const themeList = [
    {
        value: 'light',
        label: 'Light',
        icon: <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all' />,
    },
    {
        value: 'dark',
        label: 'Dark',
        icon: <Moon className='h-[1.2rem] w-[1.2rem] rotate-45 transition-all' />,
    },
    {
        value: 'system',
        label: 'System',
        icon: <Monitor className='h-[1.2rem] w-[1.2rem] transition-all ' />,
    },
] as const;

/* Helpers */
export const colorPresetList = [
    { label: 'Brand', value: 'brand', color: 'bg-(--accent-7)' },
    { label: 'Stone', value: 'stone', color: 'bg-stone-500' },
] as const;
export const colorPresetValueList = colorPresetList.map((preset) => preset.value);

/* Types */
export type AppTheme = (typeof themeList)[number]['value'];
export type AppColorPreset = (typeof colorPresetList)[number]['value'];
