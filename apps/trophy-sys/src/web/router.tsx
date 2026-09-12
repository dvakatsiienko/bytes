import { Suspense, lazy } from 'react';
import {
  type ErrorComponentProps,
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';

import { Admin } from './admin.tsx';
import { Layout } from './layout.tsx';
import { Library, LibraryEmpty, LibraryGame } from './library.tsx';
import { Log } from './log.tsx';

/**
 * Split out, because /stats is the only route that needs visx and motion and
 * `/` redirects to /library. Loading a charting library to look at a game list
 * is most of the bundle spent on a page the visitor may never open.
 */
const Stats = lazy(() =>
  import('./stats.tsx').then((module) => ({ default: module.Stats })),
);

/**
 * A render that throws used to paint white. It now says what broke and points
 * at /admin, because the usual cause is a PSN token the owner has to replace.
 * Declared before the routes because they reference it at module init.
 */
const RouteError = (props: ErrorComponentProps) => {
  const message =
    props.error instanceof Error ? props.error.message : String(props.error);

  return (
    <div className='flex h-full flex-col items-start gap-3 p-6'>
      <h1 className='text-lg text-orange tracking-[0.3em]'>TROPHY.SYS</h1>
      <p className='text-[13px] text-red'>something broke while rendering.</p>
      <pre className='max-w-full select-text overflow-x-auto border border-line bg-bg-lift p-3 text-[12px] text-fg-soft'>
        {message}
      </pre>
      <Link
        className='cursor-pointer border border-line px-3 py-1 text-[12px] text-orange uppercase tracking-[0.15em] transition-colors hover:border-orange focus-visible:outline focus-visible:outline-orange'
        to='/admin'>
        go to admin
      </Link>
    </div>
  );
};

/**
 * The root renders nothing but its outlet, so /admin owes the PSN data
 * nothing. `Layout` calls useProfile and useGames, both of which fail on a
 * dead NPSSO — and repairing that token is exactly what /admin is for, so it
 * cannot sit under the thing that breaks. Every other route keeps its URL by
 * hanging off a pathless layout route instead.
 */
const rootRoute = createRootRoute({
  component: Outlet,
  errorComponent: RouteError,
});

const shellRoute = createRoute({
  component: Layout,
  getParentRoute: () => rootRoute,
  id: '_shell',
});

/**
 * Paths, not search params: the tabs are navigation and a game is a resource,
 * so /library/NPWR21924_00 is the honest URL. vercel.json rewrites every
 * non-/api path to index.html, which is what makes those deep links load.
 */
const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ replace: true, to: '/library' });
  },
  getParentRoute: () => shellRoute,
  path: '/',
});

const libraryRoute = createRoute({
  component: Library,
  getParentRoute: () => shellRoute,
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

const logRoute = createRoute({
  component: Log,
  getParentRoute: () => shellRoute,
  path: '/log',
});

const statsRoute = createRoute({
  component: () => (
    <Suspense
      fallback={
        <p className='grid flex-1 place-items-center text-[12px] text-dim'>
          loading the charts…
        </p>
      }>
      <Stats />
    </Suspense>
  ),
  getParentRoute: () => shellRoute,
  path: '/stats',
});

const adminRoute = createRoute({
  component: Admin,
  getParentRoute: () => rootRoute,
  path: '/admin',
});

export const router = createRouter({
  defaultErrorComponent: RouteError,
  routeTree: rootRoute.addChildren([
    shellRoute.addChildren([
      indexRoute,
      libraryRoute.addChildren([libraryIndexRoute, libraryGameRoute]),
      logRoute,
      statsRoute,
    ]),
    adminRoute,
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
