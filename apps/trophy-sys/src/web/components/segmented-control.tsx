import { Fragment } from 'react';

/**
 * One bordered unit with dot separators — the same instrument shape the theme
 * toggle uses, deliberately unlike the nav buttons, which are separate boxes.
 * Real radios, so arrow keys move between the options.
 */
export const SegmentedControl = <Value extends string>(
  props: SegmentedControlProps<Value>,
) => {
  const optionListJSX = props.options.map((option, index) => {
    const isActive = option.value === props.value;

    return (
      <Fragment key={option.value}>
        {index > 0 && (
          <span aria-hidden='true' className='text-line'>
            •
          </span>
        )}
        <label
          className={`cursor-pointer px-1.5 text-[10px] uppercase tracking-[0.1em] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-orange ${
            isActive ? 'text-orange' : 'text-dim hover:text-fg-soft'
          }`}>
          <input
            checked={isActive}
            className='sr-only'
            name={props.name}
            onChange={() => props.onChange(option.value)}
            type='radio'
            value={option.value}
          />
          {option.label}
        </label>
      </Fragment>
    );
  });

  return (
    <div
      aria-label={props.label}
      className='flex shrink-0 items-center border border-line px-1.5 py-0.5'
      role='radiogroup'>
      {optionListJSX}
    </div>
  );
};

/* Types */
interface SegmentedControlProps<Value extends string> {
  /** Accessible name for the group. */
  label: string;
  /** Radio group name — must differ between two controls on one page. */
  name: string;
  onChange: (value: Value) => void;
  options: readonly { label: string; value: Value }[];
  value: Value;
}
