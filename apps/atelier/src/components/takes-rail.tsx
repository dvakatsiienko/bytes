import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@ui/kit/components/context-menu';
import { ScrollArea } from '@ui/kit/components/scroll-area';
import { cn } from 'cn';
import { useAtom } from 'jotai';
import { MoonIcon, SunIcon } from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import { navigate, pathOf, useRoute } from '../route.ts';
import { takeFilterAtom } from '../state.ts';
import { useTakeActions } from '../take-actions.ts';
import type { TakeFilter } from '../takes.ts';
import { filterTakes, takeFilters, takeUrl, useTakes } from '../takes.ts';
import { Segmented } from './segmented';

/** the piece's takes, newest first; the one on screen wears the lamp outline */
export const TakesRail = (props: TakesRailProps) => {
  const route = useRoute();
  const query = useTakes(props.piece.id);
  const actions = useTakeActions();
  const [filter, setFilter] = useAtom(takeFilterAtom);
  const list = query.data;
  const shownId = route.view.kind === 'take' ? route.view.take : null;
  const shown = list?.takes.find((take) => take.id === shownId);

  const shownTakes = list ? filterTakes(list, filter) : [];

  const cardListJSX = shownTakes.map((take) => {
    const isShown = take.id === shownId;
    const isCurrent = list?.current[take.time] === take.id;
    const takeRoute = {
      piece: take.piece,
      view: { kind: 'take', take: take.id },
    } as const;
    return (
      <li key={take.id}>
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <a
                aria-current={isShown ? 'page' : undefined}
                className={cn(
                  'group flex gap-3 rounded-md p-1.5 outline-offset-2 transition-colors duration-150 hover:bg-surface/70',
                  isShown && 'bg-surface outline-2 outline-lamp outline-solid',
                )}
                href={pathOf(takeRoute)}
                onClick={(event) => {
                  event.preventDefault();
                  navigate(takeRoute);
                }}
              />
            }>
            <img
              alt=''
              className='h-12 w-20 shrink-0 rounded-sm bg-chip object-cover'
              decoding='async'
              height={48}
              loading='lazy'
              src={takeUrl(take)}
              width={80}
            />
            <span className='flex min-w-0 flex-col gap-0.5'>
              <span className='flex items-center gap-1.5 font-mono text-[12px] text-foreground'>
                {take.time === 'day' ? (
                  <SunIcon aria-label='day' className='size-3.5' />
                ) : (
                  <MoonIcon aria-label='night' className='size-3.5' />
                )}
                {take.id}
              </span>
              <span
                className='truncate text-muted-foreground text-xs'
                title={take.note || undefined}>
                {take.note || 'no note'}
              </span>
              <span className='flex gap-1'>
                {isCurrent ? <Chip>current</Chip> : null}
                {take.stash ? <Chip>stash</Chip> : null}
              </span>
            </span>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => actions.open(take)}>
              open
            </ContextMenuItem>
            {shown && shown.id !== take.id ? (
              <ContextMenuItem onClick={() => actions.compare(shown, take)}>
                compare with {shown.id}
              </ContextMenuItem>
            ) : null}
            <ContextMenuSeparator />
            <ContextMenuItem
              disabled={isCurrent}
              onClick={() => actions.promote(take)}>
              promote to the {take.time} take
            </ContextMenuItem>
            {take.stash ? (
              <ContextMenuItem onClick={() => actions.unstash(take)}>
                take out of the stash
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={() => actions.askStash(take)}>
                stash with a reason…
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => actions.loadSettings(take)}>
              use its settings
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => actions.copyImage(take)}>
              copy image as png
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </li>
    );
  });

  return (
    <section
      aria-labelledby='takes-title'
      className='flex min-h-0 flex-1 flex-col'>
      <h2
        className='flex items-baseline justify-between px-4 pt-3 pb-1 font-medium text-[12px] text-muted-foreground uppercase tracking-[0.08em]'
        id='takes-title'>
        takes
        <span className='font-mono normal-case tracking-normal'>
          {list && filter !== 'all'
            ? `${shownTakes.length} of ${list.takes.length}`
            : list?.takes.length}
        </span>
      </h2>
      {list && list.takes.length > 0 ? (
        <div className='px-4 pb-2'>
          <Segmented
            ariaLabel='show takes'
            onValueChange={setFilter}
            options={filterOptions}
            value={filter}
          />
        </div>
      ) : null}
      <ScrollArea className='min-h-0 flex-1'>
        {list && shownTakes.length === 0 ? (
          <p className='px-4 py-2 text-muted-foreground text-sm'>
            {list.takes.length === 0
              ? 'no takes yet — bake one with the bake button or b'
              : emptyText[filter]}
          </p>
        ) : null}
        {query.isError ? (
          <p className='px-4 py-2 text-destructive text-sm'>
            takes did not load: {query.error.message}
          </p>
        ) : null}
        {/* pt-1 is the selected row's outline, width + offset, so the scroll box never cuts it */}
        <ul className='flex flex-col gap-1 px-2 pt-1 pb-3'>{cardListJSX}</ul>
      </ScrollArea>
    </section>
  );
};

const Chip = (props: { children: string }) => {
  return (
    <span className='rounded-full bg-chip px-1.5 font-mono text-[12px] text-muted-foreground leading-5'>
      {props.children}
    </span>
  );
};

/* Helpers */

const filterOptions = takeFilters.map((value) => ({ label: value, value }));

const emptyText = {
  all: '',
  current: 'no take ships yet — promote one',
  stashed: 'nothing stashed',
} as const satisfies Record<TakeFilter, string>;

/* Types */

interface TakesRailProps {
  piece: Piece;
}
