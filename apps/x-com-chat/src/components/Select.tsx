import { useState } from 'react';
import { cva } from 'cva';
import { Button } from '@ui/kit/components/button';
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from '@ui/kit/components/select';
import useEventListener from '@use-it/event-listener';

import { SpinnerSvg } from '@/components/svg/SpinnerIcon';

export const Select = (props: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'k') {
      setIsOpen(!isOpen);
    }
  });

  const selectOptionList = props.options.map((option) => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ));

  return (
    <SelectRoot
      defaultValue={props.defaultValue}
      items={props.options}
      name={props.name}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      onValueChange={(value: string | null) => {
        if (value) props.onValueChange(value);
      }}
      open={isOpen}
      value={props.value}>
      <SelectTrigger
        className={selectTriggerCva({
          className: props.classNameTrigger,
          intent: 'textarea',
          loading: props.isLoading,
        })}
        render={<Button variant='secondary' />}>
        <SelectValue
          placeholder={props.isLoading ? <SpinnerSvg /> : 'Select...'}
        />
      </SelectTrigger>

      <SelectContent
        className={selectContentCva({
          className: props.classNameContent,
        })}>
        <SelectGroup>
          {props.label && <SelectLabel>{props.label}</SelectLabel>}
          {selectOptionList}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
};

/* Styles */
const selectTriggerCva = cva({
  base: 'grid min-w-25 grid-flow-col justify-start gap-1 px-2 text-sm leading-none md:px-2',
  variants: {
    intent: {
      textarea: 'absolute bottom-0 left-0 rounded-tl-none rounded-br-none',
    },
    loading: {
      true: 'justify-center',
    },
  },
});
const selectContentCva = cva({
  base: '',
});

/* Types */
interface SelectProps {
  classNameContent?: string;
  classNameTrigger?: string;
  defaultValue?: string;
  isLoading?: boolean;
  label?: string;
  name: string;
  onValueChange: (value: string) => void;
  options: Option[];
  value: string;
}
interface Option {
  label: string;
  value: string;
}
