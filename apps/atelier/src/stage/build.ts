import * as THREE from 'three';

import type { Palette } from '../../art/palette.ts';
import type { SceneSpec } from './scenes.ts';
import type { Settings } from './settings.ts';
import { fibreNormals, loadSheet, paperTexture } from './sheets.ts';

export const cameraDistance = 20;

const unlit = new Set(['sky']);
const noShadowOnto = new Set(['sky', 'mountains', 'foreground']);

/** bend a sheet in the vertex shader; t loops over [0, 1) */
const addWind = (
  material: THREE.Material,
  uniforms: WindUniforms,
  mode: 'rooted' | 'hanging',
) => {
  const move =
    mode === 'rooted'
      ? `float lift = max(position.y + 3.0, 0.0);
               transformed.x += (sin(6.2831853 * uTime + position.x * 0.9) * 0.6 + sin(12.5663706 * uTime + position.x * 2.3) * 0.4) * uWind * lift * lift * 0.012;`
      : `transformed.y += sin(6.2831853 * uTime * 2.0 + position.x * 1.7) * uWind * 0.025;
               transformed.x += sin(6.2831853 * uTime + position.x * 0.6) * uWind * 0.012;`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `uniform float uTime;\nuniform float uWind;\n${shader.vertexShader}`.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n${move}`,
      );
  };
};

/** one scene for one time of day: paper sheets, their cut edges, the lights and the moving bits */
export const buildScene = async (
  spec: SceneSpec,
  p: Palette,
  seed: number,
  onProgress: (done: number, total: number) => void,
) => {
  const scene = new THREE.Scene();
  const sun = new THREE.DirectionalLight(
    p.isNight ? 0xc9_d3_ff : 0xff_ff_ff,
    1,
  );
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, {
    bottom: -5,
    far: 60,
    left: -10,
    near: 1,
    right: 10,
    top: 5,
  });
  sun.shadow.blurSamples = 24;
  sun.shadow.bias = -0.0004;
  const ambient = new THREE.AmbientLight(0xff_ff_ff, 1);
  scene.add(sun, ambient);

  const normals = fibreNormals();
  const sheets: Sheet[] = [];
  const layers = spec.layers(p, seed);
  let loaded = 0;
  onProgress(0, layers.length);
  const maps = await Promise.all(
    layers.map(async (layer) => {
      const map = await loadSheet(p, layer);
      loaded += 1;
      onProgress(loaded, layers.length);
      return map;
    }),
  );
  for (const [index, layer] of layers.entries()) {
    const map = maps[index];
    if (!map) continue;
    const material = new THREE.MeshLambertMaterial({
      alphaTest: 0.04,
      map,
      normalMap: unlit.has(layer.name) ? null : normals,
      transparent: true,
    });
    const wind = spec.wind[layer.name];
    const mesh = new THREE.Mesh(
      wind
        ? new THREE.PlaneGeometry(16, 6, 96, 36)
        : new THREE.PlaneGeometry(16, 6),
      material,
    );
    mesh.castShadow = !unlit.has(layer.name);
    mesh.receiveShadow = !noShadowOnto.has(layer.name);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
      alphaTest: 0.5,
      depthPacking: THREE.RGBADepthPacking,
      map,
    });
    // the cut edge: the same silhouette in a dark card tone, one step behind and down-right
    const edge = new THREE.Mesh(
      mesh.geometry,
      new THREE.MeshBasicMaterial({
        alphaTest: 0.5,
        color: p.isNight ? 0x0b_0d_1c : 0x4a_3a_30,
        fog: false,
        map,
        transparent: true,
      }),
    );
    const uniforms: WindUniforms = { uTime: { value: 0 }, uWind: { value: 0 } };
    if (wind) {
      addWind(material, uniforms, wind.mode);
      addWind(edge.material, uniforms, wind.mode);
    }
    scene.add(edge, mesh);
    sheets.push({
      bend: wind?.strength ?? 0,
      depth: layer.depth,
      edge,
      material,
      mesh,
      name: layer.name,
      uniforms,
    });
  }

  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 6),
    new THREE.MeshBasicMaterial({
      depthWrite: false,
      fog: false,
      map: paperTexture(p.isNight),
      transparent: true,
    }),
  );
  paper.position.z = 0.03;
  scene.add(paper);

  const extras = spec.extras(p);
  // three logs an error for add() with nothing to add
  if (extras.objects.length > 0) scene.add(...extras.objects);
  const sky = new THREE.Color(p.sky[2]);

  /** push the settings into this scene */
  const apply = (settings: Settings) => {
    const overscan =
      1 + Math.abs(settings.tilt) * 0.12 + (settings.hasCameraDrift ? 0.08 : 0);
    for (const { mesh, edge, depth, material } of sheets) {
      const z = -depth * settings.depthStep;
      const scale = ((cameraDistance - z) / cameraDistance) * overscan;
      mesh.position.set(0, 0, z);
      mesh.scale.setScalar(scale);
      const cut = settings.hasThickness
        ? 0.006 + settings.thickness * 0.022
        : 0;
      edge.position.set(cut, -cut, z - 0.002);
      edge.scale.setScalar(scale);
      edge.visible = settings.hasThickness && mesh.castShadow && depth < 7;
      material.normalScale.setScalar(settings.hasFibre ? settings.fibre : 0);
    }
    const az = (settings.sunAzimuth * Math.PI) / 180;
    const el = (settings.sunElevation * Math.PI) / 180;
    const dir = new THREE.Vector3(
      Math.sin(az) * Math.cos(el),
      Math.sin(el),
      Math.cos(az) * Math.cos(el),
    );
    sun.position.copy(dir).multiplyScalar(20);
    // a lit spot shows its map exactly: (ambient + sun · cosθ) / π = 1; a shadow keeps the ambient share
    const share = p.isNight ? settings.ambient - 0.1 : settings.ambient;
    ambient.intensity = Math.PI * share;
    sun.intensity = (Math.PI * (1 - share)) / Math.max(0.2, dir.z);
    sun.shadow.radius = settings.shadowSoftness;
    sun.color
      .set(p.isNight ? 0xc9_d3_ff : 0xff_ff_ff)
      .multiply(new THREE.Color(settings.sunTint));
    scene.fog = settings.hasHaze
      ? new THREE.Fog(
          sky,
          cameraDistance - 0.1,
          cameraDistance + 1.2 + (1 - settings.haze) * 8,
        )
      : null;
    paper.material.opacity = settings.grain;
    extras.apply(settings);
  };

  const tick = (t: number, settings: Settings) => {
    for (const sheet of sheets) {
      sheet.uniforms.uTime.value = t;
      sheet.uniforms.uWind.value = settings.hasWind
        ? settings.wind * sheet.bend
        : 0;
      if (sheet.name === 'clouds') {
        const drift = settings.hasCloudDrift
          ? Math.sin(Math.PI * 2 * t) * 0.35
          : 0;
        sheet.mesh.position.x = drift;
        sheet.edge.position.x = drift;
      }
    }
    extras.tick(t, settings);
  };

  const dispose = () =>
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Sprite ||
        object instanceof THREE.Points
      ) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const m of materials) {
          for (const value of Object.values(m))
            if (value instanceof THREE.Texture) value.dispose();
          m.dispose();
        }
      }
    });

  return { apply, dispose, scene, tick };
};

export type Stage = Awaited<ReturnType<typeof buildScene>>;

interface WindUniforms {
  uTime: { value: number };
  uWind: { value: number };
}

interface Sheet {
  bend: number;
  depth: number;
  edge: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  mesh: THREE.Mesh;
  name: string;
  uniforms: WindUniforms;
}
