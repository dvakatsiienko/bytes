import { useState } from 'react';
import { Input } from '@ui/kit/components/input';
import { Kbd } from '@ui/kit/components/kbd';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@ui/kit/components/popover';

import type { StudioActions } from '../actions.ts';
import { BenchAction } from './bench-action';

/**
 * The bench's one accent. A press — or `b`, or the palette — asks for a
 * one-line note before baking, so two takes can be told apart later; the
 * piece's last note comes back selected, and Enter bakes with it.
 */
export const BakeButton = (props: BakeButtonProps) => {
  return (
    <Popover
      onOpenChange={(open) =>
        open ? props.actions.askBake() : props.actions.cancelBake()
      }
      open={props.actions.bakeAsk !== null}>
      <PopoverTrigger
        disabled={props.actions.isBaking}
        render={<BenchAction title={`bake ${props.actions.time} (b)`} />}>
        {props.actions.isBaking ? 'baking…' : 'bake'}
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 bg-popover shadow-float'>
        <NoteForm actions={props.actions} />
      </PopoverContent>
    </Popover>
  );
};

/** mounted per ask, so every ask starts from the piece's last note; the popup focuses its field */
const NoteForm = (props: BakeButtonProps) => {
  const [note, setNote] = useState(props.actions.bakeNote);
  const frames = props.actions.bakeAsk ?? 1;
  const what =
    frames > 1
      ? `a ${frames}-frame loop · ${props.actions.time}`
      : props.actions.time;

  return (
    <form
      className='flex flex-col gap-3'
      onSubmit={(event) => {
        event.preventDefault();
        props.actions.bake(note.trim());
      }}>
      <PopoverTitle className='font-normal'>bake {what}</PopoverTitle>
      <div className='flex flex-col gap-1'>
        <label
          className='text-[12px] text-muted-foreground'
          htmlFor='bake-note'>
          note, optional — what this take tries
        </label>
        <Input
          id='bake-note'
          maxLength={200}
          onChange={(event) => setNote(event.currentTarget.value)}
          onFocus={(event) => event.currentTarget.select()}
          placeholder='warmer lamp, softer shadow'
          value={note}
        />
      </div>
      <div className='flex items-center justify-end gap-2'>
        <span className='text-[12px] text-muted-foreground'>
          <Kbd>↵</Kbd> bake · <Kbd>esc</Kbd> cancel
        </span>
        <BenchAction type='submit'>bake</BenchAction>
      </div>
    </form>
  );
};

/* Types */

interface BakeButtonProps {
  actions: StudioActions;
}
