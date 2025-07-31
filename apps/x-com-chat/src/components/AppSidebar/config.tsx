import { Monitor, Moon, Sun } from 'lucide-react';
// import { Moon, Sun } from 'lucide-react';

/* Helpers */
export const themeList = [
  {
    icon: (
      <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all' />
    ),
    label: 'Light',
    value: 'light',
  },
  {
    icon: <Moon className='h-[1.2rem] w-[1.2rem] rotate-45 transition-all' />,
    label: 'Dark',
    value: 'dark',
  },
  {
    icon: <Monitor className='h-[1.2rem] w-[1.2rem] transition-all' />,
    label: 'System',
    value: 'system',
  },
] as const;

/* Helpers */
export const colorPresetList = [
  { color: 'bg-(--accent-7)', label: 'Brand', value: 'brand' },
  { color: 'bg-stone-500', label: 'Stone', value: 'stone' },
] as const;
export const colorPresetValueList = colorPresetList.map(
  (preset) => preset.value,
);

/* Types */
export type AppTheme = (typeof themeList)[number]['value'];
export type AppColorPreset = (typeof colorPresetList)[number]['value'];
