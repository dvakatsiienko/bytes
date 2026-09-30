import type { ReactNode } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import { edges } from '../ring.ts';
import { useRoute } from '../route.ts';
import type { Settings } from '../stage/settings.ts';
import { defaults } from '../stage/settings.ts';
import { patchSettingsAtom, ringAtom, settingsByPieceAtom } from '../state.ts';
import { PiecesButton } from './corner-piece';
import { CornerTakes } from './corner-takes';
import { CornerTools } from './corner-tools';
import { timeOptions } from './corner-view';
import { Section } from './error-boundary';
import { Key } from './key';
import { PieceView } from './piece-view';
import { EdgePanel, FlatCard } from './ring-edges';
import { Segmented } from './segmented';
import { CompareCard, TakePanel } from './take-view';

/**
 * Below 1100 px the ring unrolls: a bar on top, the art, the four edges as
 * tabs under it, the takes, then the tools and the shot. The page scrolls;
 * the piece stays the biggest thing on it.
 */
export const RingUnrolled = (props: RingUnrolledProps) => {
  return (
    <div className='flex h-dvh scroll-py-3 flex-col gap-4 overflow-y-auto p-4'>
      <header className='glass flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5'>
        {props.wordmark}
        <span aria-hidden='true' className='h-5 w-px bg-border' />
        <span className='font-semibold text-base'>{props.piece.id}</span>
        <Section name='pieces'>
          <PiecesButton piece={props.piece} />
        </Section>
        <span className='flex-1' />
        <Section name='header'>
          <div className='w-44'>
            <Segmented
              ariaLabel='time of day'
              onValueChange={props.actions.setTime}
              options={timeOptions}
              value={props.actions.time}
            />
          </div>
          <button
            className='flex h-8 items-center gap-1.5 rounded-lg bg-fill px-2 text-sm hover:bg-fill-on'
            onClick={props.actions.openPalette}
            type='button'>
            commands <Key keys='⌘K' />
          </button>
        </Section>
      </header>
      <div
        className='relative max-h-[62dvh] w-full shrink-0 overflow-hidden rounded-xl border border-border'
        // a lit piece: as tall as it is at this width; a flat one also needs the room its caption and lands take
        style={
          props.actions.isStage
            ? { aspectRatio: `${props.piece.size.w} / ${props.piece.size.h}` }
            : { height: '36rem' }
        }>
        <Section name='viewport'>
          <PieceView actions={props.actions} piece={props.piece} />
        </Section>
      </div>
      <Section name='panel'>
        <UnrolledEdges actions={props.actions} piece={props.piece} />
      </Section>
      <Section name='takes'>
        <CornerTakes
          actions={props.actions}
          isStrip={true}
          piece={props.piece}
        />
      </Section>
      <Section name='toolbar'>
        <CornerTools actions={props.actions} />
      </Section>
    </div>
  );
};

/** the four edges as tabs; one always shows, the first until another is picked */
const UnrolledEdges = (props: UnrolledEdgesProps) => {
  const ring = useAtomValue(ringAtom);
  const setRing = useSetAtom(ringAtom);
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const patchSettings = useSetAtom(patchSettingsAtom);
  const update = (patch: Partial<Settings>) =>
    patchSettings(props.piece.id, patch);
  const shown = edges.find((edge) => edge.id === ring) ?? edges[0];
  const { view } = useRoute();

  let recordJSX: ReactNode = null;
  if (view.kind === 'take') recordJSX = <TakePanel piece={props.piece} />;
  if (view.kind === 'compare') recordJSX = <CompareCard />;

  return (
    <section
      aria-label='settings ring'
      className='flex shrink-0 flex-col gap-3'>
      {recordJSX ? <div className='glass'>{recordJSX}</div> : null}
      {props.actions.isStage ? (
        <>
          {/* a phone has no room for the keys beside the four names */}
          <div className='glass p-1 max-[520px]:[&_.key]:hidden'>
            <Segmented
              ariaLabel='settings edge'
              onValueChange={(edge) => setRing(edge)}
              options={edgeOptions}
              value={shown.id}
            />
          </div>
          <EdgePanel
            actions={props.actions}
            className='static max-h-none w-full'
            edge={shown}
            isBand={true}
            key={shown.id}
            onChange={update}
            settings={settings}
          />
        </>
      ) : (
        <FlatCard
          actions={props.actions}
          className='static w-full translate-x-0'
          onChange={update}
          settings={settings}
        />
      )}
    </section>
  );
};

/* Helpers */

const edgeOptions = edges.map((edge) => {
  return { icon: <Key keys={edge.key} />, label: edge.id, value: edge.id };
});

/* Types */

interface RingUnrolledProps {
  actions: StudioActions;
  piece: Piece;
  /** the way home, outside every section */
  wordmark: ReactNode;
}

interface UnrolledEdgesProps {
  actions: StudioActions;
  piece: Piece;
}
