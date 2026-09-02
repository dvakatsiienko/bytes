import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { Layout } from './layout.tsx';
import { Library, LibraryEmpty, LibraryGame } from './library.tsx';
import { News } from './news.tsx';

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

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    libraryRoute.addChildren([libraryIndexRoute, libraryGameRoute]),
    newsRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
