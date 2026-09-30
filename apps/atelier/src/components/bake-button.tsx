import { useState } from 'react';
import { Input } from '@ui/kit/components/input';
import { Kbd } from '@ui/kit/components/kbd';
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@ui/kit/components/popover';
import { cn } from 'cn';
import { useAtomValue } from 'jotai';

import type { StudioActions } from '../actions.ts';
import { bakeStepAtom } from '../state.ts';
import { Key } from './key';

/**
 * The one loud control: opaque ink on the smoke. A press — or `b`, or the
 * palette — asks for a one-line note before baking, so two takes can be told
 * apart later; the piece's last note comes back selected, and Enter bakes
 * with it. While a bake runs the button is its progress.
 */
export const BakeButton = (props: BakeButtonProps) => {
  const step = useAtomValue(bakeStepAtom);
  return (
    <Popover
      onOpenChange={(open) =>
        open ? props.actions.askBake() : props.actions.cancelBake()
      }
      open={props.actions.bakeAsk !== null}>
      <PopoverTrigger
        className='relative flex h-13 w-full items-center overflow-hidden rounded-xl bg-lamp text-lamp-ink shadow-glass hover:bg-white disabled:cursor-progress disabled:bg-smoke disabled:text-ink disabled:backdrop-blur-[28px]'
        disabled={props.actions.isBaking}
        title={`bake ${props.actions.time} (b)`}>
        {props.actions.isBaking ? (
          <BakeProgress step={step} />
        ) : (
          <span className='flex w-full items-center justify-between px-4'>
            <span className='font-semibold text-base'>bake take</span>
            <kbd className='rounded border border-lamp-ink/35 px-1.5 py-0.5 font-mono text-[12px]'>
              b
            </kbd>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 shadow-glass' side='top'>
        <NoteForm actions={props.actions} />
      </PopoverContent>
    </Popover>
  );
};

/**
 * A loop's frames fill the button from the left; the label is drawn twice and
 * clipped at the fill's edge, so it reads dark on the ink and light on the smoke.
 */
const BakeProgress = (props: { step: string | null }) => {
  const frames = FRAME_STEP.exec(props.step ?? '');
  const share = frames ? Number(frames[1]) / Number(frames[2]) : 0;
  // the frames' share holds through the steps after them, so the long webp step never reads as a restart
  const [held, setHeld] = useState(0);
  if (frames && share !== held) setHeld(share);
  const percent = Math.round((frames ? share : held) * 100);
  const labelJSX = (
    <span className='flex w-full items-center justify-between px-4'>
      <span className='font-semibold text-base'>
        baking…{frames ? ` ${percent} %` : ''}
      </span>
      <span
        className={cn(
          'truncate pl-3',
          frames ? 'font-mono text-[12px] tabular-nums' : 'text-sm',
        )}>
        {frames ? `${frames[1]} / ${frames[2]}` : (props.step ?? 'starting')}
      </span>
    </span>
  );
  return (
    <>
      <span className='absolute inset-0 flex items-center'>{labelJSX}</span>
      <span
        aria-hidden='true'
        className='absolute inset-y-0 left-0 overflow-hidden bg-lamp text-lamp-ink'
        style={{ width: `${percent}%` }}>
        {/* as wide as the whole button: the fill is `percent` of it */}
        <span
          className='flex h-full items-center'
          style={{ width: percent > 0 ? `${10_000 / percent}%` : 0 }}>
          {labelJSX}
        </span>
      </span>
    </>
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
      <PopoverTitle className='font-semibold'>bake {what}</PopoverTitle>
      <div className='flex flex-col gap-1'>
        <label className='text-ink-muted text-sm' htmlFor='bake-note'>
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
        <span className='text-ink-muted text-sm'>
          <Kbd>↵</Kbd> bake · <Key keys='Escape' /> cancel
        </span>
        <button
          className='h-8 rounded-lg bg-lamp px-3 font-semibold text-lamp-ink hover:bg-white'
          type='submit'>
          bake
        </button>
      </div>
    </form>
  );
};

/* Helpers */

/** the bake's long step, as the server names it: «frame 31 of 72» */
const FRAME_STEP = /frame (\d+) of (\d+)/;

/* Types */

interface BakeButtonProps {
  actions: StudioActions;
}
