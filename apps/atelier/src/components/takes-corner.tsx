import type { ComponentProps, ReactElement } from 'react';
import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@ui/kit/components/context-menu';
import { cn } from 'cn';
import { useAtom, useAtomValue } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import type { Take, TakeList } from '../../server/takes.ts';
import type { StudioActions } from '../actions.ts';
import { navigate, opensInPlace, pathOf, useRoute } from '../route.ts';
import { bakeStepAtom, takeFilterAtom } from '../state.ts';
import { useTakeActions } from '../take-actions.ts';
import type { TakeFilter } from '../takes.ts';
import { filterTakes, takeFilters, takeUrl, useTakes } from '../takes.ts';
import { Key } from './key';
import { Segmented } from './segmented';

/**
 * The bottom-left corner: the piece's takes as a stack, newest on top. `g`
 * opens the stack into the film strip along the bottom edge, and folds it
 * again.
 */
export const TakesCorner = (props: TakesCornerProps) => {
  const query = useTakes(props.piece.id);
  const list = query.data;
  if (query.isError)
    return (
      <p className='glass w-[300px] px-4 py-3 text-sm' role='alert'>
        takes did not load: {query.error.message}
      </p>
    );
  if (!list) return null;
  return props.isStrip || props.actions.ring === 'takes' ? (
    <FilmStrip actions={props.actions} list={list} piece={props.piece} />
  ) : (
    <TakeStack actions={props.actions} list={list} />
  );
};

const TakeStack = (props: { actions: StudioActions; list: TakeList }) => {
  const { view } = useRoute();
  const shownId = view.kind === 'take' ? view.take : null;
  const front =
    props.list.takes.find((take) => take.id === shownId) ?? props.list.takes[0];

  if (!front)
    return (
      <section
        aria-label='takes'
        className='glass flex w-[300px] flex-col gap-1.5 px-4 py-3.5'>
        <h2 className='font-semibold text-sm'>no takes yet</h2>
        <p className='text-ink-muted text-sm'>
          bake the first one with <Key keys='b' />. takes stack here, newest on
          top.
        </p>
      </section>
    );

  const behind = props.list.takes
    .filter((take) => take.id !== front.id)
    .slice(0, 2);
  const stack = [...behind.reverse(), front];
  const stashed = props.list.takes.filter((take) => take.stash).length;
  const isCurrent = props.list.current[front.time] === front.id;

  const cardListJSX = stack.map((take, index) => {
    const depth = stack.length - 1 - index;
    return (
      <img
        alt=''
        className={cn(
          'absolute h-[110px] w-[176px] rounded-md border border-ink/20 bg-smoke object-cover shadow-glass',
          take.stash && 'border-ink-muted border-dashed',
        )}
        decoding='async'
        height={110}
        key={take.id}
        src={takeUrl(take)}
        style={{
          left: depth * 36,
          opacity: 1 - depth * 0.25,
          top: 26 - depth * 13,
        }}
        width={176}
      />
    );
  });

  return (
    <button
      aria-expanded={false}
      aria-label={`takes: ${props.list.takes.length}, open the film strip`}
      className='group flex w-[300px] flex-col gap-2 text-left'
      data-ring-opener='takes'
      onClick={props.actions.toggleStrip}
      type='button'>
      <span aria-hidden='true' className='relative block h-[136px] w-full'>
        {cardListJSX}
      </span>
      <span className='glass flex w-full items-center gap-2 px-3 py-2.5 text-sm group-hover:bg-[rgb(38_45_51/0.84)]'>
        <span className='min-w-0 truncate font-mono text-[12px] tabular-nums'>
          {front.id}
        </span>
        {isCurrent ? <span className='shrink-0'>● current</span> : null}
        <span className='shrink-0 text-ink-muted'>
          of {props.list.takes.length}
          {stashed > 0 ? `, ${stashed} stashed` : ''}
        </span>
        <span className='flex-1' />
        <Key keys='[' />
        <Key keys=']' />
        <Key keys='g' />
      </span>
    </button>
  );
};

