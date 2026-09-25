import type * as React from 'react';
import { useRef, useState } from 'react';
import { Input } from '@ui/kit/components/input';
import { cn } from 'cn';

// The whole text must be a plain decimal: no exponent, no hex, no stray letters.
// `Number()` alone would take `1e3` and `0x10`, which nobody types on purpose.
const DECIMAL = /^[-+]?(\d+\.?\d*|\.\d+)$/;

const parse = (text: string) =>
  DECIMAL.test(text.trim()) ? Number(text) : null;

const decimalsOf = (step: number) =>
  Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * A numeric text field that applies a value only when the whole text is a
 * number, so a slip like `xfasdf1.00` never reaches the value, and an edit that
 * ends invalid restores the last confirmed value. ↑/↓ step, shift ×10,
 * alt ×0.1; Escape goes back to the last confirmed value too.
 */
function NumberField({
  value,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  className,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  // what a rejected edit falls back to: the value at focus, then every value
  // confirmed since — by enter, by an arrow step, by a valid blur
  const confirmed = useRef(value);
  // An alt-step can land finer than `step`; show it rather than round it away.
  const format = (n: number) => {
    const fixed = n.toFixed(decimalsOf(step));
    return Number(fixed) === n ? fixed : String(n);
  };
  const isInvalid = draft !== null && parse(draft) === null;

  const commit = (next: number, precision: number) => {
    const rounded = Number(clamp(next, min, max).toFixed(precision));
    if (rounded !== value) onValueChange(rounded);
    return rounded;
  };

  /** ends an edit: invalid text falls back to the last confirmed value, valid text becomes it */
  const settle = () => {
    const parsed = draft === null ? null : parse(draft);
    if (isInvalid) commit(confirmed.current, decimalsOf(step) + 2);
    else if (parsed !== null)
      confirmed.current = commit(parsed, decimalsOf(step) + 2);
    setDraft(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value;
    setDraft(text);
    const parsed = parse(text);
    if (parsed !== null) commit(parsed, decimalsOf(step) + 2);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      commit(confirmed.current, decimalsOf(step) + 2);
      setDraft(null);
      return;
    }
    if (event.key === 'Enter') {
      settle();
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    let scale = 1;
    if (event.shiftKey) scale = 10;
    else if (event.altKey) scale = 0.1;
    const direction = event.key === 'ArrowUp' ? 1 : -1;
    const base = draft === null ? value : (parse(draft) ?? value);
    confirmed.current = commit(
      base + direction * step * scale,
      decimalsOf(step * scale),
    );
    setDraft(null);
  };

  return (
    <Input
      aria-invalid={isInvalid || undefined}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuenow={value}
      autoComplete='off'
      className={cn('font-mono tabular-nums', className)}
      data-slot='number-field'
      inputMode='decimal'
      onBlur={(event) => {
        // an edit that ends invalid is rejected whole: a valid prefix typed on
        // the way (`1.3` of `1.3xf`) never survives it
        settle();
        onBlur?.(event);
      }}
      onChange={handleChange}
      onFocus={(event) => {
        confirmed.current = value;
        onFocus?.(event);
      }}
      onKeyDown={handleKeyDown}
      role='spinbutton'
      spellCheck={false}
      value={draft ?? format(value)}
      {...props}
    />
  );
}

export { NumberField };

/* Types */

interface NumberFieldProps
  extends Omit<
    React.ComponentProps<'input'>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'
  > {
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}
