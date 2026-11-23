import { useState } from 'react';

import { Info } from '@/components/Info.tsx';

import { type Limit, typed } from '@/limits.ts';

// a millisecond setting: a slider to feel it out, a number box to type it exactly; both edit the same value
export const MsSetting = (props: MsSettingProps) => {
  return (
    <div className='flex items-center gap-2 text-sm text-muted'>
      <span className='flex items-center gap-1 whitespace-nowrap'>
        {props.label}
        <Info below text={props.info} />
      </span>
      <input
        aria-label={`${props.label} slider`}
        className='h-6 w-28 min-w-0 lg:w-32 xl:w-40'
        max={props.limit.maximum}
        min={props.limit.minimum}
        onChange={(event) => props.onChange(Number(event.target.value))}
        step={1}
        type='range'
        value={props.value}
      />
      <MsBox {...props} label={`${props.label} in ms`} />
      <span>ms</span>
    </div>
  );
};

// a half-typed or cleared box holds its text while the caret is in it, and the setting keeps its last good value
export const MsBox = (props: MsBoxProps) => {
  const [text, setText] = useState<string>();
  return (
    <input
      aria-label={props.label}
      className={`${props.className ?? 'w-16'} rounded-md border border-line bg-surface px-2 py-1 text-right text-sm tabular-nums text-ink`}
      max={props.limit.maximum}
      min={props.limit.minimum}
      onBlur={() => setText(undefined)}
      onChange={(event) => {
        setText(event.target.value);
        const value = typed(event.target.value, props.limit);
        if (value !== undefined) props.onChange(value);
      }}
      step={props.step ?? 1}
      type='number'
      value={text ?? props.value}
    />
  );
};

/* Types */
interface MsBoxProps {
  className?: string;
  label: string;
  limit: Limit;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}

interface MsSettingProps extends MsBoxProps {
  info: string;
}
