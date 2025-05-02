/* Core */
import { useState } from 'react';
import * as SelectRadix from '@radix-ui/react-select';
import useEventListener from '@use-it/event-listener';
import { cva } from 'cva';

/* Components */
import {
    SelectRoot,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SpinnerSvg } from '@/components/svg/SpinnerIcon';

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
            name={props.name ?? 'select'}
            open={isOpen}
            onOpenChange={(open: boolean) => setIsOpen(open)}
            defaultValue={props.defaultValue}
            value={props.value ?? void 0}
            onValueChange={props.onValueChange}>
            <Button variant='secondary' asChild>
                <SelectTrigger
                    className={selectTriggerCva({
                        intent: 'textarea',
                        loading: props.isLoading,
                        className: props.classNameTrigger,
                    })}>
                    <SelectValue placeholder={props.isLoading ? <SpinnerSvg /> : 'Select...'} />
                </SelectTrigger>
            </Button>

            <SelectContent className={selectContentCva({ className: props.classNameContent })}>
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
