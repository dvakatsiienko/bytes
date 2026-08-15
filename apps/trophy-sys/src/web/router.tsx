import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { App } from './App.tsx';
import { searchValidate } from './search.ts';

const rootRoute = createRootRoute();

/**
 * One screen, so the view state lives in search params rather than path
 * segments — `?tab=library&game=NPWR38256_00` survives a reload and is
 * shareable, which a useState pair never was.
 */
const indexRoute = createRoute({
  component: App,
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: searchValidate,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
