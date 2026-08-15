export const TABS = ['library', 'news'] as const;

export type Tab = (typeof TABS)[number];

export interface AppSearch {
  game?: string;
  tab: Tab;
}

const tabParse = (value: unknown): Tab =>
  TABS.includes(value as Tab) ? (value as Tab) : 'library';

/**
 * Kept free of router imports so `App` can read these types without importing
 * `router.tsx`, which imports `App` — the cycle would break on any change to
 * module entry order.
 */
export const searchValidate = (search: Record<string, unknown>): AppSearch => ({
  ...(typeof search.game === 'string' ? { game: search.game } : {}),
  tab: tabParse(search.tab),
});
