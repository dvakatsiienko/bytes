import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';

import type { Piece } from '../art/pieces.ts';
import { pieceSvg, pieces } from '../art/pieces.ts';
import { errorText } from './error-text.ts';
import { resolveTheme, toggledTheme, useMediaQuery } from './hooks.ts';
import { copyPng, stageCanvas, svgDataUrl } from './image.ts';
import { navigate, useRoute } from './route.ts';
import { stageScenes } from './stage/scenes.ts';
import { defaults } from './stage/settings.ts';
import {
  bakeAskAtom,
  bakeNotesAtom,
  fitKeyAtom,
  isPaletteOpenAtom,
  isPlayingAtom,
  patchSettingsAtom,
  readmeAtom,
  readmeWidths,
  settingsByPieceAtom,
  themeAtom,
  timeAtom,
  zoomAtom,
} from './state.ts';
import { takeUrl, useBake, useShownTake } from './takes.ts';

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
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const setZoom = useSetAtom(zoomAtom);
  const setFitKey = useSetAtom(fitKeyAtom);
  const setPaletteOpen = useSetAtom(isPaletteOpenAtom);
  const patchSettings = useSetAtom(patchSettingsAtom);
  const settings = useAtomValue(settingsByPieceAtom)[piece.id] ?? defaults;
  const { list, take: shownTake } = useShownTake(piece.id);
  const takes = list?.takes ?? [];
  const bakeMutation = useBake();
  const [bakeAsk, setBakeAsk] = useAtom(bakeAskAtom);
  const [bakeNotes, setBakeNotes] = useAtom(bakeNotesAtom);
  const isStage = Boolean(stageScenes[piece.id]);
  const hasMotion = isStage && !stageScenes[piece.id]?.isStill;
  const { view } = route;

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
    // one toast for the whole bake: its title stays, the line under it says the step and the seconds so far
    const title =
      frames > 1
        ? `baking a ${frames}-frame loop of ${piece.id} · ${time}`
        : `baking ${piece.id} · ${time}`;
    const started = Date.now();
    const seconds = () => `${Math.round((Date.now() - started) / 1000)} s`;
    let step = 'starting';
    const id = toast.loading(title, { description: step });
    const show = () =>
      toast.loading(title, { description: `${step} · ${seconds()}`, id });
    const tick = setInterval(show, 1000);
    bakeMutation
      .mutateAsync({
        frames,
        note,
        onStep: (current) => {
          step = current;
          show();
        },
        piece: piece.id,
        settings,
        time,
      })
      .then((take) =>
        toast.success(`baked take ${take.id}`, {
          action: {
            label: 'open',
            onClick: () =>
              navigate({
                piece: piece.id,
                view: { kind: 'take', take: take.id },
              }),
          },
          description: `in ${seconds()}`,
          duration: 4000,
          id,
        }),
      )
      .catch((error: unknown) =>
        toast.error(`bake failed: ${errorText(error)}`, {
          description: `at «${step}» after ${seconds()}`,
          duration: 8000,
          id,
        }),
      )
      .finally(() => clearInterval(tick));
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
    // from anywhere: the viewer closes, and a zoomed live view goes back to fit
    goLive: () => {
      setZoom(null);
      if (view.kind === 'live') setFitKey((key) => key + 1);
      else navigate({ piece: piece.id, view: { kind: 'live' } });
    },
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
    theme: resolveTheme(theme, prefersDark),
    time,
    togglePlay: () => setIsPlaying(!isPlaying),
    toggleTheme: () => setTheme(toggledTheme(theme, prefersDark)),
    toggleTime: () => setTime(time === 'day' ? 'night' : 'day'),
    zoom,
  };
};

/* Types */

export type StudioActions = ReturnType<typeof useStudioActions>;
