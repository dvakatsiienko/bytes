import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@ui/kit/components/toggle-group';

/**
 * The ring's segmented control: a faint ink trough, 3px inset, the pressed
 * segment one step brighter in ink. A composition over the kit toggle group,
 * never a fork of it.
 */
export const Segmented = <T extends string>(props: SegmentedProps<T>) => {
  const trough = useRef<HTMLDivElement>(null);

  // a hotkey can change the value while focus sits on the old segment; its
  // focus ring would then read as the selection, so focus follows the value
  useEffect(() => {
    const node = trough.current;
    if (!(node && props.value && node.contains(document.activeElement))) return;
    node.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
  }, [props.value]);

  const itemListJSX = props.options.map((option) => {
    return (
      <ToggleGroupItem
        aria-label={option.label}
        className='h-7 min-w-0 flex-1 gap-1.5 rounded-md px-2.5 text-ink-muted text-sm hover:bg-fill-on/60 hover:text-ink aria-pressed:bg-fill-on aria-pressed:text-ink'
        key={option.value}
        title={option.isIconOnly ? option.label : undefined}
        value={option.value}>
        {option.icon}
        {option.isIconOnly ? null : option.label}
      </ToggleGroupItem>
    );
  });

  return (
    <div className='flex items-center rounded-lg bg-fill p-[3px]' ref={trough}>
      {props.label ? (
        <span className='select-none px-1.5 text-ink-muted text-sm'>
          {props.label}
        </span>
      ) : null}
      <ToggleGroup
        aria-label={props.label ?? props.ariaLabel}
        className='flex-1'
        onValueChange={(next) => {
          const [picked] = next;
          const option = props.options.find(
            (candidate) => candidate.value === picked,
          );
          if (option) props.onValueChange(option.value);
        }}
        spacing={1}
        value={[props.value]}>
        {itemListJSX}
      </ToggleGroup>
    </div>
  );
};

/* Types */

interface SegmentedProps<T extends string> {
  /** names the group when it shows no label */
  ariaLabel?: string;
  label?: string;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  value: T;
}

interface SegmentOption<T extends string> {
  icon?: ReactNode;
  isIconOnly?: boolean;
  label: string;
  value: T;
}
