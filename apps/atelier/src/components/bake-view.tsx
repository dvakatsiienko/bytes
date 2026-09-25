import { findPiece } from '../../art/pieces.ts';
import { isTime } from '../../art/time.ts';
import { stageScenes } from '../stage/scenes.ts';
import { toSettings } from '../stage/settings.ts';
import { StageCanvas } from './stage-canvas';

/**
 * The page a bake screenshots: `?bake=<piece>&time=<day|night>&set=<json>`.
 * Only the canvas, at the piece's own size; the bake's browser supplies the 2×.
 * `data-baked` on <html> tells the bake «ok» or why not.
 */
export const BakeView = (props: BakeViewProps) => {
  const params = new URLSearchParams(location.search);
  const piece = findPiece(props.pieceId);
  const spec = piece ? stageScenes[piece.id] : undefined;
  const time = params.get('time');
  const report = (state: string) => {
    document.documentElement.dataset.baked = state;
  };

  if (!(piece && spec && isTime(time))) {
    report(`error: nothing to bake for «${props.pieceId}» at «${time}»`);
    return null;
  }

  const settings = toSettings(readJson(params.get('set')));

  return (
    <div style={{ height: piece.size.h, width: piece.size.w }}>
      <StageCanvas
        dpr={2}
        isPlaying={false}
        onError={(message) => report(`error: ${message}`)}
        onRendered={() => report('ok')}
        pieceId={piece.id}
        settings={settings}
        spec={spec}
        time={time}
      />
    </div>
  );
};

/* Helpers */

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
