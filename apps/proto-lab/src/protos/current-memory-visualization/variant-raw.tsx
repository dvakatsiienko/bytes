import { useState } from 'react';

import { memoryList } from './data';
import {
  backlinkCount,
  degree,
  edgeList,
  poolStats,
  typeColorVar,
} from './derive';
import { ThemeScope } from './theme-scope';

export const VariantRaw = () => {
  const [focus, setFocus] = useState<string | null>(null);

  return (
    <ThemeScope>
      <div className='grid gap-8'>
        <StatStrip />
        <Spectrum />
        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
          <Constellation focus={focus} onFocus={setFocus} />
          <Roster focus={focus} onFocus={setFocus} />
        </div>
      </div>
    </ThemeScope>
  );
};

/* Parts */
const StatStrip = () => {
  const statList = [
    { label: 'memories', value: poolStats.memories },
    { label: 'wikilinks', value: poolStats.links },
    { label: 'dangling', value: poolStats.danglingLinks },
    { label: 'orphans', value: poolStats.orphans },
    {
      label: 'indexed',
      value: `${Math.round((poolStats.indexed / poolStats.memories) * 100)}%`,
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-5'>
      {statList.map((stat) => {
        return (
          <div className='bg-card px-4 py-3' key={stat.label}>
            <p className='font-mono text-3xl'>{stat.value}</p>
            <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest'>
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const Spectrum = () => {
  return (
    <div>
      <div className='flex h-2 overflow-hidden rounded-full'>
        {poolStats.types.map(([type, count]) => {
          return (
            <div
              key={type}
              style={{
                background: typeColorVar[type as keyof typeof typeColorVar],
                width: `${(count / poolStats.memories) * 100}%`,
              }}
            />
          );
        })}
      </div>
      <div className='mt-2 flex gap-5 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest'>
        {poolStats.types.map(([type, count]) => {
          return (
            <span className='flex items-center gap-1.5' key={type}>
              <span
                className='inline-block size-2 rounded-full'
                style={{
                  background: typeColorVar[type as keyof typeof typeColorVar],
                }}
              />
              {type} {count}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const SIZE = 520;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 70;

// Circular layout, grouped by type so the color bands read as arcs.
const orderedList = [...memoryList].sort((a, b) => {
  return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
});
const nodePosition = new Map(
  orderedList.map((memory, index) => {
    const angle = (index / orderedList.length) * Math.PI * 2 - Math.PI / 2;
    return [
      memory.name,
      {
        x: CENTER + Math.cos(angle) * RADIUS,
        y: CENTER + Math.sin(angle) * RADIUS,
      },
    ];
  }),
);

const Constellation = (props: FocusProps) => {
  const isDim = (name: string) => {
    if (!props.focus) return false;
    if (name === props.focus) return false;
    return !edgeList.some((edge) => {
      return (
        (edge.source === props.focus && edge.target === name) ||
        (edge.target === props.focus && edge.source === name)
      );
    });
  };

  return (
    <div className='rounded-lg border bg-card p-4'>
      <p className='mb-2 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest'>
        link constellation — hover a node
      </p>
      <svg
        aria-label='memory link graph'
        className='w-full'
        role='img'
        viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <title>memory link graph</title>
        {edgeList.map((edge) => {
          const from = nodePosition.get(edge.source);
          const to = nodePosition.get(edge.target);
          if (!from) return null;
          const active =
            props.focus === edge.source || props.focus === edge.target;
          let edgeOpacity = 0.3;
          if (props.focus) {
            edgeOpacity = active ? 0.9 : 0.08;
          }

          if (!to) {
            // Dangling link — a short ray into the void.
            return (
              <line
                key={`${edge.source}→${edge.target}`}
                stroke='var(--ember)'
                strokeDasharray='3 4'
                strokeWidth={active ? 2 : 1}
                x1={from.x}
                x2={from.x + (from.x - CENTER) * 0.25}
                y1={from.y}
                y2={from.y + (from.y - CENTER) * 0.25}
              />
            );
          }
          return (
            <path
              d={`M ${from.x} ${from.y} Q ${CENTER} ${CENTER} ${to.x} ${to.y}`}
              fill='none'
              key={`${edge.source}→${edge.target}`}
              opacity={edgeOpacity}
              stroke='var(--pulse)'
              strokeWidth={active ? 1.8 : 1}
            />
          );
        })}
        {orderedList.map((memory) => {
          const pos = nodePosition.get(memory.name);
          if (!pos) return null;
          const dim = isDim(memory.name);
          const labelLeft = pos.x < CENTER;

          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: hover-only focus in a throwaway proto
            <g
              key={memory.name}
              onMouseEnter={() => {
                props.onFocus(memory.name);
              }}
              onMouseLeave={() => {
                props.onFocus(null);
              }}
              opacity={dim ? 0.25 : 1}>
              <circle
                cx={pos.x}
                cy={pos.y}
                fill={typeColorVar[memory.type]}
                r={4 + degree(memory) * 1.2}
              />
              <text
                fill='var(--dim)'
                fontFamily='var(--font-mono)'
                fontSize={9}
                textAnchor={labelLeft ? 'end' : 'start'}
                x={pos.x + (labelLeft ? -12 : 12)}
                y={pos.y + 3}>
                {memory.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const Roster = (props: FocusProps) => {
  return (
    <div className='rounded-lg border bg-card'>
      <p className='border-b px-4 py-3 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest'>
        roster — newest first
      </p>
      <ul className='max-h-[520px] divide-y overflow-y-auto'>
        {[...memoryList]
          .sort((a, b) => {
            return b.modified.localeCompare(a.modified);
          })
          .map((memory) => {
            return (
              // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover-only focus in a throwaway proto
              <li
                className={`px-4 py-2.5 transition-opacity ${
                  props.focus && props.focus !== memory.name ? 'opacity-40' : ''
                }`}
                key={memory.name}
                onMouseEnter={() => {
                  props.onFocus(memory.name);
                }}
                onMouseLeave={() => {
                  props.onFocus(null);
                }}>
                <div className='flex items-center gap-2'>
                  <span
                    className='size-2 shrink-0 rounded-full'
                    style={{ background: typeColorVar[memory.type] }}
                  />
                  <span className='font-mono text-sm'>{memory.name}</span>
                  <span className='ml-auto font-mono text-[0.65rem] text-muted-foreground'>
                    {memory.links.length}→ · {backlinkCount(memory.name)}← ·{' '}
                    {memory.modified.slice(5)}
                  </span>
                </div>
                <p className='mt-1 line-clamp-1 text-muted-foreground text-xs'>
                  {memory.description}
                </p>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

/* Types */
interface FocusProps {
  focus: string | null;
  onFocus: (name: string | null) => void;
}
