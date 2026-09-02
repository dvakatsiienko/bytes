/**
 * Charts pass colours to libraries as strings, so they cannot use Tailwind
 * classes. These are the raw `--p-*` palette variables and not the `--color-*`
 * theme tokens, because Tailwind drops any theme variable no utility asked for
 * — `--color-blue` is absent from the built stylesheet, `--p-blue` is not.
 */
export const CHART_INK = {
  axis: 'var(--p-dim)',
  grid: 'var(--p-line)',
  ring: 'var(--p-orange)',
  surface: 'var(--p-bg-lift)',
} as const;

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
  { color: 'var(--p-platinum)', key: 'platinum', label: 'platinum earned' },
  { color: 'var(--p-orange)', key: 'open', label: 'no platinum yet' },
] as const;

export const seriesColor = (hasPlatinum: boolean) =>
  hasPlatinum ? EFFORT_SERIES[0].color : EFFORT_SERIES[1].color;
