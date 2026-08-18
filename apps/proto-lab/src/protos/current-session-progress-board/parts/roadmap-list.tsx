import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';

import type { RoadmapItem } from '../data';

export const RoadmapList = (props: RoadmapListProps) => {
  const doneCount = props.items.filter((item) => {
    return item.state === 'done';
  }).length;

  const itemListJSX = props.items.map((item, index) => {
    return (
      <motion.li
        animate={{ opacity: 1, x: 0 }}
        className='flex items-baseline gap-3'
        initial={{ opacity: 0, x: -6 }}
        key={item.label}
        transition={{ delay: index * 0.04, duration: 0.25 }}>
        <span className={boxCva({ state: item.state })}>
          {item.state === 'done' ? '✓' : null}
        </span>
        <span className={labelCva({ state: item.state })}>{item.label}</span>
        {item.note ? (
          <span className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.15em]'>
            {item.note}
          </span>
        ) : null}
      </motion.li>
    );
  });

  return (
    <section aria-label='roadmap'>
      <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
        roadmap · {doneCount}/{props.items.length}
      </p>

      <ul className='mt-3 grid gap-2'>{itemListJSX}</ul>
    </section>
  );
};

/* Styles */
const boxCva = cva(
  'flex size-4 shrink-0 translate-y-[2px] items-center justify-center rounded-[3px] font-mono text-[0.6rem] leading-none',
  {
    variants: {
      state: {
        done: 'bg-cobalt text-white',
        'in-flight': 'border-2 border-amber bg-amber/15',
        queued: 'border border-mist',
      },
    },
  },
);

const labelCva = cva('text-sm', {
  variants: {
    state: {
      done: 'text-muted-foreground line-through',
      'in-flight': 'font-medium',
      queued: '',
    },
  },
});

/* Types */
interface RoadmapListProps {
  items: readonly RoadmapItem[];
}
