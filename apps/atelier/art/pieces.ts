import { atelierFavicon } from './atelier-favicon.ts';
import { market } from './market.ts';
import type { Palette } from './palette.ts';
import { palettes } from './palette.ts';
import { svg } from './paper.ts';
import { appNames, appSign, signSize } from './signs.ts';
import { tileSize, tourBytes, tourFrame } from './tiles.ts';
import type { Time } from './time.ts';
import { homestead, valley } from './valley.ts';
import { workshop } from './workshop.ts';

/**
 * Every piece atelier can draw, in rail order. Node-safe on purpose: the bake,
 * ship and icon scripts import this list too, so nothing here may touch the
 * DOM. A piece that also has a stage entry (`src/stage/scenes.ts`) is lit in
 * three.js; every other piece is its flat svg.
 */
export const pieces = [
  {
    draw: homestead,
    group: 'profile',
    id: 'homestead',
    kind: 'scene',
    ship: { path: 'assets/atelier/hero', repo: 'profile' },
    size: { h: 600, w: 1600 },
    title:
      'Pinefold: Oles the t-rex at home by his cabin, the kettle over the fire, Lanternhill on the far hill',
  },
  {
    draw: valley,
    group: 'profile',
    id: 'walk',
    kind: 'scene',
    size: { h: 600, w: 1600 },
    title: 'Oles walks the creek path between his cabin and Lanternhill',
  },
  {
    draw: workshop,
    group: 'frame',
    id: 'workshop',
    kind: 'scene',
    ship: { path: 'assets/atelier/hero', repo: 'frame' },
    size: { h: 600, w: 1600 },
    title:
      'the workshop: the cabin cut open, one room per section — fleet, machine, chords, mirror, link it',
  },
  {
    draw: market,
    group: 'bytes',
    id: 'market',
    kind: 'scene',
    ship: { path: 'assets/atelier/hero', repo: 'bytes' },
    size: { h: 600, w: 1600 },
    title:
      'Lanternhill market at midday: five firefly shops, and Oles with a basket on his tail reading the list the wren holds',
  },
  {
    draw: tourFrame,
    group: 'spots',
    id: 'tour-frame',
    kind: 'spot',
    ship: { path: 'assets/atelier/tour-frame', repo: 'profile' },
    size: tileSize,
    title:
      'frame: the brass lamp on the workbench, Dym curling out of the spout',
  },
  {
    draw: tourBytes,
    group: 'spots',
    id: 'tour-bytes',
    kind: 'spot',
    ship: { path: 'assets/atelier/tour-bytes', repo: 'profile' },
    size: tileSize,
    title: 'bytes: a shop sign and a firefly lantern on a Lanternhill wall',
  },
  {
    draw: atelierFavicon,
    group: 'icons',
    id: 'atelier-favicon',
    kind: 'favicon',
    size: { h: 512, w: 512 },
    title: 'atelier: a hanging lamp lighting a paper card on the bench',
  },
  ...appNames.map((app) => {
    return {
      draw: appSign(app),
      group: 'icons',
      id: `sign-${app}`,
      kind: 'avatar',
      ship: { path: `assets/atelier/sign-${app}`, repo: 'bytes' },
      size: signSize,
      title: `${app}: its shop sign in Lanternhill`,
    } as const;
  }),
] as const satisfies readonly Piece[];

export const groups = ['profile', 'frame', 'bytes', 'spots', 'icons'] as const;

export const findPiece = (id: string): Piece | undefined =>
  pieces.find((piece) => piece.id === id);

/** the whole svg document of a piece: what a flat piece ships, and what the studio previews */
export const pieceSvg = (piece: Piece, time: Time, seed: number) =>
  svg(
    piece.size.w,
    piece.size.h,
    time === 'night' ? `${piece.title}, at night` : piece.title,
    piece.draw(palettes[time], seed),
  );

/* Types */

export type Group = (typeof groups)[number];

/** the asset kinds a template exists for (`art/templates/`) */
export type AssetKind =
  | 'scene'
  | 'spot'
  | 'icon'
  | 'avatar'
  | 'badge'
  | 'favicon';

/** the repos `atelier:ship` writes into */
export type Repo = 'profile' | 'frame' | 'bytes';

export interface Piece {
  /** the svg body for one time of day; `seed` is for pieces that scatter things */
  draw: (p: Palette, seed: number) => string;
  group: Group;
  id: string;
  kind: AssetKind;
  /** where `atelier:ship` copies the current takes: `<repo>/<path>-light|dark.<ext>`, always under
   *  `assets/atelier/` so no v1 file is ever overwritten */
  ship?: { repo: Repo; path: string };
  size: { w: number; h: number };
  /** the image's alt text, and the svg `<title>` */
  title: string;
}
