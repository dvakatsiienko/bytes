import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';

import type { TaskState } from '@/protos/current/data';

export const SessionRail = (props: SessionRailProps) => {
  const doneCount = props.ticks.filter((tick) => {
    return tick === 'done';
  }).length;
  const percent = Math.round((doneCount / props.ticks.length) * 100);

  const tickListJSX = props.ticks.map((state, index) => {
    return (
      <motion.span
        animate={{ opacity: 1, scaleY: 1 }}
        className={tickCva({ state })}
        initial={{ opacity: 0, scaleY: 0.3 }}
        // biome-ignore lint/suspicious/noArrayIndexKey: ticks are a positional sequence
        key={index}
        transition={{ delay: 0.25 + index * 0.02, duration: 0.25 }}
      />
    );
  });

  return (
    <section aria-label='session progress'>
      <div className='flex items-end justify-between gap-6'>
        <div>
          <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
            started {props.startedAt} · {props.label}
          </p>
          <p className='font-display font-semibold text-5xl tabular-nums tracking-tight'>
            {doneCount}
            <span className='text-mist'>/{props.ticks.length}</span>
          </p>
        </div>
        <p className='font-mono text-3xl text-cobalt tabular-nums'>
          {percent}%
        </p>
      </div>

      <div className='mt-5 flex h-9 items-stretch gap-[3px]'>{tickListJSX}</div>

      <div className='mt-3 flex gap-5 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.15em]'>
        <span className='text-cobalt'>■ done</span>
        <span className='text-amber'>■ in flight</span>
        <span className='text-mist'>□ queued</span>
      </div>
    </section>
  );
};

/* Styles */
const tickCva = cva('flex-1 origin-bottom rounded-[2px]', {
  variants: {
    state: {
      done: 'bg-cobalt',
      'in-flight': 'bg-amber',
      queued: 'border border-mist/50 bg-mist/15',
    },
  },
});

/* Types */
interface SessionRailProps {
  label: string;
  startedAt: string;
  ticks: readonly TaskState[];
}
