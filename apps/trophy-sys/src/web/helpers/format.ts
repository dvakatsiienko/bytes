import type { TrophyGrade } from '../../shared/types.ts';

export const GRADE_COLOR: Record<TrophyGrade, string> = {
  bronze: 'text-bronze',
  gold: 'text-gold',
  platinum: 'text-platinum',
  silver: 'text-silver',
};

export const GRADE_MARK: Record<TrophyGrade, string> = {
  bronze: '●',
  gold: '●',
  platinum: '◆',
  silver: '●',
};

export const dateFormat = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toISOString().slice(0, 10).replace(/-/g, '.');
};

export const barRender = (percent: number, width = 20) => {
  const filled = Math.round(
    (Math.min(100, Math.max(0, percent)) / 100) * width,
  );
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};
