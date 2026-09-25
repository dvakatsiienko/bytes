import { useSyncExternalStore } from 'react';

/**
 * A piece and a take are places, so they live in the path:
 * `/<piece>`, `/<piece>/take/<id>`, `/<piece>/compare/<a>/<b>`.
 * Four shapes do not earn a router dependency.
 */
const NAVIGATE = 'atelier:navigate';

const subscribe = (onChange: () => void) => {
  addEventListener('popstate', onChange);
  addEventListener(NAVIGATE, onChange);
  return () => {
    removeEventListener('popstate', onChange);
    removeEventListener(NAVIGATE, onChange);
  };
};

export const parseRoute = (pathname: string): Route => {
  const [piece = '', kind, a, b] = pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (kind === 'take' && a) return { piece, view: { kind: 'take', take: a } };
  if (kind === 'compare' && a && b)
    return { piece, view: { a, b, kind: 'compare' } };
  return { piece, view: { kind: 'live' } };
};

export const pathOf = (route: Route) => {
  const base = `/${encodeURIComponent(route.piece)}`;
  if (route.view.kind === 'take')
    return `${base}/take/${encodeURIComponent(route.view.take)}`;
  if (route.view.kind === 'compare') {
    return `${base}/compare/${encodeURIComponent(route.view.a)}/${encodeURIComponent(route.view.b)}`;
  }
  return base;
};

export const navigate = (route: Route, { isReplace = false } = {}) => {
  const path = pathOf(route);
  if (path === location.pathname) return;
  if (isReplace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  dispatchEvent(new Event(NAVIGATE));
};

export const useRoute = () =>
  parseRoute(useSyncExternalStore(subscribe, () => location.pathname));

/* Types */

export type View =
  | { kind: 'live' }
  | { kind: 'take'; take: string }
  | { kind: 'compare'; a: string; b: string };

export interface Route {
  piece: string;
  view: View;
}
