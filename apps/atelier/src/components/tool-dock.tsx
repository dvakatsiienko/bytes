import { cn } from 'cn';

import type { StudioActions } from '../actions.ts';
import { useRoute } from '../route.ts';
import { BakeButton } from './bake-button';

/**
 * The bottom-right corner: the ways of looking at the piece, each with its
 * key, and under them the bake.
 */
export const ToolDock = (props: ToolDockProps) => {
  const { view } = useRoute();
  const isCompare = view.kind === 'compare';
  const tools = [
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

  const toolListJSX = tools.map((tool) => {
    return (
      <button
        aria-label={tool.label}
        aria-pressed={'isPressed' in tool ? tool.isPressed : undefined}
        className={cn(
          'flex h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-sm hover:bg-fill-on/60 disabled:cursor-not-allowed disabled:text-ink-muted disabled:hover:bg-transparent',
          'isPressed' in tool &&
            tool.isPressed &&
            'bg-fill-on hover:bg-fill-on',
        )}
        disabled={'isDisabled' in tool && tool.isDisabled}
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
      <nav aria-label='view' className='glass flex gap-0.5 p-1'>
        {toolListJSX}
      </nav>
      <BakeButton actions={props.actions} />
    </div>
  );
};

/* Types */

interface ToolDockProps {
  actions: StudioActions;
}
