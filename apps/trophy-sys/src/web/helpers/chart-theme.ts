import type { TrophyGrade } from '../../shared/types.ts';

/**
 * Every colour a chart draws with lives in this file. visx takes colours as
 * prop strings, so charts cannot use Tailwind classes, and these are the raw
 * `--p-*` palette variables rather than the `--color-*` theme tokens — Tailwind
 * drops any theme variable no utility asked for, so `--color-blue` is absent
 * from the built stylesheet while `--p-blue` is not.
 */
export const CHART_INK = {
  axis: 'var(--p-dim)',
  grid: 'var(--p-line)',
  /**
   * The outline on a picked mark. Blue against the orange ramp so it reads as
   * a different kind of thing rather than a hotter value, and the outline's
   * presence carries the state on its own — colour is never the only cue.
   */
  pick: 'var(--p-blue)',
  /** The one accent hue every magnitude ramp and single-series chart uses. */
  ring: 'var(--p-orange)',
  surface: 'var(--p-bg-lift)',
  /** Label ink, lifted to full strength while its row is the active one. */
  text: 'var(--p-fg)',
} as const;

/**
 * Bars, named for the job the colour does rather than for the hue. A chart that
 * wants "the green one" is a chart that will drift when the palette moves.
 */
export const BAR_TONE = {
  /** Finished: a 100% bucket, or a streak still alive today. */
  done: 'var(--p-green)',
  /** Work still owed. */
  open: 'var(--p-yellow)',
  /** A run that has ended. */
  past: 'var(--p-orange)',
  /** Neither finished nor owed — a plain count. */
  plain: 'var(--p-blue)',
  /** A platinum, matching the ◆ the rest of the app already uses. */
  platinum: 'var(--p-platinum)',
} as const;

/**
 * The five rarity tiers, rarest first. Ordinal data, so the order carries the
 * meaning and the labels carry the rest — the tier names are printed on every
 * bar and repeated in the table.
 *
 * 📌 A single-hue ordinal ramp was tried here and dima rejected it on sight
 * (2026-09-04): it validated cleanly on contrast but read worse than the hues.
 * Five bands is few enough that identity beats magnitude.
 */
export const TIER_TONE = [
  'var(--p-purple)',
  'var(--p-red)',
  'var(--p-orange)',
  'var(--p-yellow)',
  'var(--p-green)',
] as const;

export const GRADE_TONE: Record<TrophyGrade, string> = {
  bronze: 'var(--p-bronze)',
  gold: 'var(--p-gold)',
  platinum: 'var(--p-platinum)',
  silver: 'var(--p-silver)',
};

/**
 * Two categories, and colour is never the only cue: the mark shape carries the
 * same split, matching the ◆ the rest of the app already uses for platinum.
 *
 * The pair is gruvbox's own teal and orange. Measured with the dataviz
 * validator: CVD separation ΔE 11.2 (protan) and normal-vision ΔE 17.5, both
 * comfortably over their floors. It fails that validator's chroma and lightness
 * bands, which every gruvbox-material pair does — the palette is desaturated on
 * purpose, and the brief pins it.
 */
export const EFFORT_SERIES = [
  { color: BAR_TONE.platinum, key: 'platinum', label: 'platinum earned' },
  { color: CHART_INK.ring, key: 'open', label: 'no platinum yet' },
] as const;

export const seriesColor = (hasPlatinum: boolean) =>
  hasPlatinum ? EFFORT_SERIES[0].color : EFFORT_SERIES[1].color;

/**
 * One square, one pitch, for every cell grid on the route.
 *
 * 📌 The activity heatmap and the night-owl grid sit one panel apart and read
 * as the same object, so a reader compares them — and they were 11px against a
 * derived 12.66px, which looks like a mistake because it is one. The pitch is
 * the cell plus a one-pixel gutter each side.
 *
 * ⚠️ Whole pixels, always. A grid that sizes itself from its container lands on
 * fractions like 12.66, and a fractional square draws its edges across two
 * device pixels — the reason the two grids looked differently *sharp* as well
 * as differently sized. Anything deriving a step from available space rounds
 * down to an integer and caps here.
 */
export const GRID_CELL = 11;
export const GRID_STEP = GRID_CELL + 2;

/** Shared by every axis on the route, so the tick ink never drifts apart. */
export const AXIS_LABEL = {
  fill: CHART_INK.axis,
  /** Matches the chart labels: an axis tick is dense data, not fine print. */
  fontSize: 11,
  textAnchor: 'middle' as const,
} as const;
