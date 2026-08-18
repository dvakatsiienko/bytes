import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';

import type { ResidencyLayer } from '../data';

export const ContextResidency = (props: ContextResidencyProps) => {
  const layerListJSX = props.layers.map((layer, index) => {
    const itemListJSX = layer.items.map((item) => {
      return (
        <li className={itemCva({ tier: layer.tier })} key={item}>
          {item}
        </li>
      );
    });

    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={bandCva({ tier: layer.tier })}
        initial={{ opacity: 0, y: 10 }}
        key={layer.tier}
        transition={{ delay: index * 0.1, duration: 0.35 }}>
        <div className='flex items-baseline justify-between gap-3'>
          <p className='font-display font-semibold text-base tracking-tight'>
            {layer.title}
          </p>
          <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.15em]'>
            {layer.cost}
          </p>
        </div>

        <p className='mt-0.5 font-mono text-[0.65rem] text-muted-foreground'>
          {layer.when}
        </p>

        <ul className='mt-3 flex flex-wrap gap-1.5'>{itemListJSX}</ul>
      </motion.div>
    );
  });

  return (
    <section aria-label='context residency hierarchy'>
      <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
        context residency hierarchy
      </p>
      <p className='mt-1 text-muted-foreground text-sm'>
        what sits in an agent's context, and when it gets there.
      </p>

      <div className='mt-4 grid gap-2'>{layerListJSX}</div>

      <div className='mt-5 grid gap-4 sm:grid-cols-2'>
        <div className='rounded-lg border border-dashed p-4'>
          <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]'>
            listing budget · cc only
          </p>
          <p className='mt-2 text-sm'>
            the skill listing has a ceiling. past it, descriptions{' '}
            <span className='text-amber'>truncate</span>, then whole entries get{' '}
            <span className='text-amber'>dropped</span> — least-used first.
          </p>
          <div className='mt-3 flex items-end gap-1'>
            {BUDGET_BAR_LIST.map((bar) => {
              return (
                <motion.span
                  animate={{ opacity: 1 }}
                  className={budgetCva({ fate: bar.fate })}
                  initial={{ opacity: 0 }}
                  key={bar.key}
                  transition={{ delay: 0.4 + bar.key * 0.03, duration: 0.3 }}
                />
              );
            })}
          </div>
          <p className='mt-2 font-mono text-[0.6rem] text-muted-foreground'>
            kept · truncated · dropped →
          </p>
        </div>

        <div className='rounded-lg border border-dashed p-4'>
          <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]'>
            precedence
          </p>

          <div className='mt-3 grid gap-3'>
            {PRECEDENCE_LIST.map((rule) => {
              return (
                <div key={rule.label}>
                  <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.15em]'>
                    {rule.label}
                  </p>
                  <p className='mt-1 font-mono text-sm'>
                    {rule.chain.map((step, stepIndex) => {
                      return (
                        <span key={step}>
                          {stepIndex > 0 ? (
                            <span className='mx-1.5 text-mist'>&gt;</span>
                          ) : null}
                          <span
                            className={
                              stepIndex === 0 ? 'text-cobalt' : 'text-ink/70'
                            }>
                            {step}
                          </span>
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* Helpers */
const BUDGET_BAR_LIST = Array.from({ length: 24 }, (_, key) => {
  if (key < 14) {
    return { fate: 'kept', key } as const;
  }
  if (key < 19) {
    return { fate: 'truncated', key } as const;
  }
  return { fate: 'dropped', key } as const;
});

const PRECEDENCE_LIST = [
  {
    chain: ['leaf claude.md', 'root claude.md'],
    label: 'instructions — nearest wins',
  },
  {
    chain: ['enterprise', 'personal', 'project'],
    label: 'skills — outermost wins',
  },
] as const;

/* Styles */
const bandCva = cva('rounded-lg border p-4', {
  variants: {
    tier: {
      'always-resident': 'border-cobalt/40 bg-cobalt/[0.05]',
      'on-demand': 'border-dashed',
      'on-invoke': 'border-amber/40 bg-amber/[0.04]',
    },
  },
});

const itemCva = cva('rounded px-2 py-1 font-mono text-[0.7rem]', {
  variants: {
    tier: {
      'always-resident': 'bg-cobalt/10 text-cobalt',
      'on-demand': 'border border-mist text-muted-foreground',
      'on-invoke': 'bg-amber/15 text-amber',
    },
  },
});

const budgetCva = cva('w-2 rounded-[1px]', {
  variants: {
    fate: {
      dropped: 'h-2 bg-mist/40',
      kept: 'h-6 bg-cobalt',
      truncated: 'h-4 bg-amber',
    },
  },
});

/* Types */
interface ContextResidencyProps {
  layers: readonly ResidencyLayer[];
}
