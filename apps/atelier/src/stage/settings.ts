/** the light, lens and effects a bake uses; every take saves the full set it was baked with */
export const defaults = {
  ambient: 0.6,
  aperture: 0.35,
  bloom: 0.01,
  bloomThreshold: 0.78,
  depthStep: 0.12,
  exposure: 1,
  fibre: 0.4,
  fireLight: 0.2,
  focus: 2.4,
  grain: 1,
  hasBirds: true,
  hasCameraDrift: false,
  hasCloudDrift: true,
  hasEmbers: true,
  hasFibre: true,
  hasFireflies: true,
  hasHaze: true,
  hasLens: true,
  hasSmoke: true,
  hasThickness: true,
  hasWind: true,
  haze: 0.25,
  look: 'exact' as Look,
  seed: 1,
  shadowSoftness: 14,
  sunAzimuth: 26,
  sunElevation: 31,
  sunTint: '#ffffff' as Hex,
  thickness: 0.6,
  tilt: 0,
  wind: 0.5,
  windowLight: 1,
};

export const looks = ['exact', 'agx', 'aces', 'neutral'] as const;

/** the settings panel, top to bottom; a key missing here has no control */
export const controls = [
  {
    rows: [
      { key: 'look', kind: 'choice', label: 'tone mapping', options: looks },
      {
        key: 'exposure',
        kind: 'number',
        label: 'exposure',
        max: 2,
        min: 0.5,
        step: 0.01,
      },
    ],
    title: 'look',
  },
  {
    rows: [
      {
        key: 'sunAzimuth',
        kind: 'number',
        label: 'sun direction',
        max: 80,
        min: -80,
        step: 1,
      },
      {
        key: 'sunElevation',
        kind: 'number',
        label: 'sun height',
        max: 80,
        min: 5,
        step: 1,
      },
      { key: 'sunTint', kind: 'color', label: 'sun tint' },
      {
        key: 'ambient',
        kind: 'number',
        label: 'fill light',
        max: 0.95,
        min: 0.2,
        step: 0.01,
      },
      {
        key: 'shadowSoftness',
        kind: 'number',
        label: 'shadow softness',
        max: 30,
        min: 1,
        step: 1,
      },
    ],
    title: 'light',
  },
  {
    rows: [
      {
        key: 'depthStep',
        kind: 'number',
        label: 'sheet spacing',
        max: 0.4,
        min: 0,
        step: 0.005,
      },
      {
        key: 'tilt',
        kind: 'number',
        label: 'camera tilt',
        max: 1,
        min: -1,
        step: 0.01,
      },
      { key: 'hasLens', kind: 'toggle', label: 'lens blur' },
      {
        key: 'focus',
        kind: 'number',
        label: 'focus sheet',
        max: 9,
        min: 0,
        step: 0.1,
      },
      {
        key: 'aperture',
        kind: 'number',
        label: 'blur amount',
        max: 3,
        min: 0,
        step: 0.05,
      },
    ],
    title: 'depth and lens',
  },
  {
    rows: [
      { key: 'hasHaze', kind: 'toggle', label: 'haze between sheets' },
      {
        key: 'haze',
        kind: 'number',
        label: 'haze density',
        max: 1,
        min: 0,
        step: 0.01,
      },
      {
        key: 'fireLight',
        kind: 'number',
        label: 'fire light',
        max: 3,
        min: 0,
        step: 0.05,
      },
      {
        key: 'windowLight',
        kind: 'number',
        label: 'window light',
        max: 3,
        min: 0,
        step: 0.05,
      },
    ],
    title: 'atmosphere',
  },
  {
    rows: [
      { key: 'hasThickness', kind: 'toggle', label: 'card thickness' },
      {
        key: 'thickness',
        kind: 'number',
        label: 'edge depth',
        max: 1,
        min: 0,
        step: 0.01,
      },
      { key: 'hasFibre', kind: 'toggle', label: 'paper fibre' },
      {
        key: 'fibre',
        kind: 'number',
        label: 'fibre relief',
        max: 1.5,
        min: 0,
        step: 0.01,
      },
      {
        key: 'grain',
        kind: 'number',
        label: 'grain',
        max: 1,
        min: 0,
        step: 0.01,
      },
    ],
    title: 'paper',
  },
  {
    rows: [
      {
        key: 'bloom',
        kind: 'number',
        label: 'bloom',
        max: 2,
        min: 0,
        step: 0.01,
      },
      {
        key: 'bloomThreshold',
        kind: 'number',
        label: 'bloom threshold',
        max: 1,
        min: 0,
        step: 0.01,
      },
    ],
    title: 'glow',
  },
  {
    rows: [
      { key: 'hasWind', kind: 'toggle', label: 'wind in the ferns and pines' },
      {
        key: 'wind',
        kind: 'number',
        label: 'wind strength',
        max: 1.5,
        min: 0,
        step: 0.01,
      },
      { key: 'hasCloudDrift', kind: 'toggle', label: 'drifting clouds' },
      { key: 'hasSmoke', kind: 'toggle', label: 'chimney smoke' },
      { key: 'hasBirds', kind: 'toggle', label: 'birds (day)' },
      { key: 'hasFireflies', kind: 'toggle', label: 'fireflies (night)' },
      { key: 'hasEmbers', kind: 'toggle', label: 'embers (night)' },
      { key: 'hasCameraDrift', kind: 'toggle', label: 'camera drift' },
    ],
    title: 'motion',
  },
  {
    rows: [
      {
        key: 'seed',
        kind: 'number',
        label: 'scatter seed',
        max: 9999,
        min: 1,
        step: 1,
      },
    ],
    title: 'seed',
  },
] as const satisfies readonly ControlGroup[];

