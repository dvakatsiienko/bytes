import { cn } from 'cn';
import { useAtomValue } from 'jotai';

import type { StudioActions } from '../actions.ts';
import { useRoute } from '../route.ts';
import {
  motionFrameAtom,
  pixelFitAtom,
  pixelGridAtom,
  pixelZoomAtom,
} from '../state.ts';
import { BakeButton } from './bake-button';
import { Segmented } from './segmented';

/**
 * The bottom-right corner: the ways of looking at the piece, each with its
 * key, and under them the bake.
 */
export const ToolsCorner = (props: ToolsCornerProps) => {
  const { view } = useRoute();
  const isCompare = view.kind === 'compare';
  const isPlaying = view.kind === 'live' && props.actions.isPlaying;
  const isGrid = useAtomValue(pixelGridAtom);
  const pixelFit = useAtomValue(pixelFitAtom);
  const pixelZoom = useAtomValue(pixelZoomAtom);
  const motionFrame = useAtomValue(motionFrameAtom);
  const pixelTools: readonly Tool[] = [
    {
      isPressed: isGrid,
      keys: 'x',
      label: 'show or hide the pixel grid',
      run: props.actions.toggleGrid,
      short: 'grid',
    },
    {
      keys: 'l',
      label: 'back to the whole piece',
      run: props.actions.goLive,
      short: 'live',
    },
    {
      keys: 'c',
      label: 'copy the image as png',
      run: props.actions.copyImage,
      short: 'copy',
    },
  ];
  const viewTools: readonly Tool[] = [
    {
      isPressed: view.kind === 'live',
      keys: 'l',
      label: 'back to the live view',
      run: props.actions.goLive,
      short: 'live',
    },
    {
      isDisabled: isCompare,
      keys: 'z',
      label: 'zoom into the image',
      run: props.actions.zoom,
      short: 'zoom',
    },
    ...(view.kind === 'live' && props.actions.hasMotion
      ? [
          {
            isPressed: props.actions.isPlaying,
            keys: 'p',
            label: props.actions.isPlaying ? 'stop motion' : 'play motion',
            run: props.actions.togglePlay,
            short: props.actions.isPlaying ? 'stop' : 'motion',
          },
        ]
      : []),
    ...(props.actions.isStage
      ? [
          {
            keys: 'w',
            label: `readme frame: ${props.actions.readme}, press for the next`,
            run: props.actions.cycleReadme,
            short: props.actions.readme,
          },
        ]
      : []),
    {
      isDisabled: isCompare,
      keys: 'c',
      label: 'copy the image as png',
      run: props.actions.copyImage,
      short: 'copy',
    },
  ];

  const tools = props.actions.isPixelView ? pixelTools : viewTools;
  const toolListJSX = tools.map((tool) => {
    return (
      <button
        aria-label={tool.label}
        aria-pressed={tool.isPressed}
        className={cn(
          'flex h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-sm hover:bg-fill-on/60 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent',
          tool.isPressed && 'bg-fill-on font-semibold hover:bg-fill-on',
        )}
        disabled={tool.isDisabled}
        key={tool.keys}
        onClick={() => tool.run()}
        title={`${tool.label} (${tool.keys})`}
        type='button'>
        {tool.short}
        <span className='font-mono text-[12px] text-ink-muted'>
          {tool.keys}
        </span>
      </button>
    );
  });

  return (
    <div className='flex flex-col gap-2'>
      {props.actions.isPixelView ? (
        <div className='glass flex items-center gap-3 py-1 pr-1 pl-3'>
          <span className='text-sm'>zoom</span>
          <div className='flex-1'>
            <Segmented
              ariaLabel='pixel zoom'
              onValueChange={(next) =>
                props.actions.setPixelZoom(next === 'fit' ? null : Number(next))
              }
              options={pixelZoomOptions(pixelFit)}
              value={
                pixelZoom === null || pixelZoom >= pixelFit
                  ? 'fit'
                  : String(pixelZoom)
              }
            />
          </div>
        </div>
      ) : null}
      {isPlaying ? (
        <section
          aria-label='motion'
          className='glass flex flex-col gap-2 px-3.5 pt-2.5 pb-3'>
          <p className='flex items-baseline justify-between text-sm'>
            motion playing
            <span className='font-mono text-[12px] tabular-nums'>
              frame {motionFrame + 1} / {LOOP_FRAMES}
            </span>
          </p>
          <span
            aria-hidden='true'
            className='block h-0.5 rounded-full bg-key-line'>
            <span
              className='block h-full rounded-full bg-ink'
              style={{ width: `${((motionFrame + 1) / LOOP_FRAMES) * 100}%` }}
            />
          </span>
        </section>
      ) : null}
      <nav aria-label='view' className='glass flex gap-0.5 p-1'>
        {toolListJSX}
      </nav>
      <BakeButton actions={props.actions} />
    </div>
  );
};

/* Helpers */

/** a loop plays and bakes at 12 frames a second over six seconds */
export const LOOP_FRAMES = 72;

/** the largest whole zoom that fits, and the fixed steps below it */
const pixelZoomOptions = (fit: number) => [
  { label: `fit ${fit}×`, value: 'fit' },
  ...[1, 8, 24]
    .filter((step) => step < fit)
    .map((step) => {
      return { label: `${step}×`, value: String(step) };
    }),
];

/* Types */

interface Tool {
  isDisabled?: boolean;
  isPressed?: boolean;
  keys: string;
  label: string;
  run: () => void;
  short: string;
}

interface ToolsCornerProps {
  actions: StudioActions;
}
