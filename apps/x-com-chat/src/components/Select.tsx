import { useState } from 'react';
import { cva } from 'cva';
import * as SelectRadix from '@radix-ui/react-select';
import useEventListener from '@use-it/event-listener';

import { SpinnerSvg } from '@/components/svg/SpinnerIcon';
import { Button } from '@/components/ui/button';
import {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectRoot,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const Select = (props: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (e.metaKey && e.shiftKey && e.key === 'k') {
            setIsOpen(!isOpen);
        }
    });

    const selectOptionList = props.options?.map((option) => (
        <SelectItem key={option.value} value={option.value}>
            {option.label}
        </SelectItem>
    ));

    return (
        <SelectRoot
            defaultValue={props.defaultValue}
            name={props.name ?? 'select'}
            onOpenChange={(open: boolean) => setIsOpen(open)}
            onValueChange={props.onValueChange}
            open={isOpen}
            value={props.value ?? void 0}>
            <Button asChild variant='secondary'>
                <SelectTrigger
                    className={selectTriggerCva({
                        className: props.classNameTrigger,
                        intent: 'textarea',
                        loading: props.isLoading,
                    })}>
                    <SelectValue
                        placeholder={
                            props.isLoading ? <SpinnerSvg /> : 'Select...'
                        }
                    />
                </SelectTrigger>
            </Button>

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
            textarea:
                'absolute bottom-0 left-0 rounded-tl-none rounded-br-none',
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
    name: string;
    options: Option[];
    value: string;
    defaultValue?: string;
    onValueChange: SelectRadix.SelectProps['onValueChange'];
    classNameContent?: string;
    classNameTrigger?: string;
    isLoading?: boolean;
    label?: string;
}
interface Option {
    label: string;
    value: string;
}
