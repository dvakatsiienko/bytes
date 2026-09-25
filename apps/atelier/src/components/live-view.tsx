import { useState } from 'react';
import { Progress } from '@ui/kit/components/progress';
import { useAtomValue } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import { pieceSvg } from '../../art/pieces.ts';
import type { Time } from '../../art/time.ts';
import { svgDataUrl } from '../image.ts';
import { stageScenes } from '../stage/scenes.ts';
import type { Settings } from '../stage/settings.ts';
import { isPlayingAtom } from '../state.ts';
import { StageCanvas } from './stage-canvas';

/**
 * The piece as it is now: lit on the stage when it has one, else its flat svg.
 * `data-rendered="<piece>:<time>"` appears once the first frame is drawn — the
 * signal a headless check waits for; `data-error` carries a failed build.
 */
export const LiveView = (props: LiveViewProps) => {
  const isPlaying = useAtomValue(isPlayingAtom);
  const [rendered, setRendered] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const spec = stageScenes[props.piece.id];
  const aspectRatio = `${props.piece.size.w} / ${props.piece.size.h}`;

  if (!spec) {
    const label = `${props.piece.id}:${props.time}`;
    return (
      <div
        className='w-full'
        data-rendered={rendered === label ? label : undefined}
        data-testid='stage'
        style={{ aspectRatio }}>
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is the render signal, not an interaction */}
        <img
          alt={props.piece.title}
          className='block h-full w-full'
          height={props.piece.size.h}
          onLoad={() => setRendered(label)}
          src={svgDataUrl(
            pieceSvg(props.piece, props.time, props.settings.seed),
          )}
          width={props.piece.size.w}
        />
      </div>
    );
  }

  const isDrawing = progress !== null && progress.done < progress.total;
  return (
    <div
      className='relative w-full'
      data-error={error ?? undefined}
      data-rendered={rendered ?? undefined}
      data-testid='stage'
      style={{ aspectRatio }}>
      <StageCanvas
        isPlaying={isPlaying}
        onError={setError}
        onProgress={(done, total) => {
          setProgress({ done, total });
          if (done < total) setRendered(null);
        }}
        onRendered={(label) => {
          setError(null);
          setRendered(label);
        }}
        pieceId={props.piece.id}
        settings={props.settings}
        spec={spec}
        time={props.time}
      />
      {isDrawing ? (
        <Progress
          aria-label='drawing the paper sheets'
          className='absolute inset-x-8 bottom-6'
          value={Math.round((progress.done / progress.total) * 100)}
        />
      ) : null}
      {error ? (
        <p
          className='absolute inset-x-4 bottom-4 rounded-md bg-popover p-3 text-destructive text-sm shadow-float'
          role='alert'>
          the scene did not build: {error}
        </p>
      ) : null}
    </div>
  );
};

/* Types */

interface LiveViewProps {
  piece: Piece;
  settings: Settings;
  time: Time;
}
