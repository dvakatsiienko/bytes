import { Resvg } from '@resvg/resvg-js';
import { expect, test } from 'vitest';

import { palettes } from '../palette.ts';
import { svg } from '../paper.ts';
import { times } from '../time.ts';
import { avatarSize, templateAvatar } from './avatar.ts';
import { badgeSize, templateBadge } from './badge.ts';
import { faviconSize, templateFavicon } from './favicon.ts';
import { iconSize, templateIcon } from './icon.ts';
import { templateScene } from './scene.ts';
import { spotSize, templateSpot } from './spot.ts';

/** a template is a promise that a new ask starts drawing: each must render as it stands */
const templates = [
  { draw: templateScene, kind: 'scene', size: { h: 600, w: 1600 } },
  { draw: templateSpot, kind: 'spot', size: spotSize },
  { draw: templateIcon, kind: 'icon', size: iconSize },
  { draw: templateAvatar, kind: 'avatar', size: avatarSize },
  { draw: templateBadge('stars', '42'), kind: 'badge', size: badgeSize },
  { draw: templateFavicon, kind: 'favicon', size: faviconSize },
] as const;

const cases = templates.flatMap((template) =>
  times.map((time) => ({ ...template, time })),
);

test.each(cases)(
  'the $kind template draws a non-empty picture by $time',
  (template) => {
    const document = svg(
      template.size.w,
      template.size.h,
      template.kind,
      template.draw(palettes[template.time]),
    );

    const { pixels } = new Resvg(document).render();
    const painted = pixels.filter(
      (_value, index) => index % 4 === 3 && pixels[index] !== 0,
    ).length;

    expect(painted).toBeGreaterThan((template.size.w * template.size.h) / 4);
  },
);
