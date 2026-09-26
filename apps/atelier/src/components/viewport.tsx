import { Button } from '@ui/kit/components/button';
import { useAtom, useAtomValue } from 'jotai';
import {
  ArrowLeftIcon,
  CopyIcon,
  MaximizeIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon,
} from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import type { StudioActions } from '../actions.ts';
import { pathOf, useRoute } from '../route.ts';
import { defaults } from '../stage/settings.ts';
import type { ReadmeWidth } from '../state.ts';
import { compareModeAtom, fitKeyAtom, settingsByPieceAtom } from '../state.ts';
import { useShownTake } from '../takes.ts';
import { BakeButton } from './bake-button';
import { CompareView } from './compare-view';
import { Section } from './error-boundary';
import { LiveView } from './live-view';
import { ReadmeFrame, frameChromeHeight } from './readme-frame';
import { Segmented } from './segmented';
import { TakeImage } from './take-view';
import { ZoomBox } from './zoom-box';

const timeOptions = [
  { icon: <SunIcon />, label: 'day', value: 'day' },
  { icon: <MoonIcon />, label: 'night', value: 'night' },
] as const;

const readmeOptions = [
  { label: 'fit', value: 'fit' },
  { label: 'phone', value: 'phone' },
  { label: 'desktop', value: 'desktop' },
] as const;

const compareOptions = [
  { label: 'side by side', value: 'side' },
  { label: 'slider', value: 'slider' },
] as const;

/** the bench: the piece under the lamp, the tools for looking at it above */
export const Viewport = (props: ViewportProps) => {
  const route = useRoute();
  const settings =
    useAtomValue(settingsByPieceAtom)[props.piece.id] ?? defaults;
  const [compareMode, setCompareMode] = useAtom(compareModeAtom);
  const fitKey = useAtomValue(fitKeyAtom);
  const { list, take: shownTake } = useShownTake(props.piece.id);
  const { view } = route;
  const takeOf = (id: string) => list?.takes.find((take) => take.id === id);
  const pair =
    view.kind === 'compare'
      ? ([takeOf(view.a), takeOf(view.b)] as const)
      : null;

  let contentJSX = (
    <LiveView
      piece={props.piece}
      settings={settings}
      time={props.actions.time}
    />
  );
  if (view.kind === 'take') {
    contentJSX = shownTake ? (
      <TakeImage piece={props.piece} take={shownTake} />
    ) : (
      <Missing isLoading={!list} what={`take ${view.take}`} />
    );
  }
  if (pair) {
    const [a, b] = pair;
    contentJSX =
      a && b ? (
        <CompareView a={a} b={b} mode={compareMode} piece={props.piece} />
      ) : (
        <Missing isLoading={!list} what='one of the two takes' />
      );
  }

  return (
    <main aria-label='viewport' className='flex h-full min-h-0 flex-col'>
      {/* min-h-13 is shared with the side panel's header, so their two lines meet */}
      <div className='flex min-h-13 flex-wrap items-center gap-2 border-border border-b px-4 py-2'>
        <Section name='toolbar'>
          {view.kind === 'live' ? null : (
            <Button onClick={props.actions.goLive} size='sm' variant='ghost'>
              <ArrowLeftIcon /> live
            </Button>
          )}
          <Segmented
            label='time'
            onValueChange={props.actions.setTime}
            options={timeOptions}
            value={props.actions.time}
          />
          <Segmented
            label='readme'
            onValueChange={props.actions.setReadme}
            options={readmeOptions}
            value={props.actions.readme}
          />
          {view.kind === 'live' && props.actions.hasMotion ? (
            <Button
              aria-pressed={props.actions.isPlaying}
              onClick={props.actions.togglePlay}
              size='sm'
              title='play motion (p)'
              variant='ghost'>
              {props.actions.isPlaying ? <PauseIcon /> : <PlayIcon />}
              {props.actions.isPlaying ? 'stop' : 'play'}
            </Button>
          ) : null}
          <div className='ml-auto flex items-center gap-1'>
            <Button
              aria-label='zoom into the image'
              disabled={Boolean(pair)}
              onClick={props.actions.zoom}
              size='icon-sm'
              title='zoom (z)'
              variant='ghost'>
              <MaximizeIcon />
            </Button>
            <Button
              aria-label='copy the image as png'
              disabled={Boolean(pair)}
              onClick={() => props.actions.copyImage()}
              size='icon-sm'
              title='copy png (c)'
              variant='ghost'>
              <CopyIcon />
            </Button>
            <BakeButton actions={props.actions} />
          </div>
        </Section>
      </div>
      <div className='min-h-0 flex-1 overflow-auto p-6'>
        <Section name='viewport'>
          <div className='mx-auto flex max-w-[1400px] flex-col gap-6'>
            {pair ? (
              <div className='flex justify-end'>
                <Segmented
                  ariaLabel='compare mode'
                  onValueChange={setCompareMode}
                  options={compareOptions}
                  value={compareMode}
                />
              </div>
            ) : null}
            <div className='rounded-[10px] bg-surface p-4 shadow-lamp'>
              <ReadmeFrame width={props.actions.readme}>
                {pair ? (
                  contentJSX
                ) : (
                  <div
                    className='mx-auto'
                    data-testid={
                      props.actions.isStage ? undefined : 'flat-piece'
                    }
                    style={{
                      width: props.actions.isStage
                        ? undefined
                        : flatWidth(props.piece, props.actions.readme),
                    }}>
                    <ZoomBox
                      fitKey={fitKey}
                      // a new piece, take, time or frame starts unzoomed
                      key={`${pathOf(route)}:${props.actions.time}:${props.actions.readme}`}
                      mode='canvas'>
                      {contentJSX}
                    </ZoomBox>
                  </div>
                )}
              </ReadmeFrame>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
};

const Missing = (props: { what: string; isLoading: boolean }) => {
  return (
    <p className='py-16 text-center text-muted-foreground'>
      {props.isLoading
        ? 'loading the takes…'
        : `${props.what} is not in this piece's takes`}
    </p>
  );
};

/* Helpers */

/** the header, the toolbar, the viewport's padding and the mat's: what stands between the window and a piece */
const CHROME_HEIGHT = '13rem';

/**
 * A flat piece is drawn for its own size: a 512 px favicon stretched over the
 * bench reads as a different picture. It shows at that size, narrower when the
 * frame or the window height would clip it; the zoom gives the detail.
 */
const flatWidth = (piece: Piece, readme: ReadmeWidth) =>
  `min(100%, ${piece.size.w}px, calc((100dvh - ${CHROME_HEIGHT} - ${frameChromeHeight(readme)}px) * ${piece.size.w / piece.size.h}))`;

/* Types */

interface ViewportProps {
  actions: StudioActions;
  piece: Piece;
}
