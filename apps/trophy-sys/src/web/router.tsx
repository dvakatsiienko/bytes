import { Suspense, lazy } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { Layout } from './layout.tsx';
import { Library, LibraryEmpty, LibraryGame } from './library.tsx';
import { News } from './news.tsx';

/**
 * Split out, because /stats is the only route that needs visx and motion and
 * `/` redirects to /library. Loading a charting library to look at a game list
 * is most of the bundle spent on a page the visitor may never open.
 */
const Stats = lazy(() =>
  import('./stats.tsx').then((module) => ({ default: module.Stats })),
);

const rootRoute = createRootRoute({ component: Layout });

/**
 * Paths, not search params: the tabs are navigation and a game is a resource,
 * so /library/NPWR21924_00 is the honest URL. vercel.json rewrites every
 * non-/api path to index.html, which is what makes those deep links load.
 */
const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ replace: true, to: '/library' });
  },
  getParentRoute: () => rootRoute,
  path: '/',
});

const libraryRoute = createRoute({
  component: Library,
  getParentRoute: () => rootRoute,
  path: '/library',
});

const libraryIndexRoute = createRoute({
  component: LibraryEmpty,
  getParentRoute: () => libraryRoute,
  path: '/',
});

const libraryGameRoute = createRoute({
  component: LibraryGame,
  getParentRoute: () => libraryRoute,
  path: '$gameId',
});

const newsRoute = createRoute({
  component: News,
  getParentRoute: () => rootRoute,
  path: '/news',
});

const statsRoute = createRoute({
  component: () => (
    <Suspense
      fallback={
        <p className='grid flex-1 place-items-center text-[11px] text-dim'>
          loading the charts…
        </p>
      }>
      <Stats />
    </Suspense>
  ),
  getParentRoute: () => rootRoute,
  path: '/stats',
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    libraryRoute.addChildren([libraryIndexRoute, libraryGameRoute]),
    newsRoute,
    statsRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
