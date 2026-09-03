'use client';

/* Core */
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useRifm } from 'rifm';
import { createNumberFormatter } from 'rifm/number';

export const AmountInput = (props: AmountInputProps) => {
  const field = useRifm({
    ...usdFormatter,
    onChange: props.onChange,
    value: props.value,
  });

  return (
    <input
      aria-describedby='amount-error'
      className='peer block w-full border border-rule py-2 pl-10 text-sm outline-2 placeholder:text-ink-soft'
      id='amount'
      inputMode='decimal'
      onBlur={props.onBlur}
      placeholder='Enter USD amount'
      type='text'
      {...field}
    />
  );
};

export const AmountInputIcon = () => {
  return (
    <CurrencyDollarIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-ink' />
  );
};

/* Helpers */
const usdFormatter = createNumberFormatter({
  locales: 'en-US',
  maximumFractionDigits: 2,
});

/* Types */
interface AmountInputProps {
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
}
