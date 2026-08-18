import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import type { Group } from '../data';

export const TaskGroup = (props: TaskGroupProps) => {
  const totalMinutes = props.group.tasks.reduce((sum, task) => {
    return sum + task.minutes;
  }, 0);

  const taskListJSX = props.group.tasks.map((task) => {
    return (
      <li
        className='flex items-baseline justify-between gap-3 py-1.5'
        key={task.title}>
        <span
          className={
            props.group.state === 'done' ? 'text-muted-foreground' : ''
          }>
          {task.title}
        </span>
        <span className='font-mono text-mist text-xs tabular-nums'>
          {task.minutes}m
        </span>
      </li>
    );
  });

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.1 + props.index * 0.08, duration: 0.35 }}>
      <Card className={cardCva({ state: props.group.state })}>
        <CardHeader className='gap-1'>
          <p className='font-mono text-[0.65rem] text-mist tracking-[0.2em]'>
            {String(props.index + 1).padStart(2, '0')}
          </p>
          <div className='flex items-center justify-between gap-2'>
            <h2 className='font-display font-semibold text-lg tracking-tight'>
              {props.group.title}
            </h2>
            <span className={stateCva({ state: props.group.state })}>
              {props.group.state}
            </span>
          </div>
          <p className='font-mono text-muted-foreground text-xs'>
            {props.group.tasks.length} tasks · {totalMinutes}m
          </p>
        </CardHeader>
        <CardContent>
          <ul className='divide-y divide-border text-sm'>{taskListJSX}</ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* Styles */
const cardCva = cva('h-full shadow-none transition-colors', {
  variants: {
    state: {
      done: 'border-border',
      'in-flight': 'border-amber/50 bg-amber/[0.04]',
      queued: 'border-dashed',
    },
  },
});

const stateCva = cva(
  'rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em]',
  {
    variants: {
      state: {
        done: 'bg-accent text-cobalt',
        'in-flight': 'bg-amber/15 text-amber',
        queued: 'bg-muted text-muted-foreground',
      },
    },
  },
);

/* Types */
interface TaskGroupProps {
  group: Group;
  index: number;
}