/** every take of the piece in a row, the shown one ringed; a stashed take has a dashed edge */
const FilmStrip = (props: FilmStripProps) => {
  const { view } = useRoute();
  const [filter, setFilter] = useAtom(takeFilterAtom);
  const step = useAtomValue(bakeStepAtom);
  const shownId = view.kind === 'take' ? view.take : null;
  const shown = props.list.takes.find((take) => take.id === shownId);
  const shownTakes = filterTakes(props.list, filter);
  const filterOptions = takeFilters.map((value) => {
    return {
      label: `${value} ${filterTakes(props.list, value).length}`,
      value,
    };
  });

  const tileListJSX = shownTakes.map((take) => {
    return (
      <li className='shrink-0' key={take.id}>
        <TakeMenu list={props.list} shown={shown} take={take}>
          <TakeTile
            isCurrent={props.list.current[take.time] === take.id}
            isShown={take.id === shownId}
            take={take}
          />
        </TakeMenu>
      </li>
    );
  });

  return (
    <section
      aria-label='film strip'
      className='glass flex w-full flex-col gap-3 px-4 pt-3 pb-3.5'
      data-ring-panel='takes'>
      <header className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <h2 className='font-semibold text-sm'>takes</h2>
        {props.list.takes.length > 0 ? (
          <div className='w-72'>
            <Segmented
              ariaLabel='show takes'
              onValueChange={(next: TakeFilter) => setFilter(next)}
              options={filterOptions}
              value={filter}
            />
          </div>
        ) : null}
        {shown ? (
          <p
            className='min-w-0 truncate text-ink-muted text-sm tabular-nums'
            title={factsOf(shown)}>
            {factsOf(shown)}
          </p>
        ) : null}
        <span className='flex-1' />
        <span className='flex items-center gap-1.5 text-ink-muted text-sm'>
          previous, next <Key keys='[' /> <Key keys=']' />
        </span>
        {props.actions.ring === 'takes' ? (
          <button
            aria-expanded={true}
            className='flex items-center gap-1.5 rounded-md px-1 py-0.5 text-ink-muted text-sm hover:bg-fill-on hover:text-ink'
            data-ring-opener='takes'
            onClick={props.actions.toggleStrip}
            type='button'>
            fold <Key keys='g' />
          </button>
        ) : null}
      </header>
      <ul className='-mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-1.5'>
        {props.actions.isBaking ? (
          <li className='flex w-34 shrink-0 flex-col gap-1.5'>
            <span className='grid h-21 place-items-center rounded-md border border-ink/70 border-dashed bg-smoke text-sm'>
              baking
            </span>
            <span className='truncate text-ink-muted text-sm'>
              {step ?? 'starting'}
            </span>
          </li>
        ) : null}
        {tileListJSX}
        {shownTakes.length === 0 ? (
          <li className='py-6 text-ink-muted text-sm'>
            {props.list.takes.length === 0
              ? 'no takes yet — bake one with b'
              : emptyText[filter]}
          </li>
        ) : null}
      </ul>
    </section>
  );
};

/** a take in the strip; the context menu's trigger renders it, so the trigger's own props land on the link */
const TakeTile = (props: TakeTileProps) => {
  // the three are the tile's own; the rest is the menu trigger's (its handlers, its ref)
  const { isCurrent, isShown, take, ...trigger } = props;
  const route = {
    piece: take.piece,
    view: { kind: 'take', take: take.id },
  } as const;
  return (
    <a
      {...trigger}
      aria-current={isShown ? 'page' : undefined}
      className='group flex w-34 flex-col gap-1.5 rounded-md outline-offset-2'
      href={pathOf(route)}
      onClick={(event) => {
        trigger.onClick?.(event);
        if (!opensInPlace(event)) return;
        event.preventDefault();
        navigate(route);
      }}
      title={take.note || undefined}>
      <img
        alt=''
        className={cn(
          'h-21 w-34 rounded-md border object-cover transition-[border-color] duration-150',
          take.stash
            ? 'border-ink-muted border-dashed'
            : 'border-ink/15 group-hover:border-ink/50',
          isShown && 'border-2 border-ink border-solid',
        )}
        decoding='async'
        height={84}
        loading='lazy'
        src={takeUrl(props.take)}
        width={136}
      />
      {/* the id carries the time of day: 03-night-warmer-lamp */}
      <span className='flex min-w-0 items-baseline gap-1.5 text-sm'>
        <span className='truncate font-mono text-[12px] tabular-nums'>
          {take.id}
        </span>
        {isCurrent ? (
          <span className='shrink-0 font-semibold'>● current</span>
        ) : null}
        {take.stash ? (
          <span className='shrink-0 text-ink-muted'>stashed</span>
        ) : null}
      </span>
      <span className='truncate text-ink-muted text-sm'>
        {take.note || 'no note'}
      </span>
    </a>
  );
};

