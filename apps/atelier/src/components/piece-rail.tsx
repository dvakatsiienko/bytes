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
                'flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface/70 hover:text-foreground',
                isActive &&
                  'bg-surface font-medium text-foreground shadow-hairline',
              )}
              href={pathOf(route)}
              onClick={(event) => {
                event.preventDefault();
                navigate(route);
              }}>
              <span className='truncate'>{piece.id}</span>
              <span className='font-mono text-[12px] text-muted-foreground'>
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
          className='px-2 pb-1 font-mono text-[12px] text-muted-foreground'
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
      className='flex max-h-[45%] min-h-0 shrink-0 flex-col border-border border-b'>
      <h2
        className='flex items-baseline justify-between px-4 pt-3 pb-1 font-medium text-[12px] text-muted-foreground uppercase tracking-[0.08em]'
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
  piece: Piece;
}
