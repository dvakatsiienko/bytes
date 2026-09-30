import type { ReactNode } from 'react';
import { cn } from 'cn';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import type { Theme } from '../state.ts';
import { Section } from './error-boundary';
import { PieceCard } from './piece-card';
import { PieceView } from './piece-view';
import { RingEdges } from './ring-edges';
import { TakesDock } from './takes-dock';
import { ToolDock } from './tool-dock';
import { ViewCard } from './view-card';

/**
 * The wide studio (docs/adr/0002): the piece under everything, four corner
 * cards and the four edges floating over it. Each corner reports its height
 * as `--tl`, `--tr`, `--bl` or `--br`, so the edges open in the room the
 * corners leave, whatever a corner holds.
 */
export const LensRing = (props: LensRingProps) => {
  return (
    <div className='absolute inset-0' data-ring>
      <Section name='viewport'>
        <PieceView actions={props.actions} piece={props.piece} />
      </Section>
      <div className='pointer-events-none absolute inset-0'>
        <Corner className='top-4 left-4 w-[300px]' name='tl'>
          <Section name='pieces'>
            <PieceCard actions={props.actions} piece={props.piece} />
          </Section>
          <div className='absolute top-3 left-3.5'>{props.wordmark}</div>
        </Corner>
        <Corner className='top-4 right-4 w-[300px]' name='tr'>
          <Section name='header'>
            <ViewCard actions={props.actions} theme={props.theme} />
          </Section>
        </Corner>
        <Section name='panel'>
          <RingEdges actions={props.actions} piece={props.piece} />
        </Section>
        <Corner
          className={cn(
            'bottom-4 left-4',
            props.actions.ring === 'takes' ? 'right-[332px]' : 'w-[300px]',
          )}
          name='bl'>
          <Section name='takes'>
            <TakesDock actions={props.actions} piece={props.piece} />
          </Section>
        </Corner>
        <Corner className='right-4 bottom-4 w-[300px]' name='br'>
          <Section name='toolbar'>
            <ToolDock actions={props.actions} />
          </Section>
        </Corner>
      </div>
    </div>
  );
};

const Corner = (props: CornerProps) => {
  return (
    <div
      className={cn('pointer-events-auto absolute', props.className)}
      ref={measures[props.name]}>
      {props.children}
    </div>
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

interface LensRingProps {
  actions: StudioActions;
  piece: Piece;
  theme: Theme;
  /** the way home, outside every section: a crashed corner keeps it */
  wordmark: ReactNode;
}

interface CornerProps {
  children: ReactNode;
  className: string;
  name: CornerName;
}