/** a right-click on a take: everything that can be done to it */
/**
 * A right-click on a take: everything that can be done to it, each with the
 * key that does it while the menu is open.
 */
const TakeMenu = (props: TakeMenuProps) => {
  const actions = useTakeActions();
  const [isOpen, setIsOpen] = useState(false);
  const { take, shown } = props;
  const isCurrent = props.list.current[take.time] === take.id;
  const items: readonly TakeMenuItem[] = [
    { keys: '⏎', label: 'open', run: () => actions.open(take) },
    ...(shown && shown.id !== take.id
      ? [
          {
            keys: 'v',
            label: `compare with ${shown.id}`,
            run: () => actions.compare(shown, take),
          },
        ]
      : []),
    take.stash
      ? {
          keys: 's',
          label: 'take out of the stash',
          run: () => actions.unstash(take),
        }
      : {
          keys: 's',
          label: 'stash with a reason…',
          run: () => actions.askStash(take),
        },
    {
      isDisabled: isCurrent,
      keys: '⇧⏎',
      label: `promote to the ${take.time} take`,
      run: () => actions.promote(take),
    },
    {
      keys: 'u',
      label: 'use its settings',
      run: () => actions.loadSettings(take),
    },
    {
      keys: 'c',
      label: 'copy image as png',
      run: () => actions.copyImage(take),
    },
  ];

  const itemListJSX = items.map((item) => {
    return (
      <ContextMenuItem
        className='justify-between gap-6'
        disabled={item.isDisabled}
        key={item.keys}
        onClick={item.run}>
        {item.label}
        <Key keys={item.keys} />
      </ContextMenuItem>
    );
  });

  return (
    <ContextMenu onOpenChange={setIsOpen} open={isOpen}>
      <ContextMenuTrigger render={props.children} />
      <ContextMenuContent
        className='min-w-60'
        onKeyDown={(event) => {
          // a highlighted item keeps Enter for itself; with none, Enter opens the take
          const isHighlighted =
            event.currentTarget.querySelector('[data-highlighted]') !== null;
          const item = items.find(
            (candidate) =>
              candidate.keys === keyOf(event) &&
              !(candidate.keys === '⏎' && isHighlighted),
          );
          if (!item || item.isDisabled) return;
          event.preventDefault();
          setIsOpen(false);
          item.run();
        }}>
        {itemListJSX}
      </ContextMenuContent>
    </ContextMenu>
  );
};

/* Helpers */

/** a key press as the menu prints its key */
const keyOf = (event: { key: string; shiftKey: boolean }) => {
  if (event.key === 'Enter') return event.shiftKey ? '⇧⏎' : '⏎';
  return event.key;
};

const factsOf = (take: Take) =>
  `${take.id} · seed ${take.seed} · ${take.frames > 1 ? `${take.frames} frames` : 'still'} · baked ${new Date(take.bakedAt).toLocaleString()}`;

const emptyText = {
  all: '',
  current: 'no take ships yet — promote one',
  stashed: 'nothing stashed',
} as const satisfies Record<TakeFilter, string>;

/* Types */

interface TakesCornerProps {
  actions: StudioActions;
  /** the narrow bench shows the strip always: there is no corner to stack in */
  isStrip?: boolean;
  piece: Piece;
}

interface FilmStripProps {
  actions: StudioActions;
  list: TakeList;
  piece: Piece;
}

interface TakeTileProps extends ComponentProps<'a'> {
  isCurrent: boolean;
  isShown: boolean;
  take: Take;
}

interface TakeMenuItem {
  isDisabled?: boolean;
  keys: string;
  label: string;
  run: () => void;
}

interface TakeMenuProps {
  children: ReactElement;
  list: TakeList;
  shown: Take | undefined;
  take: Take;
}
