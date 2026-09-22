/**
 * tint:apply — one cursor window tint per workspace, written the way peacock writes it.
 * `tint.json` holds the bytes colour and an optional colour per app dir; an app opened as its
 * own window and not listed there takes the bytes colour one step darker, so every window of
 * the repo reads violet and the root one reads strongest.
 * usage: pnpm tint:apply            → write or refresh every `.vscode/settings.json`
 *        pnpm tint:apply --check    → exit 1 on drift, write nothing
 *
 * 📌 the block is peacock 4.4.1's own output for these settings, running inside Cursor:
 * the same keys, the same tinycolor math, the same order. that is what lets the extension
 * recognise the colour and reproduce the file byte-for-byte when it re-applies. only the
 * title bar is tinted; the sash hover border is peacock's default accent and comes with it.
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

// peacock's constants: its element step, the inactive alpha, the dark foreground, and the gray
// it forces onto a LIGHT title bar in Cursor, which paints editor toolbar icons with that token
const STEP = 10;
const INACTIVE_ALPHA = 0x99 / 0xff;
const DARK_FOREGROUND = '#15202b';
const LIGHT_FOREGROUND = '#e7e7e7';
const CURSOR_TITLE_FOREGROUND = '#595959';

// every colour key peacock manages (its `ColorSettings`): its merge drops the ones a new
// apply does not set, which is how switching an element off clears that element's keys
const peacockKeys = [
  'activityBar.activeBackground',
  'activityBar.activeBorder',
  'activityBar.background',
  'activityBar.foreground',
  'activityBar.inactiveForeground',
  'activityBarBadge.background',
  'activityBarBadge.foreground',
  'activityBarTop.background',
  'activityBarTop.activeBackground',
  'activityBarTop.activeBorder',
  'activityBarTop.foreground',
  'activityBarTop.inactiveForeground',
  'commandCenter.border',
  'commandCenter.foreground',
  'editorGroup.border',
  'panel.border',
  'sideBar.border',
  'sash.hoverBorder',
  'editorError.foreground',
  'editorWarning.foreground',
  'editorInfo.foreground',
  'statusBar.border',
  'statusBar.background',
  'statusBar.foreground',
  'statusBar.debuggingBorder',
  'statusBar.debuggingBackground',
  'statusBar.debuggingForeground',
  'statusBarItem.hoverBackground',
  'statusBarItem.remoteBackground',
  'statusBarItem.remoteForeground',
  'tab.activeBorder',
  'tab.activeBackground',
  'titleBar.activeBackground',
  'titleBar.activeForeground',
  'titleBar.border',
  'titleBar.inactiveBackground',
  'titleBar.inactiveForeground',
  'window.activeBorder',
  'window.inactiveBorder',
];

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

// merged, never overwritten: a key the file holds outside the `peacock.*` settings and
// peacock's own colour keys stays where it is. those two are this script's, and are rewritten
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
  const customizations = Object.fromEntries(
    Object.entries(
      (settings['workbench.colorCustomizations'] ?? {}) as Record<
        string,
        string
      >,
    ).filter(([key]) => !peacockKeys.includes(key)),
  );
  const next = {
    ...Object.fromEntries(
      Object.entries(settings).filter(
        ([key]) =>
          !key.startsWith('peacock.') &&
          key !== 'workbench.colorCustomizations',
      ),
    ),
    'peacock.affectActivityBar': false,
    'peacock.affectStatusBar': false,
    'peacock.affectTitleBar': true,
    'peacock.color': color,
    // peacock's own merge: existing keys keep their place, its keys land after them
    'workbench.colorCustomizations': {
      ...customizations,
      ...peacockBlock(color),
    },
  };
  return `${JSON.stringify(next, null, 2)}\n`;
}

function peacockBlock(color: string) {
  const title = hex(tinycolor(color));
  const foreground = foregroundOf(title);
  const inactiveForeground = hex(
    tinycolor(foreground).setAlpha(INACTIVE_ALPHA),
  );
  const titleForeground = tinycolor(title).isLight()
    ? CURSOR_TITLE_FOREGROUND
    : foreground;

  return {
    'commandCenter.border': inactiveForeground,
    'commandCenter.foreground': titleForeground,
    // the activity bar's colour even with the bar off: peacock's default adjustment lightens it
    'sash.hoverBorder': hex(tinycolor(color).lighten(STEP)),
    'titleBar.activeBackground': title,
    'titleBar.activeForeground': titleForeground,
    'titleBar.inactiveBackground': hex(
      tinycolor(title).setAlpha(INACTIVE_ALPHA),
    ),
    'titleBar.inactiveForeground': inactiveForeground,
  };
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

/* Types */
interface Tint {
  apps: Record<string, string>;
  color: string;
}
