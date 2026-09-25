import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';

import type { Piece } from '../art/pieces.ts';
import { pieceSvg, pieces } from '../art/pieces.ts';
import { errorText } from './error-text.ts';
import { copyPng, stageCanvas, svgDataUrl } from './image.ts';
import { navigate, useRoute } from './route.ts';
import { stageScenes } from './stage/scenes.ts';
import { defaults } from './stage/settings.ts';
import {
  bakeAskAtom,
  bakeNotesAtom,
  isPaletteOpenAtom,
  isPlayingAtom,
  patchSettingsAtom,
  readmeAtom,
  readmeWidths,
  settingsByPieceAtom,
  themeAtom,
  themes,
  timeAtom,
  zoomAtom,
} from './state.ts';
import { takeUrl, useBake, useTakes } from './takes.ts';

const next = <T>(list: readonly T[], value: T) =>
  list[(list.indexOf(value) + 1) % list.length] as T;

/**
 * Every action the studio offers, in one place: the toolbar buttons, the bare
 * hotkeys and the command palette all call these, so no action has two
 * implementations.
 */
export const useStudioActions = (piece: Piece) => {
  const route = useRoute();
  const [time, setTime] = useAtom(timeAtom);
  const [readme, setReadme] = useAtom(readmeAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const setZoom = useSetAtom(zoomAtom);
  const setPaletteOpen = useSetAtom(isPaletteOpenAtom);
  const patchSettings = useSetAtom(patchSettingsAtom);
  const settings = useAtomValue(settingsByPieceAtom)[piece.id] ?? defaults;
  const takes = useTakes(piece.id).data?.takes ?? [];
  const bakeMutation = useBake();
  const [bakeAsk, setBakeAsk] = useAtom(bakeAskAtom);
  const [bakeNotes, setBakeNotes] = useAtom(bakeNotesAtom);
  const isStage = Boolean(stageScenes[piece.id]);
  const hasMotion = isStage && !stageScenes[piece.id]?.isStill;
  const { view } = route;
  const shownTake =
    view.kind === 'take'
      ? takes.find((take) => take.id === view.take)
      : undefined;

  /** what is on screen as an image source: a take, the flat svg, or the live canvas */
  const onScreen = () => {
    if (shownTake)
      return {
        alt: `${piece.title}, take ${shownTake.id}`,
        scale: 1,
        src: takeUrl(shownTake),
      };
    if (view.kind !== 'live') return null;
    if (!isStage)
      return {
        alt: piece.title,
        scale: 2,
        src: svgDataUrl(pieceSvg(piece, time, settings.seed)),
      };
    const canvas = stageCanvas();
    return canvas
      ? { alt: piece.title, scale: 1, src: canvas.toDataURL('image/png') }
      : null;
  };

  /** every bake asks for its note first: a still, or with `frames` a motion loop */
  const askBake = (frames = 1) => {
    if (!bakeMutation.isPending) setBakeAsk(frames);
  };

  /** the asked bake, with its note; the note is kept for this piece's next bake */
  const bake = (note: string) => {
    const frames = bakeAsk ?? 1;
    setBakeAsk(null);
    if (bakeMutation.isPending) return;
    setBakeNotes({ ...bakeNotes, [piece.id]: note });
    const pending = bakeMutation.mutateAsync({
      frames,
      note,
      piece: piece.id,
      settings,
      time,
    });
    toast.promise(pending, {
      error: (error: unknown) => `bake failed: ${errorText(error)}`,
      loading:
        frames > 1
          ? `baking a ${frames}-frame loop of ${piece.id} · ${time}…`
          : `baking ${piece.id} · ${time}…`,
      success: (take) => ({
        action: {
          label: 'open',
          onClick: () =>
            navigate({
              piece: piece.id,
              view: { kind: 'take', take: take.id },
            }),
        },
        message: `baked take ${take.id}`,
      }),
    });
  };

  const copyImage = async () => {
    const image = onScreen();
    if (!image) return;
    try {
      await copyPng(image.src, image.scale);
      toast.success('copied the image as png');
    } catch (error) {
      toast.error(`copy failed: ${errorText(error)}`);
    }
  };

  const zoom = () => {
    const image = onScreen();
    if (image) setZoom({ alt: image.alt, src: image.src });
  };

  const stepTake = (direction: 1 | -1) => {
    if (takes.length === 0) return;
    // from the live view, forward starts at the newest take and back at the oldest
    const start = direction === 1 ? -1 : takes.length;
    const index = shownTake ? takes.indexOf(shownTake) : start;
    const target = takes[index + direction];
    if (target)
      navigate({ piece: piece.id, view: { kind: 'take', take: target.id } });
  };

  const copySettings = async () => {
    try {
      await navigator.clipboard.writeText(
        `${JSON.stringify(settings, null, 2)}\n`,
      );
      toast.success(`copied the ${piece.id} settings`);
    } catch (error) {
      toast.error(`copy failed: ${errorText(error)}`);
    }
  };

  return {
    askBake: () => askBake(),
    // 72 frames: 12 a second over the six-second loop, the rate the stage plays at
    askBakeLoop: () => askBake(72),
    bake,
    bakeAsk,
    bakeNote: bakeNotes[piece.id] ?? '',
    cancelBake: () => setBakeAsk(null),
    copyImage,
    copySettings,
    cycleReadme: () => setReadme(next(readmeWidths, readme)),
    cycleTheme: () => setTheme(next(themes, theme)),
    goLive: () => navigate({ piece: piece.id, view: { kind: 'live' } }),
    goPiece: (id: string) => navigate({ piece: id, view: { kind: 'live' } }),
    hasMotion,
    isBaking: bakeMutation.isPending,
    isPlaying,
    isStage,
    nextTake: () => stepTake(1),
    openPalette: () => setPaletteOpen(true),
    pieces,
    previousTake: () => stepTake(-1),
    readme,
    resetSettings: () => {
      patchSettings(piece.id, null);
      toast(`reset the ${piece.id} settings`);
    },
    setReadme,
    setTheme,
    setTime,
    theme,
    time,
    togglePlay: () => setIsPlaying(!isPlaying),
    toggleTime: () => setTime(time === 'day' ? 'night' : 'day'),
    zoom,
  };
};

/* Types */

export type StudioActions = ReturnType<typeof useStudioActions>;
