import type { AskView, BoardView } from '../server/job.ts';

/** air around a framed board, in screen px */
const FRAME_PAD = 48;
/** how far past the viewport a board still counts as near and stays a live frame, in screen px */
export const NEAR_MARGIN = 480;

/** the box every board fits in, in canvas units; boards are placed relative to its corner */
export const boundsOf = (boards: readonly Rect[]): Rect => {
  if (boards.length === 0) return { h: 1, w: 1, x: 0, y: 0 };
  const left = Math.min(...boards.map((board) => board.x));
  const top = Math.min(...boards.map((board) => board.y));
  const right = Math.max(...boards.map((board) => board.x + board.w));
  const bottom = Math.max(...boards.map((board) => board.y + board.h));
  return { h: bottom - top, w: right - left, x: left, y: top };
};

/** the transform (translate, then scale, origin top left) that centres `rect` in the viewport with `pad` around it */
export const frameRect = (
  rect: Rect,
  viewport: Size,
  pad = FRAME_PAD,
): View => {
  const scale = Math.min(
    (viewport.w - 2 * pad) / rect.w,
    (viewport.h - 2 * pad) / rect.h,
  );
  return {
    scale,
    x: viewport.w / 2 - (rect.x + rect.w / 2) * scale,
    y: viewport.h / 2 - (rect.y + rect.h / 2) * scale,
  };
};

export const MIN_SCALE = 0.02;
export const MAX_SCALE = 8;
/** px of wheel per doubling: a 100 px mouse notch with ⌘ is ×1.19 */
const WHEEL_PX_PER_DOUBLING = 400;
/** a trackpad pinch sends small deltas, so it doubles in a quarter of the distance */
const PINCH_PX_PER_DOUBLING = 100;
/** one event is capped at one notch, so a spike never jumps */
const MAX_DELTA_PX = 100;

/**
 * One wheel event against the view (`translate(x, y) scale(s)`, origin top
 * left). A pinch arrives as a wheel with ctrlKey; it and ⌘-scroll multiply the
 * scale by 2^(−px ÷ K) around the pointer, so the point under it stays put and
 * an equal scroll back returns the exact scale. A plain scroll pans.
 */
export const wheelView = (view: View, wheel: Wheel): View => {
  const toPx = (delta: number) => (wheel.deltaMode === 1 ? delta * 16 : delta);
  if (!(wheel.ctrlKey || wheel.metaKey))
    return {
      scale: view.scale,
      x: view.x - toPx(wheel.deltaX),
      y: view.y - toPx(wheel.deltaY),
    };
  const px = Math.min(
    MAX_DELTA_PX,
    Math.max(-MAX_DELTA_PX, toPx(wheel.deltaY)),
  );
  const perDoubling = wheel.ctrlKey
    ? PINCH_PX_PER_DOUBLING
    : WHEEL_PX_PER_DOUBLING;
  const scale = Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, view.scale * 2 ** (-px / perDoubling)),
  );
  const ratio = scale / view.scale;
  return {
    scale,
    x: wheel.pointX - (wheel.pointX - view.x) * ratio,
    y: wheel.pointY - (wheel.pointY - view.y) * ratio,
  };
};

const ASK_HASH = /^#(ask-\d+)$/;
const BOARD_HASH = /^#board-(.+)$/;

/** `#ask-2` opens an ask, `#board-Main` frames a board; anything else is the overview */
export const parseHash = (hash: string): Target => {
  const ask = ASK_HASH.exec(hash);
  if (ask?.[1]) return { ask: ask[1], kind: 'ask' };
  const board = BOARD_HASH.exec(hash);
  if (board?.[1]) return { board: decodeURIComponent(board[1]), kind: 'board' };
  return { kind: 'overview' };
};

export const askIdOf = (target: Target) =>
  target.kind === 'ask' ? target.ask : undefined;

export const boardHash = (board: Pick<BoardView, 'name'>) =>
  `#board-${encodeURIComponent(board.name)}`;

/** `j` / `k`: the next or previous ask, wrapping; from no ask, the first open one */
export const stepAsk = (
  asks: readonly Pick<AskView, 'id' | 'state'>[],
  currentId: string | undefined,
  direction: 1 | -1,
) => {
  const index = asks.findIndex((ask) => ask.id === currentId);
  if (index === -1)
    return (asks.find((ask) => ask.state === 'open') ?? asks[0])?.id;
  return asks[(index + direction + asks.length) % asks.length]?.id;
};

export const openCountOf = (asks: readonly Pick<AskView, 'state'>[]) =>
  asks.filter((ask) => ask.state === 'open').length;

export const tabTitle = (job: string, open: number) =>
  open > 0 ? `(${open}) ${job} · loupe` : `${job} · loupe`;

/** the lens mark; with open asks a count badge sits on it, «9+» past nine */
export const faviconSvg = (open: number) => {
  const lens =
    '<circle cx="13" cy="13" r="8.5" fill="none" stroke="#e2552b" stroke-width="3.5"/><path d="M19.5 19.5 28 28" stroke="#e2552b" stroke-width="4" stroke-linecap="round"/>';
  // a dark disc with a white edge reads on a light and a dark tab bar alike
  const badge =
    open > 0
      ? `<circle cx="23" cy="9" r="9" fill="#1c1b19" stroke="#fff" stroke-width="1.5"/><text x="23" y="13" font-family="system-ui,sans-serif" font-size="${open > 9 ? 9 : 12}" font-weight="700" text-anchor="middle" fill="#fff">${open > 9 ? '9+' : open}</text>`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${lens}${badge}</svg>`;
};

/* Types */

export interface Rect {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface Size {
  h: number;
  w: number;
}

export interface View {
  scale: number;
  x: number;
  y: number;
}

export interface Wheel {
  ctrlKey: boolean;
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  metaKey: boolean;
  /** the pointer, relative to the surface's top left */
  pointX: number;
  pointY: number;
}

export type Target =
  | { kind: 'ask'; ask: string }
  | { kind: 'board'; board: string }
  | { kind: 'overview' };
