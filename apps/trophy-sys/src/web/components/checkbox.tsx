/**
 * A real checkbox wearing a terminal glyph — the kit ships none, and the box
 * this page wants is `[x]`/`[ ]` rather than a rounded tick. The input stays in
 * the tree and only the paint is ours, so the keyboard, the label association
 * and the accessibility tree are the platform's.
 *
 * The same bracket glyph carries every binary state on /admin — a row's
 * hidden flag reads `[x] hidden` from this alphabet, not from a second one.
 */
export const Checkbox = (props: CheckboxProps) => {
  return (
    <label
      className={`group flex w-fit items-baseline gap-2 text-[13px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-orange ${
        props.disabled
          ? 'cursor-not-allowed text-mute'
          : 'cursor-pointer text-fg-soft hover:text-fg'
      }`}>
      <input
        checked={props.checked}
        className='sr-only'
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.checked)}
        type='checkbox'
      />
      <span
        aria-hidden='true'
        className={`shrink-0 transition-colors ${glyphTone(props.checked, props.disabled)}`}>
        {props.checked ? '[x]' : '[ ]'}
      </span>
      {props.label}
    </label>
  );
};

/* Helpers */

/** Checked is the accent; unchecked stays dim but answers a hover. */
const glyphTone = (checked: boolean, disabled?: boolean) => {
  if (disabled) return 'text-mute';
  if (checked) return 'text-orange';

  return 'text-dim group-hover:text-fg-soft';
};

/* Types */
interface CheckboxProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}
