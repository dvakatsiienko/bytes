import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

import type { StudioActions } from '../actions.ts';
import type { Theme } from '../state.ts';
import { themes } from '../state.ts';
import { BuildBadge } from './build-badge';
import { Key } from './key';
import { Segmented } from './segmented';

/** the top-right corner: day or night, every command, the theme, and which checkout runs */
export const ViewCard = (props: ViewCardProps) => {
  const themeIcon = themeIcons[props.theme];
  const nextTheme =
    themes[(themes.indexOf(props.theme) + 1) % themes.length] ?? 'system';
  return (
    <div className='glass flex flex-col gap-1.5 p-2'>
      <div className='flex items-center gap-1'>
        <div className='flex-1'>
          <Segmented
            ariaLabel='time of day'
            onValueChange={props.actions.setTime}
            options={timeOptions}
            value={props.actions.time}
          />
        </div>
        <span className='grid w-8 shrink-0 place-items-center'>
          <Key keys='n' />
        </span>
      </div>
      <div className='flex items-center gap-1'>
        <button
          className='flex h-8 flex-1 items-center justify-between rounded-lg bg-fill px-2 text-sm hover:bg-fill-on'
          onClick={props.actions.openPalette}
          type='button'>
          commands <Key keys='⌘K' />
        </button>
        <button
          aria-label={`theme: ${props.theme}, press for ${nextTheme} (t switches light and dark)`}
          className='grid size-8 shrink-0 place-items-center rounded-lg bg-fill hover:bg-fill-on'
          onClick={() => props.actions.setTheme(nextTheme)}
          title={`theme: ${props.theme}`}
          type='button'>
          {themeIcon}
        </button>
      </div>
      <BuildBadge />
    </div>
  );
};

/* Helpers */

const timeOptions = [
  { icon: <SunIcon />, label: 'day', value: 'day' },
  { icon: <MoonIcon />, label: 'night', value: 'night' },
] as const;

const themeIcons = {
  dark: <MoonIcon className='size-4' />,
  light: <SunIcon className='size-4' />,
  system: <MonitorIcon className='size-4' />,
} as const satisfies Record<Theme, unknown>;

/* Types */

interface ViewCardProps {
  actions: StudioActions;
  theme: Theme;
}
