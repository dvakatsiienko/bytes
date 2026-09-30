import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';

import type { Piece } from '../art/pieces.ts';
import { pieceSvg, pieces } from '../art/pieces.ts';
import { errorText } from './error-text.ts';
import { resolveTheme, toggledTheme, useMediaQuery } from './hooks.ts';
import { copyPng, stageCanvas, svgDataUrl } from './image.ts';
import type { Edge, Openable } from './ring.ts';
import { toggleRing } from './ring.ts';
import { navigate, useRoute } from './route.ts';
import { stageScenes } from './stage/scenes.ts';
import { defaults } from './stage/settings.ts';
import {
  findFocusAtom,
  fitKeyAtom,
  isPaletteOpenAtom,
  isPlayingAtom,
  patchSettingsAtom,
  piecesOpenAtom,
  pixelGridAtom,
  pixelViewAtom,
  pixelZoomAtom,
  readmeAtom,
  readmeWidths,
  ringAtom,
  settingsByPieceAtom,
  shotAskAtom,
  shotNotesAtom,
  shotStepAtom,
  themeAtom,
  timeAtom,
  zoomAtom,
} from './state.ts';
import { takeUrl, useShot, useShownTake } from './takes.ts';

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
  const shotMutation = useShot();
  const [shotAsk, setShotAsk] = useAtom(shotAskAtom);
  const [shotNotes, setShotNotes] = useAtom(shotNotesAtom);
  const setShotStep = useSetAtom(shotStepAtom);
  const [ring, setRing] = useAtom(ringAtom);
  const setFindFocus = useSetAtom(findFocusAtom);
  const setPiecesOpen = useSetAtom(piecesOpenAtom);
  const [pixelView, setPixelView] = useAtom(pixelViewAtom);
  const setPixelZoom = useSetAtom(pixelZoomAtom);
  const setPixelGrid = useSetAtom(pixelGridAtom);
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

  /** every shot asks for its note first: a still, or with `frames` a motion loop */
  const askShot = (frames = 1) => {
    if (!shotMutation.isPending) setShotAsk(frames);
  };

  /** the asked shot, with its note; the note is kept for this piece's next shot */
  const shoot = (note: string) => {
    const frames = shotAsk ?? 1;
    setShotAsk(null);
    if (shotMutation.isPending) return;
    setShotNotes({ ...shotNotes, [piece.id]: note });
    // one toast for the whole shot: its title stays, the line under it says the step and the seconds so far
    const title =
      frames > 1
        ? `shooting a ${frames}-frame loop of ${piece.id}\u00a0·\u00a0${time}`
        : `shooting ${piece.id}\u00a0·\u00a0${time}`;
    const started = Date.now();
    const seconds = () => `${Math.round((Date.now() - started) / 1000)} s`;
    let step = 'starting';
    setShotStep(step);
    const id = toast.loading(title, { description: step });
    const show = () =>
      toast.loading(title, { description: `${step} · ${seconds()}`, id });
    const tick = setInterval(show, 1000);
    shotMutation
      .mutateAsync({
        frames,
        note,
        onStep: (current) => {
          step = current;
          setShotStep(current);
          show();
        },
        piece: piece.id,
        settings,
        time,
      })
      .then((take) =>
        toast.success(`shot take ${take.id}`, {
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
        toast.error(`shot failed: ${errorText(error)}`, {
          description: `at «${step}» after ${seconds()}`,
          duration: 8000,
          id,
        }),
      )
      .finally(() => {
        clearInterval(tick);
        setShotStep(null);
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

  /** opening one thing on the ring folds the other; a fold hands focus back to what opened it */
  const turnRing = (target: Openable | null) => {
    const panel = document.activeElement?.closest('[data-ring-panel]');
    const closing = ring;
    setRing(target === null ? null : toggleRing(ring, target));
    if (panel && closing)
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLElement>(`[data-ring-opener="${closing}"]`)
          ?.focus(),
      );
  };

  const resetSettings = () => {
    const before = settings;
    patchSettings(piece.id, null);
    toast(`reset the ${piece.id} settings`, {
      action: { label: 'undo', onClick: () => patchSettings(piece.id, before) },
      duration: 5000,
    });
  };

  return {
    askShot: () => askShot(),
    // 72 frames: 12 a second over the six-second loop, the rate the stage plays at
    askShotLoop: () => askShot(72),
    cancelShot: () => setShotAsk(null),
    copyImage,
    copySettings,
    cycleReadme: () => setReadme(next(readmeWidths, readme)),
    // `/` from anywhere: the field lives in an open edge, so a folded ring opens its first one
    findSetting: () => {
      if (ring === null || ring === 'takes') setRing('light');
      setFindFocus((count) => count + 1);
    },
    foldRing: () => turnRing(null),
    // from anywhere: the viewer and a pixel view close, and a zoomed live view goes back to fit
    goLive: () => {
      setZoom(null);
      setPixelView(null);
      setPixelZoom(null);
      if (view.kind === 'live') setFitKey((key) => key + 1);
      else navigate({ piece: piece.id, view: { kind: 'live' } });
    },
    goPiece: (id: string) => navigate({ piece: id, view: { kind: 'live' } }),
    hasMotion,
    isPixelView: pixelView?.piece === piece.id,
    isPlaying,
    isShooting: shotMutation.isPending,
    isStage,
    newSeed: () =>
      patchSettings(piece.id, { seed: 1 + Math.floor(Math.random() * 9999) }),
    nextTake: () => stepTake(1),
    openPalette: () => setPaletteOpen(true),
    pieces,
    previousTake: () => stepTake(-1),
    readme,
    resetSettings,
    ring,
    setPixelZoom,
    setReadme,
    setTheme,
    setTime,
    shoot,
    shotAsk,
    shotNote: shotNotes[piece.id] ?? '',
    takeCount: takes.length,
    theme: resolveTheme(theme, prefersDark),
    time,
    toggleEdge: (edge: Edge) => turnRing(edge),
    toggleGrid: () => setPixelGrid((isOn) => !isOn),
    togglePieces: () => setPiecesOpen((isOpen) => !isOpen),
    togglePlay: () => setIsPlaying(!isPlaying),
    toggleStrip: () => turnRing('takes'),
    toggleTheme: () => setTheme(toggledTheme(theme, prefersDark)),
    toggleTime: () => setTime(time === 'day' ? 'night' : 'day'),
    zoom,
  };
};

/* Types */

export type StudioActions = ReturnType<typeof useStudioActions>;