const HEX = /^#[0-9a-f]{6}$/i;

export const isHex = (value: string): value is Hex => HEX.test(value);

/** a saved set, read back from a take or storage: known keys of the right type win, the rest falls back */
/** each number's allowed range, read from its control: a saved set can hold no value the panel could not */
const ranges = new Map<string, { min: number; max: number }>(
  controls.flatMap((group) =>
    group.rows.flatMap((row) =>
      row.kind === 'number'
        ? [[row.key, { max: row.max, min: row.min }] as const]
        : [],
    ),
  ),
);

export const toSettings = (value: unknown): Settings => {
  const input =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const out: Record<string, unknown> = { ...defaults };
  for (const [key, fallback] of Object.entries(defaults)) {
    const candidate = input[key];
    if (key === 'look') {
      if (looks.some((look) => look === candidate)) out[key] = candidate;
    } else if (key === 'sunTint') {
      if (typeof candidate === 'string' && HEX.test(candidate))
        out[key] = candidate.toLowerCase();
    } else if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      const range = ranges.get(key);
      out[key] = range
        ? Math.min(range.max, Math.max(range.min, candidate))
        : candidate;
      // the seed picks a random stream: only whole numbers name one
      if (key === 'seed') out[key] = Math.round(out[key] as number);
    } else if (
      typeof candidate === 'boolean' &&
      typeof fallback === 'boolean'
    ) {
      out[key] = candidate;
    }
  }
  return out as Settings;
};

/* Types */

export type Look = (typeof looks)[number];
export type Settings = typeof defaults;
export type NumberKey = {
  [K in keyof Settings]: Settings[K] extends number ? K : never;
}[keyof Settings];
export type ToggleKey = {
  [K in keyof Settings]: Settings[K] extends boolean ? K : never;
}[keyof Settings];
export type ChoiceKey = {
  [K in keyof Settings]: Settings[K] extends Look ? K : never;
}[keyof Settings];
export type ColorKey = {
  [K in keyof Settings]: Settings[K] extends Hex ? K : never;
}[keyof Settings];
export type Hex = `#${string}`;

export type ControlRow =
  | {
      kind: 'number';
      key: NumberKey;
      label: string;
      min: number;
      max: number;
      step: number;
    }
  | { kind: 'toggle'; key: ToggleKey; label: string }
  | { kind: 'color'; key: ColorKey; label: string }
  | { kind: 'choice'; key: ChoiceKey; label: string; options: readonly Look[] };

interface ControlGroup {
  rows: readonly ControlRow[];
  title: string;
}
