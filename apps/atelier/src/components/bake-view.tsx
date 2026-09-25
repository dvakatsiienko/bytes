import { useEffect, useRef, useState } from 'react';

import { findPiece } from '../../art/pieces.ts';
import { isTime } from '../../art/time.ts';
import { stageScenes } from '../stage/scenes.ts';
import { toSettings } from '../stage/settings.ts';
import { StageCanvas } from './stage-canvas';

/**
 * The page a bake screenshots: `?bake=<piece>&time=<day|night>&set=<json>`,
 * plus `&frames=<n>` for a motion loop. Only the canvas, at the piece's own
 * size; the bake's browser supplies the scale. `data-baked` on <html> says «ok»
 * or why not. A loop bake then calls `window.atelierFrame(i)`, which resolves
 * once frame i of n is on the canvas.
 */
export const BakeView = (props: BakeViewProps) => {
  const params = new URLSearchParams(location.search);
  const piece = findPiece(props.pieceId);
  const spec = piece ? stageScenes[piece.id] : undefined;
  const time = params.get('time');
  const frames = Math.max(
    1,
    Number.parseInt(params.get('frames') ?? '1', 10) || 1,
  );
  const [t, setT] = useState<number | undefined>(frames > 1 ? 0 : undefined);
  const [settings] = useState(() => toSettings(readJson(params.get('set'))));
  const waiting = useRef(new Map<number, () => void>());
  const lastDrawn = useRef<number | null>(null);
  const problem =
    piece && spec && isTime(time)
      ? null
      : `error: nothing to bake for «${props.pieceId}» at «${time}»`;

  useEffect(() => {
    if (problem) report(problem);
  }, [problem]);

  useEffect(() => {
    Object.assign(window, {
      atelierFrame: (index: number) =>
        new Promise<void>((resolve) => {
          const next = index / frames;
          // already on the canvas: setting the same t draws nothing new
          if (lastDrawn.current === next) return resolve();
          waiting.current.set(next, resolve);
          setT(next);
        }),
    });
  }, [frames]);

  if (!(piece && spec && isTime(time))) return null;

  return (
    <div style={{ height: piece.size.h, width: piece.size.w }}>
      <StageCanvas
        dpr={Number(params.get('dpr') ?? 2)}
        isPlaying={false}
        onError={(message) => report(`error: ${message}`)}
        onFrame={(drawn) => {
          lastDrawn.current = drawn;
          waiting.current.get(drawn)?.();
          waiting.current.delete(drawn);
        }}
        onRendered={() => report('ok')}
        pieceId={piece.id}
        settings={settings}
        spec={spec}
        t={t}
        time={time}
      />
    </div>
  );
};

/* Helpers */

const report = (state: string) => {
  document.documentElement.dataset.baked = state;
};

const readJson = (text: string | null): unknown => {
  try {
    return JSON.parse(text ?? '{}');
  } catch {
    return {};
  }
};

/* Types */

interface BakeViewProps {
  pieceId: string;
}
