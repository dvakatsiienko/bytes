import { useState } from 'react';

import { type Memory, memoryList } from './data';
import { backlinkCount, edgeList, poolStats } from './derive';
import { ThemeScope } from './theme-scope';

const holderVar: Record<Memory['type'], string> = {
  feedback: 'var(--holder-feedback)',
  project: 'var(--holder-project)',
  reference: 'var(--holder-reference)',
  unknown: 'var(--etch)',
  user: 'var(--holder-user)',
};

const bayOrder: Memory['type'][] = ['feedback', 'project', 'reference', 'user'];

export const VariantSkill = () => {
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = hovered ?? pinned;

  const isLinked = (name: string) => {
    if (!focus || name === focus) return false;
    return edgeList.some((edge) => {
      return (
        (edge.source === focus && edge.target === name) ||
        (edge.target === focus && edge.source === name)
      );
    });
  };

  return (
    <ThemeScope initialMode='light' theme='memory-viz-b'>
      <div style={{ fontFamily: 'var(--font-strip)' }}>
        <TowerBlock />
        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
          <div className='grid content-start gap-5'>
            {bayOrder.map((type) => {
              const bayList = memoryList.filter((memory) => {
                return memory.type === type;
              });
              if (bayList.length === 0) return null;

              return (
                <Bay
                  focus={focus}
                  isLinked={isLinked}
                  key={type}
                  list={bayList}
                  onHover={setHovered}
                  onPin={setPinned}
                  pinned={pinned}
                  type={type}
                />
              );
            })}
          </div>
          <DetailPanel focusName={focus} />
        </div>
      </div>
    </ThemeScope>
  );
};

/* Parts */
const TowerBlock = () => {
  const cellList = [
    { label: 'strips racked', value: poolStats.memories },
    { label: 'cross-refs', value: poolStats.links },
    { label: 'broken refs', value: poolStats.danglingLinks },
    {
      label: 'index cover',
      value: `${Math.round((poolStats.indexed / poolStats.memories) * 100)}%`,
    },
  ];

  return (
    <div className='flex flex-wrap items-stretch justify-between gap-4 border-y-2 py-4'>
      <div>
        <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.3em]'>
          standing orders · memory pool
        </p>
        <p
          className='font-bold text-4xl uppercase leading-none tracking-tight'
          style={{ fontStretch: '75%' }}>
          dpatch control
        </p>
      </div>
      <div className='flex gap-6'>
        {cellList.map((cell) => {
          return (
            <div className='text-right' key={cell.label}>
              <p className='font-bold font-mono text-2xl leading-none'>
                {cell.value}
              </p>
              <p className='mt-1 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]'>
                {cell.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Bay = (props: BayProps) => {
  return (
    <section>
      <p className='mb-2 flex items-center gap-2 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.3em]'>
        <span
          className='inline-block h-3 w-1.5'
          style={{ background: holderVar[props.type] }}
        />
        {props.type} bay · {props.list.length}
      </p>
      <div className='grid gap-1'>
        {props.list.map((memory) => {
          const isFocus = props.focus === memory.name;
          const linked = props.isLinked(memory.name);
          const faded = props.focus && !isFocus && !linked;
          const hasDangling = memory.links.some((target) => {
            return !memoryList.some((other) => {
              return other.name === target;
            });
          });

          return (
            <button
              className='group flex w-full items-stretch text-left transition-all duration-200'
              key={memory.name}
              onClick={() => {
                props.onPin(props.pinned === memory.name ? null : memory.name);
              }}
              onMouseEnter={() => {
                props.onHover(memory.name);
              }}
              onMouseLeave={() => {
                props.onHover(null);
              }}
              style={{
                opacity: faded ? 0.45 : 1,
                transform: isFocus ? 'translateX(10px)' : undefined,
              }}
              type='button'>
              <span
                className='w-2 shrink-0'
                style={{ background: holderVar[memory.type] }}
              />
              <span
                className='flex min-w-0 flex-1 items-center gap-3 border border-l-0 bg-card px-3 py-1.5'
                style={{
                  borderColor: isFocus ? 'var(--marking)' : undefined,
                  boxShadow: linked
                    ? `inset 0 0 0 1px ${holderVar[memory.type]}`
                    : undefined,
                }}>
                <span
                  className='truncate font-semibold text-sm uppercase tracking-wide'
                  style={{ fontStretch: '80%' }}>
                  {memory.name.replaceAll('-', ' ')}
                </span>
                {hasDangling ? (
                  <span
                    className='shrink-0 font-mono text-[0.6rem] uppercase'
                    style={{ color: 'var(--alarm)' }}>
                    ⚠ ref
                  </span>
                ) : null}
                <span className='ml-auto shrink-0 font-mono text-[0.65rem] text-muted-foreground'>
                  {memory.links.length}↗ {backlinkCount(memory.name)}↙ ·{' '}
                  {memory.modified.slice(5)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

const DetailPanel = (props: { focusName: string | null }) => {
  const memory = memoryList.find((candidate) => {
    return candidate.name === props.focusName;
  });

  if (!memory) {
    return (
      <aside className='border-2 border-dashed p-6 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]'>
        hover or pin a strip
        <br />
        to read its order
      </aside>
    );
  }

  const outLinks = memory.links.map((target) => {
    return {
      exists: memoryList.some((other) => {
        return other.name === target;
      }),
      target,
    };
  });
  const inLinks = edgeList.filter((edge) => {
    return edge.target === memory.name;
  });

  return (
    <aside className='h-fit border-2 bg-card'>
      <div
        className='px-5 py-4'
        style={{ borderTop: `6px solid ${holderVar[memory.type]}` }}>
        <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.3em]'>
          {memory.type} · {memory.modified} · {memory.body} words
        </p>
        <p
          className='mt-1 font-bold text-2xl uppercase leading-tight'
          style={{ fontStretch: '75%' }}>
          {memory.name.replaceAll('-', ' ')}
        </p>
        <p className='mt-3 text-sm leading-relaxed'>{memory.description}</p>
      </div>

      <div className='border-t px-5 py-4'>
        <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.3em]'>
          refs out · {outLinks.length}
        </p>
        {outLinks.map((link) => {
          return (
            <p className='mt-1.5 font-mono text-xs' key={link.target}>
              {link.exists ? '↗' : '⚠'} {link.target}
              {link.exists ? null : (
                <span style={{ color: 'var(--alarm)' }}> — no such strip</span>
              )}
            </p>
          );
        })}
        {outLinks.length === 0 ? (
          <p className='mt-1.5 font-mono text-muted-foreground text-xs'>none</p>
        ) : null}
      </div>

      <div className='border-t px-5 py-4'>
        <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.3em]'>
          refs in · {inLinks.length}
        </p>
        {inLinks.map((edge) => {
          return (
            <p className='mt-1.5 font-mono text-xs' key={edge.source}>
              ↙ {edge.source}
            </p>
          );
        })}
        {inLinks.length === 0 ? (
          <p className='mt-1.5 font-mono text-muted-foreground text-xs'>none</p>
        ) : null}
      </div>
    </aside>
  );
};

/* Types */
interface BayProps {
  focus: string | null;
  isLinked: (name: string) => boolean;
  list: Memory[];
  onHover: (name: string | null) => void;
  onPin: (name: string | null) => void;
  pinned: string | null;
  type: Memory['type'];
}
