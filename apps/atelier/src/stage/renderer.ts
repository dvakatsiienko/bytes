import * as THREE from 'three';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import type { Stage } from './build.ts';
import { cameraDistance } from './build.ts';
import type { Look, Settings } from './settings.ts';

const toneMappings: Record<Look, THREE.ToneMapping> = {
  aces: THREE.ACESFilmicToneMapping,
  agx: THREE.AgXToneMapping,
  exact: THREE.NoToneMapping,
  neutral: THREE.NeutralToneMapping,
};

/** the camera frames the 16 × 6 sheet exactly at `cameraDistance` */
export const fov = (2 * Math.atan(3 / cameraDistance) * 180) / Math.PI;

/**
 * Three's own passes, as the frame stage had them: «exact» means no tone
 * mapping, so a lit spot shows its map's colour. r3f owns the canvas and the
 * loop; this owns what one frame is.
 */
export const createRenderer = (
  gl: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
) => {
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.VSMShadowMap;

  const composer = new EffectComposer(gl);
  const renderPass = new RenderPass(new THREE.Scene(), camera);
  const bokeh = new BokehPass(new THREE.Scene(), camera, {
    aperture: 0,
    focus: cameraDistance,
    maxblur: 0.004,
  });
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.6, 0.78);
  composer.addPass(renderPass);
  composer.addPass(bokeh);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let stage: Stage | null = null;
  let isNight = false;

  const place = (settings: Settings, t: number) => {
    const drift = settings.hasCameraDrift ? Math.sin(Math.PI * 2 * t) * 0.9 : 0;
    camera.position.set(
      settings.tilt * 3 + drift,
      settings.tilt * -0.4,
      cameraDistance,
    );
    camera.lookAt(0, 0, 0);
  };

  return {
    apply: (settings: Settings) => {
      stage?.apply(settings);
      const uniforms = bokeh.uniforms as Record<string, { value: number }>;
      if (uniforms.focus)
        uniforms.focus.value =
          cameraDistance + settings.focus * settings.depthStep;
      if (uniforms.aperture)
        uniforms.aperture.value = settings.hasLens
          ? settings.aperture / 1000
          : 0;
      bloom.strength = isNight ? settings.bloom : settings.bloom * 0.15;
      bloom.threshold = settings.bloomThreshold;
      gl.toneMapping = toneMappings[settings.look];
      gl.toneMappingExposure = settings.exposure;
    },
    dispose: () => composer.dispose(),
    /** one frame at loop time t ∈ [0, 1) */
    render: (settings: Settings, t: number) => {
      if (!stage) return false;
      place(settings, t);
      stage.tick(t, settings);
      composer.render();
      return true;
    },
    setSize: (width: number, height: number, dpr: number) => {
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
    },
    setStage: (next: Stage, night: boolean) => {
      stage = next;
      isNight = night;
      renderPass.scene = next.scene;
      bokeh.scene = next.scene;
    },
  };
};

export type StageRenderer = ReturnType<typeof createRenderer>;
