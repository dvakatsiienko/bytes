import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';

import { palettes } from '../../art/palette.ts';
import type { Time } from '../../art/time.ts';
import type { Stage } from '../stage/build.ts';
import { buildScene, cameraDistance } from '../stage/build.ts';
import { createRenderer, fov } from '../stage/renderer.ts';
import type { SceneSpec } from '../stage/scenes.ts';
import type { Settings } from '../stage/settings.ts';

/** one loop of the motion lasts six seconds */
const LOOP_SECONDS = 6;

/**
 * The lit stage. Renders on demand: a frame runs when a setting, the size or
 * the scene changes, and a continuous loop runs only while play is on. A
 * setting change re-applies uniforms and lights; only the scene, the time of
 * day or the seed rebuilds the sheets.
 */
export const StageCanvas = (props: StageCanvasProps) => {
  return (
    <Canvas
      camera={{ far: 100, fov, near: 0.1, position: [0, 0, cameraDistance] }}
      dpr={props.dpr ?? [1, 2]}
      flat
      frameloop={props.isPlaying ? 'always' : 'demand'}
      gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <StageDriver {...props} />
    </Canvas>
  );
};

const StageDriver = (props: StageCanvasProps) => {
  const three = useThree();
  const renderer = useMemo(
    () => createRenderer(three.gl, three.camera as PerspectiveCamera),
    [three.gl, three.camera],
  );
  const settings = useRef(props.settings);
  const current = useRef<Stage | null>(null);
  const pendingSignal = useRef<string | null>(null);
  const clock = useRef(0);
  const onRendered = useRef(props.onRendered);
  const onProgress = useRef(props.onProgress);
  const onError = useRef(props.onError);
  const { invalidate } = three;

  useEffect(() => {
    onRendered.current = props.onRendered;
    onProgress.current = props.onProgress;
    onError.current = props.onError;
  });

  useEffect(
    () => () => {
      current.current?.dispose();
      current.current = null;
      renderer.dispose();
    },
    [renderer],
  );

  useEffect(() => {
    let isCancelled = false;
    const label = `${props.pieceId}:${props.time}`;
    buildScene(
      props.spec,
      palettes[props.time],
      props.settings.seed,
      (done, total) => onProgress.current?.(done, total),
    )
      .then((stage) => {
        if (isCancelled) {
          stage.dispose();
          return;
        }
        // the old stage stays on screen until the new one is ready, then goes
        const previous = current.current;
        current.current = stage;
        renderer.setStage(stage, props.time === 'night');
        renderer.apply(settings.current);
        previous?.dispose();
        pendingSignal.current = label;
        onProgress.current?.(1, 1);
        invalidate();
      })
      .catch((error: unknown) => {
        if (!isCancelled)
          onError.current?.(
            error instanceof Error ? error.message : String(error),
          );
      });
    return () => {
      isCancelled = true;
    };
  }, [
    renderer,
    props.spec,
    props.pieceId,
    props.time,
    props.settings.seed,
    invalidate,
  ]);

  useEffect(() => {
    settings.current = props.settings;
    renderer.apply(props.settings);
    invalidate();
  }, [renderer, props.settings, invalidate]);

  useEffect(() => {
    renderer.setSize(three.size.width, three.size.height, three.viewport.dpr);
    invalidate();
  }, [
    renderer,
    three.size.width,
    three.size.height,
    three.viewport.dpr,
    invalidate,
  ]);

  useFrame((_state, delta) => {
    if (props.isPlaying)
      clock.current = (clock.current + delta / LOOP_SECONDS) % 1;
    const isDrawn = renderer.render(settings.current, clock.current);
    if (isDrawn && pendingSignal.current) {
      onRendered.current?.(pendingSignal.current);
      pendingSignal.current = null;
    }
  }, 1);

  return null;
};

/* Types */

interface StageCanvasProps {
  /** a fixed pixel ratio for a bake; live, r3f picks 1–2 from the display */
  dpr?: number;
  isPlaying: boolean;
  onError?: (message: string) => void;
  onProgress?: (done: number, total: number) => void;
  onRendered?: (label: string) => void;
  pieceId: string;
  settings: Settings;
  spec: SceneSpec;
  time: Time;
}
