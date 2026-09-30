import { ScrollArea } from '@ui/kit/components/scroll-area';
import { cn } from 'cn';

import type { Piece } from '../../art/pieces.ts';
import { groups, pieces } from '../../art/pieces.ts';
import { navigate, pathOf } from '../route.ts';

/** every piece, grouped by where it ships: the profile, frame, bytes, then spots and icons */
export const PieceRail = (props: PieceRailProps) => {
  const groupListJSX = groups.map((group) => {
    const itemListJSX = pieces
      .filter((piece) => piece.group === group)
      .map((piece) => {
        const isActive = piece.id === props.piece.id;
        const route = { piece: piece.id, view: { kind: 'live' } } as const;
        return (
          <li key={piece.id}>
            <a
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-ink-muted transition-colors duration-150 hover:bg-fill-on/60 hover:text-ink',
                isActive && 'bg-fill-on font-semibold text-ink',
              )}
              href={pathOf(route)}
              onClick={(event) => {
                // ⌘, ctrl, ⇧ or ⌥ keep the browser's own link behaviour, a new tab or window
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                )
                  return;
                event.preventDefault();
                navigate(route);
                props.onPick?.();
              }}>
              <span className='truncate'>{piece.id}</span>
              <span className='font-mono text-[12px] text-ink-muted'>
                {piece.kind}
              </span>
            </a>
          </li>
        );
      });
    return (
      <section
        aria-labelledby={`group-${group}`}
        className='px-2 pb-3'
        key={group}>
        <h3
          className='px-2 pb-1 font-mono text-[12px] text-ink-muted'
          id={`group-${group}`}>
          {group}
        </h3>
        <ul>{itemListJSX}</ul>
      </section>
    );
  });

  return (
    <nav
      aria-labelledby='pieces-title'
      className='flex max-h-[inherit] min-h-0 flex-1 flex-col'>
      <h2
        className='flex items-baseline justify-between px-4 pt-3 pb-1 font-semibold text-ink text-sm'
        id='pieces-title'>
        pieces
        <span className='font-mono normal-case tracking-normal'>
          {pieces.length}
        </span>
      </h2>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='pt-1'>{groupListJSX}</div>
      </ScrollArea>
    </nav>
  );
};

/* Types */

interface PieceRailProps {
  onPick?: () => void;
  piece: Piece;
}
