import type { KeyboardEvent } from 'react';
import { ColorField } from '@ui/kit/components/color-field';
import { NumberField } from '@ui/kit/components/number-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/kit/components/select';
import { Slider } from '@ui/kit/components/slider';
import { Switch } from '@ui/kit/components/switch';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

import { errorText } from '../error-text.ts';
import type { ControlRow, Settings } from '../stage/settings.ts';
import { isHex, looks } from '../stage/settings.ts';

/**
 * One setting on the ring: its name, its exact value (typed or copied), and
 * the control. `group` names the edge it lives on when a search shows it
 * away from home.
 */
export const SettingRow = (props: SettingRowProps) => {
  // `ring-`: a search on the ring can list the seed and look the piece corner also shows
  const id = `ring-${props.row.key}`;
  const value = props.settings[props.row.key];

  const labelJSX = (
    <label
      className='flex min-w-0 items-baseline gap-2 text-ink-muted text-sm'
      htmlFor={id}
      id={`${id}-label`}
      title={props.row.key}>
      {props.group ? (
        <span className='shrink-0 text-ink-muted text-sm'>{props.group}</span>
      ) : null}
      <span className='line-clamp-2'>{props.row.label}</span>
    </label>
  );
  const copyJSX = (
    <button
      aria-label={`copy ${props.row.key}`}
      className='grid size-6 shrink-0 place-items-center rounded-md text-ink-muted opacity-0 transition-opacity duration-150 hover:bg-fill-on hover:text-ink focus-visible:opacity-100 group-hover/row:opacity-100'
      onClick={() => copyValue(props.row.key, value)}
      title={`copy «${props.row.key}: ${value}»`}
      type='button'>
      <CopyIcon className='size-3.5' />
    </button>
  );

  if (props.row.kind === 'number') {
    const number = props.settings[props.row.key];
    return (
      <div className='group/row flex flex-col gap-1' data-ring-row>
        <div className='flex min-h-6 items-center justify-between gap-2'>
          {labelJSX}
          <span className='flex items-center'>
            {copyJSX}
            <NumberField
              className='h-6 w-18 border-transparent bg-transparent px-1 text-right font-mono text-[12px] text-ink tabular-nums shadow-none hover:border-key-line focus-visible:border-key-line dark:bg-transparent'
              id={id}
              max={props.row.max}
              min={props.row.min}
              onValueChange={(next) =>
                props.onChange({ [props.row.key]: next })
              }
              step={props.row.step}
              value={number}
            />
          </span>
        </div>
        <Slider
          // base-ui hands a root's labelledby to each thumb's range input; a plain label stays on the group
          aria-labelledby={`${id}-label`}
          className='ring-slider'
          max={props.row.max}
          min={props.row.min}
          onValueChange={(next) => {
            const picked = Array.isArray(next) ? next[0] : next;
            if (typeof picked === 'number')
              props.onChange({ [props.row.key]: picked });
          }}
          step={props.row.step}
          value={number}
        />
      </div>
    );
  }

  if (props.row.kind === 'toggle') {
    const isOn = props.settings[props.row.key];
    return (
      <div
        className='group/row flex min-h-7 items-center justify-between gap-2'
        data-ring-row>
        {labelJSX}
        <span className='flex items-center gap-2'>
          {copyJSX}
          <Switch
            checked={isOn}
            className='ring-switch'
            id={id}
            onCheckedChange={(checked) =>
              props.onChange({ [props.row.key]: checked })
            }
          />
        </span>
      </div>
    );
  }

  if (props.row.kind === 'color') {
    return (
      <div
        className='group/row flex min-h-7 items-center justify-between gap-2'
        data-ring-row>
        {labelJSX}
        <span className='flex items-center gap-1'>
          {copyJSX}
          <ColorField
            id={id}
            onValueChange={(next) => {
              if (isHex(next)) props.onChange({ [props.row.key]: next });
            }}
            value={props.settings[props.row.key]}
          />
        </span>
      </div>
    );
  }

  const itemListJSX = looks.map((look) => {
    return (
      <SelectItem key={look} value={look}>
        {look}
      </SelectItem>
    );
  });
  return (
    <div
      className='group/row flex min-h-7 items-center justify-between gap-2'
      data-ring-row>
      {labelJSX}
      <span className='flex items-center gap-1'>
        {copyJSX}
        <Select
          onValueChange={(next) => {
            const look = looks.find((candidate) => candidate === next);
            if (look) props.onChange({ [props.row.key]: look });
          }}
          value={props.settings[props.row.key]}>
          <SelectTrigger
            className='h-8 w-32 border-key-line bg-fill font-mono text-[12px]'
            id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{itemListJSX}</SelectContent>
        </Select>
      </span>
    </div>
  );
};

/**
 * ↑ ↓ walk the rows of a list, ← → change the value: a slider or a switch
 * hands the vertical arrows to the list. A number field keeps them for its
 * own steps. Bound in the capture phase, so the slider never sees the key.
 */
export const handleRowKeys = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  const { target } = event;
  if (
    !(
      target instanceof HTMLElement &&
      target.closest('[data-slot="slider"], [data-slot="switch"]')
    )
  )
    return;
  const rows = [
    ...event.currentTarget.querySelectorAll<HTMLElement>('[data-ring-row]'),
  ];
  const index = rows.findIndex((row) => row.contains(target));
  const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
  const control = next?.querySelector<HTMLElement>(
    '[data-slot="slider"] input, [data-slot="switch"], input, button[data-slot="select-trigger"]',
  );
  if (!control) return;
  event.preventDefault();
  event.stopPropagation();
  control.focus();
};

const copyValue = async (key: string, value: string | number | boolean) => {
  const text = `${key}: ${value}`;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(
      <span>
        copied <code className='font-mono'>{text}</code>
      </span>,
    );
  } catch (error) {
    toast.error(`copy failed: ${errorText(error)}`);
  }
};

/* Types */

interface SettingRowProps {
  group?: string;
  onChange: (patch: Partial<Settings>) => void;
  row: ControlRow;
  settings: Settings;
}
