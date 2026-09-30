import { useState } from 'react';
import { NumberField } from '@ui/kit/components/number-field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@ui/kit/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/kit/components/select';
import { useAtomValue, useSetAtom } from 'jotai';
import { ChevronDownIcon } from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import { pieces } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import { defaults, looks } from '../stage/settings.ts';
import {
  patchSettingsAtom,
  pixelViewAtom,
  settingsByPieceAtom,
} from '../state.ts';
import { Key } from './key';
import { PiecesList } from './pieces-list';

/**
 * The top-left corner: which piece is under the lamp, the way to any other,
 * and the two settings that belong to the piece itself, its seed and its look.
 * The wordmark sits over its first row, outside the card's section.
 */
export const CornerPiece = (props: CornerPieceProps) => {
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const patchSettings = useSetAtom(patchSettingsAtom);
  const pixel = useAtomValue(pixelViewAtom);

  return (
    <div className='glass flex flex-col gap-2.5 px-3.5 pt-3 pb-3.5'>
      <div className='flex h-7 items-center justify-end'>
        <PiecesButton piece={props.piece} />
      </div>
      <div className='flex items-baseline justify-between gap-3'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <span className='truncate font-semibold text-lg tracking-[-0.01em]'>
            {props.piece.id}
          </span>
          <span className='text-ink-muted text-sm'>
            {props.piece.group}, {props.piece.kind}
          </span>
        </div>
        {props.actions.isStage ? null : (
          <span className='shrink-0 font-mono text-[12px] tabular-nums'>
            {pixel?.piece === props.piece.id
              ? `${pixel.size} × ${pixel.size} px`
              : `${props.piece.size.w} × ${props.piece.size.h} px`}
          </span>
        )}
      </div>
      {props.actions.isStage ? (
        <div className='grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2'>
          <label className='text-ink-muted text-sm' htmlFor='setting-seed'>
            seed
          </label>
          <NumberField
            className='h-8 border-key-line bg-fill font-mono text-[12px] text-ink tabular-nums'
            id='setting-seed'
            max={9999}
            min={1}
            onValueChange={(seed) => patchSettings(props.piece.id, { seed })}
            step={1}
            value={settings.seed}
          />
          <button
            className='flex h-8 items-center gap-1.5 rounded-md bg-fill px-2 text-sm hover:bg-fill-on'
            onClick={props.actions.newSeed}
            type='button'>
            new <Key keys='e' />
          </button>
          <label className='text-ink-muted text-sm' htmlFor='setting-look'>
            look
          </label>
          <Select
            onValueChange={(next) => {
              const look = looks.find((candidate) => candidate === next);
              if (look) patchSettings(props.piece.id, { look });
            }}
            value={settings.look}>
            <SelectTrigger
              className='col-span-2 h-8 w-full border-key-line bg-fill text-sm'
              id='setting-look'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {looks.map((look) => {
                return (
                  <SelectItem key={look} value={look}>
                    {look}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
};

/** every piece, one click away; picking one closes the list */
export const PiecesButton = (props: { piece: Piece }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger className='flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-ink-muted text-sm hover:bg-fill-on hover:text-ink'>
        pieces
        <span className='font-mono text-[12px] tabular-nums'>
          {pieces.length}
        </span>
        <ChevronDownIcon className='size-3.5' />
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='max-h-[min(560px,var(--available-height))] w-72 overflow-hidden p-0'>
        <PiecesList onPick={() => setIsOpen(false)} piece={props.piece} />
      </PopoverContent>
    </Popover>
  );
};

/* Types */

interface CornerPieceProps {
  actions: StudioActions;
  piece: Piece;
}
