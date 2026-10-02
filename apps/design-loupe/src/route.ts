import type { MouseEvent } from 'react';
import { useSyncExternalStore } from 'react';

/**
 * The path is the place: `/speak/ask/2` opens an ask, `/speak/board/Main`
 * frames a board, anything else is the overview. Moving between them is
 * history.pushState, so the page and its board frames never reload.
 */
export const parseRoute = (path: string): Route => {
  const [, job = '', kind, rest = ''] = path.split('/');
  if (kind === 'ask' && ASK_NUMBER.test(rest))
    return { ask: `ask-${rest}`, job, kind: 'ask' };
  if (kind === 'board' && rest)
    return { board: decodeURIComponent(rest), job, kind: 'board' };
  return { job, kind: 'overview' };
};

export const askPath = (job: string, askId: string) =>
  `/${job}/ask/${askId.replace(ASK_PREFIX, '')}`;

export const boardPath = (job: string, board: string) =>
  `/${job}/board/${encodeURIComponent(board)}`;

export const askIdOf = (route: Route) =>
  route.kind === 'ask' ? route.ask : undefined;

export const usePath = () => useSyncExternalStore(subscribe, read);

/** a link to the path already open moves nothing; this asks the surface to frame it again */
export const REFRAME_EVENT = 'loupe:reframe';

export const navigate = (path: string) => {
  if (path === location.pathname) {
    window.dispatchEvent(new Event(REFRAME_EVENT));
    return;
  }
  history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/** a plain click stays in the page; a ⌘-click or a middle click still opens a tab */
export const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
  const isPlain =
    event.button === 0 &&
    !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
  if (!isPlain) return;
  event.preventDefault();
  navigate(event.currentTarget.pathname);
};

/* Helpers */

const ASK_NUMBER = /^\d+$/;
const ASK_PREFIX = /^ask-/;

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

const read = () => location.pathname;

/* Types */

export type Route =
  | { kind: 'ask'; ask: string; job: string }
  | { kind: 'board'; board: string; job: string }
  | { kind: 'overview'; job: string };
