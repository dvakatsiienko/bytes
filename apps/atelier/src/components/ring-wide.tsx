import type { CSSProperties, ReactNode } from 'react';
import { cn } from 'cn';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import type { Theme } from '../state.ts';
import { CornerPiece } from './corner-piece';
import { CornerTakes } from './corner-takes';
import { CornerTools } from './corner-tools';
import { CornerView } from './corner-view';
import { Section } from './error-boundary';
import { PieceView } from './piece-view';
import { RingEdges, SideCard } from './ring-edges';

/**
 * The wide studio (docs/adr/0002): the piece under everything, four corner
 * cards and the four edges floating over it. Each corner reports its height
 * as `--tl`, `--tr`, `--bl` or `--br`, so the edges open in the room the
 * corners leave, whatever a corner holds.
 */
export const RingWide = (props: RingWideProps) => {
  return (
    // the order is the tab order: the piece, then the ring row by row — top left, the edges, top right, the bottom corners
    <div
      className='absolute inset-0 [container-type:size]'
      data-ring
      style={{ '--art-top': artTopOf(props) } as CSSProperties}>
      <Section name='viewport'>
        <PieceView actions={props.actions} piece={props.piece} />
      </Section>
      <Corner className='top-4 left-4 w-[300px]' label='the piece' name='tl'>
        <div className='absolute top-3 left-3.5 z-10'>{props.wordmark}</div>
        <Section name='pieces'>
          <CornerPiece actions={props.actions} piece={props.piece} />
        </Section>
      </Corner>
      <Section name='panel'>
        <RingEdges actions={props.actions} piece={props.piece} />
      </Section>
      <Corner className='top-4 right-4 w-[300px]' label='the view' name='tr'>
        <Section name='header'>
          <CornerView actions={props.actions} theme={props.theme} />
          <SideCard piece={props.piece} ring={props.actions.ring} />
        </Section>
      </Corner>
      <Corner
        className={cn(
          'bottom-4 left-4',
          props.actions.ring === 'takes' ? 'right-[332px]' : 'w-[300px]',
        )}
        label='the takes'
        name='bl'>
        <Section name='takes'>
          <CornerTakes actions={props.actions} piece={props.piece} />
        </Section>
      </Corner>
      <Corner
        className='right-4 bottom-4 w-[300px]'
        label='the tools'
        name='br'>
        <Section name='toolbar'>
          <CornerTools actions={props.actions} />
        </Section>
      </Corner>
    </div>
  );
};

/**
 * How far the fitted piece's top edge sits below the window's: half the
 * height the piece leaves free. A readme frame or a compare is not the fitted
 * piece, so the ring keeps to the window's edge there.
 */
const artTopOf = (props: RingWideProps) => {
  const ratio = props.piece.size.h / props.piece.size.w;
  return props.actions.readme === 'fit' && props.view !== 'compare'
    ? `calc((100cqh - min(100cqh, 100cqw * ${ratio})) / 2)`
    : '0px';
};

const Corner = (props: CornerProps) => {
  return (
    <section
      aria-label={props.label}
      className={cn('absolute', props.className)}
      ref={measures[props.name]}>
      {props.children}
    </section>
  );
};

/* Helpers */

/** a corner's height, written onto the ring as `--<name>` and kept current */
const measure = (name: CornerName) => (node: HTMLElement | null) => {
  const ring = node?.closest<HTMLElement>('[data-ring]');
  if (!(node && ring)) return;
  const observer = new ResizeObserver(() =>
    ring.style.setProperty(`--${name}`, `${node.offsetHeight}px`),
  );
  observer.observe(node);
  return () => {
    observer.disconnect();
    ring.style.removeProperty(`--${name}`);
  };
};

const measures = {
  bl: measure('bl'),
  br: measure('br'),
  tl: measure('tl'),
  tr: measure('tr'),
} as const;

/* Types */

type CornerName = 'tl' | 'tr' | 'bl' | 'br';

interface RingWideProps {
  actions: StudioActions;
  piece: Piece;
  theme: Theme;
  view: 'live' | 'take' | 'compare';
  /** the way home, outside every section: a crashed corner keeps it */
  wordmark: ReactNode;
}

interface CornerProps {
  children: ReactNode;
  className: string;
  label: string;
  name: CornerName;
}
