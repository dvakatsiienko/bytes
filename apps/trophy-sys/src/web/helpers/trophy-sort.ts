import type { Trophy, TrophyGrade } from '../../shared/types.ts';

export type TrophySort = 'easiest' | 'hardest' | 'name' | 'grade' | 'earned';
export type EarnedMode = 'mixed' | 'top' | 'bottom' | 'hide';

export const TROPHY_SORT_ORDER = [
  'easiest',
  'hardest',
  'grade',
  'earned',
  'name',
] as const satisfies readonly TrophySort[];

export const EARNED_MODE_ORDER = [
  'mixed',
  'top',
  'bottom',
  'hide',
] as const satisfies readonly EarnedMode[];

export const TROPHY_SORT_LABEL: Record<TrophySort, string> = {
  earned: 'earned date',
  easiest: 'easiest first',
  grade: 'grade',
  hardest: 'hardest first',
  name: 'name',
};

export const TROPHY_SORT_HINT: Record<TrophySort, string> = {
  earned: 'Most recently popped first. Never-earned trophies sink to the end.',
  easiest: 'Most common trophies first — the quick wins.',
  grade: 'Platinum, then gold, silver, bronze.',
  hardest: 'Rarest trophies first — the grind.',
  name: 'Alphabetical by trophy name.',
};

export const EARNED_MODE_LABEL: Record<EarnedMode, string> = {
  bottom: 'earned last',
  hide: 'hide earned',
  mixed: 'earned mixed in',
  top: 'earned first',
};

export const EARNED_MODE_HINT: Record<EarnedMode, string> = {
  bottom: 'Earned trophies stick to the bottom, each block sorted as chosen.',
  hide: 'Shows only what is still missing.',
  mixed: 'One list, no split between earned and missing.',
  top: 'Earned trophies stick to the top, each block sorted as chosen.',
};

const GRADE_RANK: Record<TrophyGrade, number> = {
  bronze: 3,
  gold: 1,
  platinum: 0,
  silver: 2,
};

const compare: Record<TrophySort, (a: Trophy, b: Trophy) => number> = {
  // Descending, so an unpopped trophy's empty date sinks to the end for free.
  earned: (a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''),
  easiest: (a, b) => b.rarity - a.rarity,
  grade: (a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade],
  hardest: (a, b) => a.rarity - b.rarity,
  name: (a, b) => a.name.localeCompare(b.name),
};

export const trophiesArrange = (
  trophies: Trophy[],
  sort: TrophySort,
  earnedMode: EarnedMode,
) => {
  const sorted = [...trophies].sort(compare[sort]);

  if (earnedMode === 'mixed') return sorted;
  if (earnedMode === 'hide') return sorted.filter((trophy) => !trophy.earned);

  const earned = sorted.filter((trophy) => trophy.earned);
  const missing = sorted.filter((trophy) => !trophy.earned);

  return earnedMode === 'top'
    ? [...earned, ...missing]
    : [...missing, ...earned];
};
