import type { ReactNode } from 'react';
import { useAtomValue } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import { pathOf, useRoute } from '../route.ts';
import { defaults } from '../stage/settings.ts';
import { compareModeAtom, fitKeyAtom, settingsByPieceAtom } from '../state.ts';
import { useShownTake } from '../takes.ts';
import { CompareView } from './compare-view';
import { FlatView } from './flat-view';
import { LiveView } from './live-view';
import { ReadmeFrame } from './readme-frame';
import { TakeImage } from './take-view';
import { ZoomBox } from './zoom-box';

/**
 * The piece, as large as it fits whole: the live piece, a take, or two takes
 * compared. A flat piece sits on the plain ground at its own size instead.
 * The ring floats over all of it.
 */
export const PieceView = (props: PieceViewProps) => {
  const route = useRoute();
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const compareMode = useAtomValue(compareModeAtom);
  const fitKey = useAtomValue(fitKeyAtom);
  const { list, take: shownTake } = useShownTake(props.piece.id);
  const { view } = route;
  const ratio = props.piece.size.w / props.piece.size.h;
  const takeOf = (id: string) => list?.takes.find((take) => take.id === id);

  if (view.kind === 'compare') {
    const a = takeOf(view.a);
    const b = takeOf(view.b);
    // two side by side want twice the width; under the slider, one
    const across = compareMode === 'side' ? 2 : 1;
    // the tallest corner, above and below, and the captions' line
    const room =
      '(100cqh - 2 * max(var(--tl, 0px), var(--tr, 0px), var(--bl, 0px), var(--br, 0px)) - 88px)';
    const widths = ['100cqw', `calc(${room} * ${ratio * across})`];
    // a flat piece compares at its own size at most, as it sits on the plain ground
    if (!props.actions.isStage)
      widths.push(`${across * props.piece.size.w + 48}px`);
    return (
      <StageBox>
        {a && b ? (
          <div className='px-4' style={{ width: `min(${widths.join(', ')})` }}>
            <CompareView a={a} b={b} mode={compareMode} piece={props.piece} />
          </div>
        ) : (
          <Missing isLoading={!list} what='one of the two takes' />
        )}
      </StageBox>
    );
  }

  let contentJSX = (
    <LiveView
      piece={props.piece}
      settings={settings}
      time={props.actions.time}
    />
  );
  if (view.kind === 'take')
    contentJSX = shownTake ? (
      <TakeImage piece={props.piece} take={shownTake} />
    ) : (
      <Missing isLoading={!list} what={`take ${view.take}`} />
    );

  if (!props.actions.isStage)
    return (
      <FlatView piece={props.piece} readme={props.actions.readme}>
        {contentJSX}
      </FlatView>
    );

  const zoomJSX = (
    <ZoomBox
      fitKey={fitKey}
      // a new piece, take, time or frame starts unzoomed
      key={`${pathOf(route)}:${props.actions.time}:${props.actions.readme}`}
      mode='canvas'
      // the art's corners are under the ring's corners
      toolbarAt='top-centre'>
      {contentJSX}
    </ZoomBox>
  );

  return (
    <StageBox>
      {props.actions.readme === 'fit' ? (
        <div style={{ width: `min(100cqw, calc(100cqh * ${ratio}))` }}>
          {zoomJSX}
        </div>
      ) : (
        <ReadmeFrame width={props.actions.readme}>{zoomJSX}</ReadmeFrame>
      )}
    </StageBox>
  );
};

/** the whole window, a size container: a piece fits itself to `cqw` and `cqh` */
const StageBox = (props: { children: ReactNode }) => {
  return (
    <main
      aria-label='the piece'
      // isolate: the zoom box's own layers stay under the ring's glass
      className='absolute inset-0 isolate grid place-items-center overflow-hidden [container-type:size]'>
      {props.children}
    </main>
  );
};

const Missing = (props: { what: string; isLoading: boolean }) => {
  return (
    <p className='glass px-4 py-3 text-sm'>
      {props.isLoading
        ? 'loading the takes…'
        : `${props.what} is not in this piece's takes`}
    </p>
  );
};

/* Types */

interface PieceViewProps {
  actions: StudioActions;
  piece: Piece;
}
