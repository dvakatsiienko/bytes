/** a piece is drawn for two times of day; the readmes show day on light and night on dark */
export const times = ['day', 'night'] as const;

export const isTime = (value: unknown): value is Time =>
  times.some((time) => time === value);

/* Types */

export type Time = (typeof times)[number];
