import { useEffect } from 'react';
import { LevaPanel, useControls, useCreateStore } from 'leva';

import type { Settings } from '../stage/settings.ts';
import { isHex, looks } from '../stage/settings.ts';

/**
 * The leva half of the controls A/B (BYT-103): the same five settings the kit
 * panel carries — exposure, look, lens blur, blur amount, sun tint — in leva's
 * own panel, bound to the same store. Whichever side loses is deleted.
 */
export const LevaControls = (props: LevaControlsProps) => {
  const store = useCreateStore();

  const [, set] = useControls(
    () => ({
      aperture: {
        label: 'blur amount',
        max: 3,
        min: 0,
        onChange: (
          value: number,
          _path: string,
          context: { initial: boolean },
        ) => {
          if (!context.initial) props.onChange({ aperture: value });
        },
        step: 0.05,
        value: props.settings.aperture,
      },
      exposure: {
        max: 2,
        min: 0.5,
        onChange: (
          value: number,
          _path: string,
          context: { initial: boolean },
        ) => {
          if (!context.initial) props.onChange({ exposure: value });
        },
        step: 0.01,
        value: props.settings.exposure,
      },
      hasLens: {
        label: 'lens blur',
        onChange: (
          value: boolean,
          _path: string,
          context: { initial: boolean },
        ) => {
          if (!context.initial) props.onChange({ hasLens: value });
        },
        value: props.settings.hasLens,
      },
      look: {
        onChange: (
          value: Settings['look'],
          _path: string,
          context: { initial: boolean },
        ) => {
          if (!context.initial) props.onChange({ look: value });
        },
        options: [...looks],
        value: props.settings.look,
      },
      sunTint: {
        label: 'sun tint',
        onChange: (
          value: string,
          _path: string,
          context: { initial: boolean },
        ) => {
          const hex = value.toLowerCase();
          if (!context.initial && hex !== props.settings.sunTint && isHex(hex))
            props.onChange({ sunTint: hex });
        },
        value: props.settings.sunTint,
      },
    }),
    { store },
  );

  // a change made elsewhere (the kit panel, a take's settings) shows here too
  useEffect(() => {
    set({
      aperture: props.settings.aperture,
      exposure: props.settings.exposure,
      hasLens: props.settings.hasLens,
      look: props.settings.look,
      sunTint: props.settings.sunTint,
    });
  }, [
    set,
    props.settings.exposure,
    props.settings.look,
    props.settings.hasLens,
    props.settings.aperture,
    props.settings.sunTint,
  ]);

  return (
    <div className='px-4 pb-4'>
      <p className='pb-3 text-muted-foreground text-sm'>
        leva, for the A/B: the same five controls as the kit panel. switch back
        with «kit».
      </p>
      <LevaPanel fill flat hideCopyButton store={store} titleBar={false} />
    </div>
  );
};

/* Types */

interface LevaControlsProps {
  onChange: (patch: Partial<Settings>) => void;
  settings: Settings;
}
