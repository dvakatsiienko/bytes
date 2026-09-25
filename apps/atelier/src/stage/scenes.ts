import type * as THREE from 'three';

import { marketLayers } from '../../art/market.ts';
import type { Palette } from '../../art/palette.ts';
import type { Layer } from '../../art/paper.ts';
import { homesteadLayers } from '../../art/valley.ts';
import { workshop } from '../../art/workshop.ts';
import {
  birds,
  embers,
  fireGlow,
  fireflies,
  smoke,
  windowLight,
} from './motion.ts';
import type { Settings } from './settings.ts';

const homestead: SceneSpec = {
  extras: (p) => {
    const flies = fireflies(40, 0.012);
    const fire = fireGlow(790, 486, 0);
    const chimney = smoke(594, 272, 0, p.isNight);
    const lamp = windowLight(583, 410, 0);
    const sparks = embers(790, 486, 0);
    const flock = birds(0);
    const townLight = windowLight(1140, 250, 0);
    return {
      apply: (settings) => {
        const yard = -2.4 * settings.depthStep;
        fire.object.position.z = yard;
        chimney.object.position.z = yard + 0.004;
        lamp.object.position.z = yard;
        sparks.object.position.z = yard + 0.006;
        flock.object.position.z = -8.4 * settings.depthStep;
        townLight.object.position.z = -6 * settings.depthStep;
        flies.object.visible = p.isNight && settings.hasFireflies;
        chimney.object.visible = settings.hasSmoke;
        fire.object.visible = p.isNight;
        sparks.object.visible = p.isNight && settings.hasEmbers;
        flock.object.visible = !p.isNight && settings.hasBirds;
        lamp.update(p.isNight ? settings.windowLight : 0);
        townLight.update(p.isNight ? settings.windowLight * 1.4 : 0);
      },
      objects: [
        flies.object,
        fire.object,
        chimney.object,
        lamp.object,
        sparks.object,
        flock.object,
        townLight.object,
      ],
      tick: (t, settings) => {
        flies.update(t);
        fire.update(t, settings.fireLight);
        chimney.update(t);
        sparks.update(t);
        flock.update(t);
      },
    };
  },
  layers: (p) =>
    homesteadLayers(p, {
      hasFireflies: false,
      hasGlow: false,
      hasSmoke: false,
    }),
  wind: {
    edge: { mode: 'rooted', strength: 0.35 },
    foreground: { mode: 'rooted', strength: 1 },
  },
};

const market: SceneSpec = {
  extras: (p) => {
    const flies = fireflies(30, 0.012);
    const street = windowLight(1296, 300, 0);
    const shopLights = [140, 384, 628, 872, 1116].map((x) =>
      windowLight(x, 330, 0),
    );
    const flock = birds(0);
    return {
      apply: (settings) => {
        street.object.position.z = -1.4 * settings.depthStep;
        for (const light of shopLights)
          light.object.position.z = -2.6 * settings.depthStep;
        flock.object.position.z = -8.4 * settings.depthStep;
        flies.object.visible = p.isNight && settings.hasFireflies;
        flock.object.visible = !p.isNight && settings.hasBirds;
        street.update(p.isNight ? settings.windowLight * 1.2 : 0);
        for (const light of shopLights)
          light.update(p.isNight ? settings.windowLight * 0.6 : 0);
      },
      objects: [
        flies.object,
        street.object,
        flock.object,
        ...shopLights.map((l) => l.object),
      ],
      tick: (t) => {
        flies.update(t);
        flock.update(t);
      },
    };
  },
  layers: (p) => marketLayers(p, { hasFireflies: false }),
  wind: { bunting: { mode: 'hanging', strength: 1 } },
};

// no sheets cut yet: the whole drawing is one sheet, lit and grained like the others
const workshopScene: SceneSpec = {
  extras: () => ({
    apply: () => undefined,
    objects: [],
    tick: () => undefined,
  }),
  layers: (p) => [{ body: workshop(p), depth: 0, name: 'scene' }],
  wind: {},
};

/** the pieces lit in three.js, by piece id; every other piece stays a flat svg */
export const stageScenes: Partial<Record<string, SceneSpec>> = {
  homestead,
  market,
  workshop: workshopScene,
};

/* Types */

/** what moves in a scene and what lights it, beyond its paper sheets; objects are built at z 0 and placed by `apply` */
export interface Extras {
  apply: (settings: Settings) => void;
  objects: THREE.Object3D[];
  tick: (t: number, settings: Settings) => void;
}

export interface SceneSpec {
  extras: (p: Palette) => Extras;
  layers: (p: Palette, seed: number) => readonly Layer[];
  /** sheet name → how the wind moves it: `rooted` bends more toward the top, `hanging` bobs evenly */
  wind: Record<string, { mode: 'rooted' | 'hanging'; strength: number }>;
}
