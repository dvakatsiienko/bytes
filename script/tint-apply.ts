/**
 * tint:apply — one cursor window tint per workspace, written the way peacock writes it.
 * `tint.json` holds the bytes colour and an optional colour per app dir; an app opened as its
 * own window and not listed there takes the bytes colour one step darker, so every window of
 * the repo reads violet and the root one reads strongest.
 * usage: pnpm tint:apply            → write or refresh every `.vscode/settings.json`
 *        pnpm tint:apply --check    → exit 1 on drift, write nothing
 *
 * 📌 the block is peacock 4.4.1's own output for these settings, running inside Cursor:
 * the same keys, the same tinycolor math, the same sorted order. that is what lets the
 * extension recognise the colour and reproduce the file byte-for-byte when it re-applies.
 * the title bar carries the colour; `elementAdjustments` darkens the activity and status bars
 * one step, a peacock setting rather than our own shading, so its re-apply keeps them.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import tinycolor from 'tinycolor2';

// peacock's constants: the element step, the inactive alpha, the two foregrounds, and the gray
// it forces onto a LIGHT title bar in Cursor, which paints editor toolbar icons with that token
const STEP = 10;
const INACTIVE_ALPHA = 0x99 / 0xff;
const DARK_FOREGROUND = '#15202b';
const LIGHT_FOREGROUND = '#e7e7e7';
const CURSOR_TITLE_FOREGROUND = '#595959';
const elementAdjustments = {
  activityBar: 'darken',
  statusBar: 'darken',
  titleBar: 'none',
} as const;

const isCheck = process.argv.includes('--check');
const tint = JSON.parse(readFileSync('tint.json', 'utf8')) as Tint;

const windowList = [
  { color: tint.color, dir: '.' },
  ...readdirSync('apps', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      color: tint.apps[entry.name] ?? darken(tint.color),
      dir: join('apps', entry.name),
    })),
];

const driftList: string[] = [];
for (const target of windowList) {
  const dir = join(target.dir, '.vscode');
  const path = join(dir, 'settings.json');
  const current = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
  const next = settingsWith(current, target.color, path);
  if (next === current) continue;

  driftList.push(`${path} ${target.color}`);
  if (isCheck) continue;
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, next);
}

if (isCheck && driftList.length > 0) {
  console.error(
    `tint drift — run \`pnpm tint:apply\`:\n  ${driftList.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  driftList.length > 0
    ? `tinted:\n  ${driftList.join('\n  ')}`
    : `${windowList.length} windows already tinted`,
);

/* Helpers */

// merged, never overwritten: every key the file already holds stays where it is, and inside
// the colour block only peacock's own keys are replaced
function settingsWith(
  current: string | undefined,
  color: string,
  path: string,
) {
  let settings: Record<string, unknown>;
  try {
    settings = current ? JSON.parse(current) : {};
  } catch (error) {
    throw new Error(
      `${path} is not plain json (a comment?) — merge it by hand, nothing was written`,
      { cause: error },
    );
  }
  const block = peacockBlock(color);
  const customizations = settings['workbench.colorCustomizations'] ?? {};
  const next = {
    ...settings,
    'peacock.affectActivityBar': true,
    'peacock.affectStatusBar': true,
    'peacock.affectTitleBar': true,
    'peacock.color': color,
    'peacock.elementAdjustments': elementAdjustments,
    // peacock's own merge: existing keys keep their place, its keys land after them
    'workbench.colorCustomizations': {
      ...(customizations as Record<string, string>),
      ...block,
    },
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function peacockBlock(color: string) {
  const title = elementStyle(color, elementAdjustments.titleBar);
  const activity = elementStyle(color, elementAdjustments.activityBar);
  const status = elementStyle(color, elementAdjustments.statusBar);
  const titleForeground = tinycolor(title.background).isLight()
    ? CURSOR_TITLE_FOREGROUND
    : title.foreground;

  return sortKeys({
    'activityBar.activeBackground': activity.background,
    'activityBar.activeBorder': activity.foreground,
    'activityBar.background': activity.background,
    'activityBar.foreground': activity.foreground,
    'activityBar.inactiveForeground': activity.inactiveForeground,
    'activityBarBadge.background': activity.badgeBackground,
    'activityBarBadge.foreground': activity.badgeForeground,
    'activityBarTop.activeBackground': activity.background,
    'activityBarTop.activeBorder': activity.foreground,
    'activityBarTop.background': activity.background,
    'activityBarTop.foreground': activity.foreground,
    'activityBarTop.inactiveForeground': activity.inactiveForeground,
    'commandCenter.border': title.inactiveForeground,
    'commandCenter.foreground': titleForeground,
    'sash.hoverBorder': activity.background,
    'statusBar.background': status.background,
    'statusBar.debuggingBackground': status.background,
    'statusBar.debuggingForeground': status.foreground,
    'statusBar.foreground': status.foreground,
    'statusBarItem.hoverBackground': status.hoverBackground,
    'statusBarItem.remoteBackground': status.badgeBackground,
    'statusBarItem.remoteForeground': status.foreground,
    'titleBar.activeBackground': title.background,
    'titleBar.activeForeground': titleForeground,
    'titleBar.inactiveBackground': title.inactiveBackground,
    'titleBar.inactiveForeground': title.inactiveForeground,
  });
}

function elementStyle(color: string, adjustment: 'darken' | 'none') {
  const background =
    adjustment === 'darken' ? darken(color) : hex(tinycolor(color));
  const foreground = foregroundOf(background);
  const badgeBackground = readableAccent(background);

  return {
    background,
    badgeBackground,
    badgeForeground: foregroundOf(badgeBackground),
    foreground,
    hoverBackground: hex(
      tinycolor(background).isLight()
        ? tinycolor(background).darken()
        : tinycolor(background).lighten(),
    ),
    inactiveBackground: hex(tinycolor(background).setAlpha(INACTIVE_ALPHA)),
    inactiveForeground: hex(tinycolor(foreground).setAlpha(INACTIVE_ALPHA)),
  };
}

// the first of 16 shades of the triad accent that clears 2:1 against the background, least
// contrast first — peacock's badge colour, ported line for line
function readableAccent(background: string) {
  const [, accent] = tinycolor(background).triad();
  let { h, s, l } = accent?.toHsl() ?? { h: 0, l: 0, s: 0 };
  if (s === 0) h = 60 * Math.round(l * 6);
  if (s < 0.15) s = 0.5;

  const shade = Array.from({ length: 16 }, (_, index) => {
    const color = tinycolor({ h, l: index / 16, s });
    return {
      contrast: tinycolor.readability(color, background),
      hex: hex(color),
    };
  })
    .sort((a, z) => a.contrast - z.contrast)
    .find((one) => one.contrast >= 2);

  return shade?.hex ?? '#ffffff';
}

function darken(color: string) {
  return hex(tinycolor(color).darken(STEP));
}

function foregroundOf(background: string) {
  return tinycolor(background).isLight() ? DARK_FOREGROUND : LIGHT_FOREGROUND;
}

function hex(color: tinycolor.Instance) {
  return color.getAlpha() < 1 ? color.toHex8String() : color.toHexString();
}

function sortKeys<T>(record: Record<string, T>) {
  return Object.fromEntries(
    // code-unit order, the comparison peacock's `Object.keys().sort()` makes
    Object.entries(record).sort(([a], [z]) => (a < z ? -1 : 1)),
  );
}

/* Types */
interface Tint {
  apps: Record<string, string>;
  color: string;
}
