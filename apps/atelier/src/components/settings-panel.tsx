import { Button } from '@ui/kit/components/button';
import { ColorField } from '@ui/kit/components/color-field';
import { NumberField } from '@ui/kit/components/number-field';
import { ScrollArea } from '@ui/kit/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/kit/components/select';
import { Slider } from '@ui/kit/components/slider';
import { Switch } from '@ui/kit/components/switch';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import type { ControlRow, Settings } from '../stage/settings.ts';
import { controls, defaults, isHex, looks } from '../stage/settings.ts';
import {
  controlSetAtom,
  patchSettingsAtom,
  settingsByPieceAtom,
} from '../state.ts';
import { LevaControls } from './leva-controls';
import { Segmented } from './segmented';

const controlSetOptions = [
  { label: 'kit', value: 'kit' },
  { label: 'leva', value: 'leva' },
] as const;

/** a flat piece is its svg: of every setting only the seed reaches it */
const flatControls = controls.filter((group) => group.title === 'seed');

/** the piece's settings, grouped by the job they do; every value is exact and copyable */
export const SettingsPanel = (props: SettingsPanelProps) => {
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const patchSettings = useSetAtom(patchSettingsAtom);
  const [controlSet, setControlSet] = useAtom(controlSetAtom);
  const update = (patch: Partial<Settings>) =>
    patchSettings(props.piece.id, patch);
  const groupList = props.actions.isStage ? controls : flatControls;

  const groupListJSX = groupList.map((group) => {
    const rowListJSX = group.rows.map((row) => {
      return (
        <SettingRow
          key={row.key}
          onChange={update}
          row={row}
          settings={settings}
        />
      );
    });
    return (
      <section
        aria-labelledby={`settings-${group.title}`}
        className='flex flex-col gap-2 px-4 pb-4'
        key={group.title}>
        <h3
          className='font-medium text-[12px] text-muted-foreground uppercase tracking-[0.08em]'
          id={`settings-${group.title}`}>
          {group.title}
        </h3>
        {rowListJSX}
      </section>
    );
  });

  return (
    <section
      aria-label='scene settings'
      className='flex h-full min-h-0 flex-col'>
      <header className='flex items-center justify-between gap-2 border-border border-b px-4 py-2'>
        <h2 className='truncate font-serif text-lg'>{props.piece.id}</h2>
        {props.actions.isStage ? (
          <Segmented
            ariaLabel='control set'
            onValueChange={setControlSet}
            options={controlSetOptions}
            value={controlSet}
          />
        ) : null}
      </header>
      <ScrollArea className='min-h-0 flex-1'>
        {props.actions.isStage ? null : (
          <p className='px-4 pt-3 text-muted-foreground text-sm'>
            a flat piece: it ships as its svg, so the light, lens and paper
            settings do not reach it.
          </p>
        )}
        <div className='pt-3'>
          {controlSet === 'leva' && props.actions.isStage ? (
            <LevaControls onChange={update} settings={settings} />
          ) : (
            groupListJSX
          )}
        </div>
      </ScrollArea>
      <footer className='flex gap-2 border-border border-t px-4 py-2'>
        <Button
          onClick={props.actions.copySettings}
          size='sm'
          variant='outline'>
          <CopyIcon /> copy all
        </Button>
        <Button onClick={props.actions.resetSettings} size='sm' variant='ghost'>
          reset
        </Button>
      </footer>
    </section>
  );
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
    toast.error(
      `copy failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const SettingRow = (props: SettingRowProps) => {
  const id = `setting-${props.row.key}`;
  const value = props.settings[props.row.key];

  const labelJSX = (
    <label className='min-w-0' htmlFor={id}>
      <span className='block text-foreground text-sm'>{props.row.label}</span>
      <code className='block font-mono text-[12px] text-muted-foreground'>
        {props.row.key}
      </code>
    </label>
  );
  const copyJSX = (
    <Button
      aria-label={`copy ${props.row.key}`}
      onClick={() => copyValue(props.row.key, value)}
      size='icon-xs'
      title={`copy «${props.row.key}: ${value}»`}
      variant='ghost'>
      <CopyIcon />
    </Button>
  );

  if (props.row.kind === 'number') {
    const number = props.settings[props.row.key];
    return (
      <div className='grid grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-1.5'>
        {labelJSX}
        <NumberField
          className='h-7 w-20 text-right text-[12px]'
          id={id}
          max={props.row.max}
          min={props.row.min}
          onValueChange={(next) => props.onChange({ [props.row.key]: next })}
          step={props.row.step}
          value={number}
        />
        {copyJSX}
        <Slider
          aria-label={props.row.label}
          className='col-span-3'
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
    return (
      <div className='grid grid-cols-[1fr_auto_auto] items-center gap-x-2'>
        {labelJSX}
        <Switch
          checked={props.settings[props.row.key]}
          id={id}
          onCheckedChange={(checked) =>
            props.onChange({ [props.row.key]: checked })
          }
        />
        {copyJSX}
      </div>
    );
  }

  if (props.row.kind === 'color') {
    return (
      <div className='grid grid-cols-[1fr_auto_auto] items-center gap-x-2'>
        {labelJSX}
        <ColorField
          id={id}
          onValueChange={(next) => {
            if (isHex(next)) props.onChange({ [props.row.key]: next });
          }}
          value={props.settings[props.row.key]}
        />
        {copyJSX}
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
    <div className='grid grid-cols-[1fr_auto_auto] items-center gap-x-2'>
      {labelJSX}
      <Select
        onValueChange={(next) => {
          const look = looks.find((candidate) => candidate === next);
          if (look) props.onChange({ [props.row.key]: look });
        }}
        value={props.settings[props.row.key]}>
        <SelectTrigger className='h-7 w-28 font-mono text-[12px]' id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{itemListJSX}</SelectContent>
      </Select>
      {copyJSX}
    </div>
  );
};

/* Types */

interface SettingsPanelProps {
  actions: StudioActions;
  piece: Piece;
}

interface SettingRowProps {
  onChange: (patch: Partial<Settings>) => void;
  row: ControlRow;
  settings: Settings;
}
