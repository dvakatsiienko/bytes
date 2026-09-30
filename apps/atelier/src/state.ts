import type { WritableAtom } from 'jotai';
import { atom } from 'jotai';

import type { Time } from '../art/time.ts';
import type { RingOpen } from './ring.ts';
import type { Settings } from './stage/settings.ts';
import { defaults, toSettings } from './stage/settings.ts';
import type { TakeFilter } from './takes.ts';

/**
 * Per-viewer conveniences only: the studio theme and the working settings.
 * A take is the record of a setting that mattered — it saves its own copy.
 */
const persisted = <T>(
  key: string,
  fallback: T,
  read: (raw: unknown) => T,
): WritableAtom<T, [T], void> => {
  let initial = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = read(JSON.parse(raw));
  } catch {
    /* a blocked or corrupt store falls back; the studio still works */
  }
  const base = atom(initial);
  return atom(
    (get) => get(base),
    (_get, set, next: T) => {
      set(base, next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* nothing to do: the value still lives for this session */
      }
    },
  );
};

export const themes = ['system', 'light', 'dark'] as const;
export const readmeWidths = ['fit', 'phone', 'desktop'] as const;

export const themeAtom = persisted<Theme>(
  'atelier:theme',
  'system',
  (raw) => themes.find((theme) => theme === raw) ?? 'system',
);

export const settingsByPieceAtom = persisted<Record<string, Settings>>(
  'atelier:settings',
  {},
  (raw) => {
    const record =
      typeof raw === 'object' && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    return Object.fromEntries(
      Object.entries(record).map(([piece, value]) => [
        piece,
        toSettings(value),
      ]),
    );
  },
);

/** the last bake note per piece, offered again on its next bake */
export const bakeNotesAtom = persisted<Record<string, string>>(
  'atelier:bake-notes',
  {},
  (raw) =>
    Object.fromEntries(
      Object.entries(typeof raw === 'object' && raw !== null ? raw : {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    ),
);

/** merge a patch into one piece's settings; `null` drops them back to the defaults */
export const patchSettingsAtom = atom(
  null,
  (get, set, pieceId: string, patch: Partial<Settings> | null) => {
    const byPiece = get(settingsByPieceAtom);
    if (patch === null) {
      const { [pieceId]: _dropped, ...rest } = byPiece;
      set(settingsByPieceAtom, rest);
      return;
    }
    set(settingsByPieceAtom, {
      ...byPiece,
      [pieceId]: { ...(byPiece[pieceId] ?? defaults), ...patch },
    });
  },
);

export const timeAtom = atom<Time>('day');
export const readmeAtom = atom<ReadmeWidth>('fit');
export const isPlayingAtom = atom(false);
export const compareModeAtom = atom<'side' | 'slider'>('side');
export const isPaletteOpenAtom = atom(false);
export const zoomAtom = atom<Zoom | null>(null);
/** each bump sends the bench's zoom back to fit, without redrawing the piece */
export const fitKeyAtom = atom(0);
export const takeFilterAtom = atom<TakeFilter>('all');
/** the one open edge of the ring, or the film strip; null when all are folded */
export const ringAtom = atom<RingOpen>(null);
/** the words typed into «find a setting» */
export const findAtom = atom('');
/** each bump focuses the find field: `/` from anywhere */
export const findFocusAtom = atom(0);
/** a favicon's pixel view: the piece, where it lands and the size it is drawn at; null for the whole piece */
export const pixelViewAtom = atom<PixelView | null>(null);
/** the pixel view's zoom: a whole number, or null for the largest that fits */
export const pixelZoomAtom = atom<number | null>(null);
/** the largest whole zoom the pixel view fits at, measured by the view */
export const pixelFitAtom = atom(1);
/** the grid between the pixels, from 8× */
export const pixelGridAtom = atom(true);
/** the frame of the six-second loop the playing motion shows, of 72 */
export const motionFrameAtom = atom(0);
/** a bake waiting for its note: how many frames it will bake, or null when none is asked */
export const bakeAskAtom = atom<number | null>(null);
/** the step a running bake is on, for the bake button; null when none runs */
export const bakeStepAtom = atom<string | null>(null);
/** the take whose stash form is open, wherever it was asked for */
export const stashFormAtom = atom<string | null>(null);

/* Types */

export type Theme = (typeof themes)[number];
export type ReadmeWidth = (typeof readmeWidths)[number];

export interface PixelView {
  land: string;
  piece: string;
  size: number;
}

export interface Zoom {
  alt: string;
  src: string;
}
