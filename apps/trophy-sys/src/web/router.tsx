import {
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from '@tanstack/react-router';

import { App } from './App.tsx';

const TABS = ['library', 'news'] as const;

export type Tab = (typeof TABS)[number];

export interface AppSearch {
  game?: string;
  tab: Tab;
}

const tabParse = (value: unknown): Tab =>
  TABS.includes(value as Tab) ? (value as Tab) : 'library';

const rootRoute = createRootRoute();

/**
 * One screen, so the view state lives in search params rather than path
 * segments — `?tab=library&game=NPWR38256_00` survives a reload and is
 * shareable, which a useState pair never was.
 */
export const indexRoute = createRoute({
  component: App,
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): AppSearch => ({
    ...(typeof search.game === 'string' ? { game: search.game } : {}),
    tab: tabParse(search.tab),
  }),
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
});

export const useAppSearch = () => indexRoute.useSearch();

export const useAppNavigate = () => {
  const navigate = useNavigate({ from: indexRoute.fullPath });

  return {
    gameSelect: (game: string) =>
      navigate({ replace: true, search: (prev) => ({ ...prev, game }) }),
    tabSelect: (tab: Tab) =>
      navigate({ replace: true, search: (prev) => ({ ...prev, tab }) }),
  };
};

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
